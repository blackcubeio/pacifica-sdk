import type { PacificaClient, WebSocketFactory, WebSocketLike } from '../common/config';
import {
  ACTION_TIMEOUT_MS,
  IDLE_TIMEOUT_MS,
  RECONNECT_BASE_MS,
  RECONNECT_CAP_MS,
  RECONNECT_FACTOR,
  RECONNECT_JITTER,
  RECONNECT_STABLE_MS,
  WS_HEARTBEAT_INTERVAL,
} from '../common/constants';
import type {
  BatchAction,
  CancelAllOrdersRef,
  CancelOrderRef,
  CandleInterval,
  CreateLimitOrderParams,
  CreateMarketOrderParams,
  EditOrderRef,
} from '../common/native';
import { type JsonObject, type JsonValue, OperationType } from '../common/types';
import type { StreamHandler, Unsubscribe, WsClientOptions } from '../common/ws';
import { resolveReadNetwork } from '../rest/client';
import { buildSignedBatchActions } from '../rest/orders/batch-order';
import {
  buildCancelAllOrdersPayload,
  buildCancelOrderPayload,
  buildEditOrderPayload,
  buildLimitOrderPayload,
  buildMarketOrderPayload,
} from '../rest/orders/payloads';
import { buildSignedRequest, resolveSigner } from '../rest/signing';
import { SubscriptionBatcher } from './subscription-batcher';

/** `WebSocket.OPEN` (readyState) — la frame n'est émise que dans cet état. */
const OPEN = 1;

/** Action signée en vol (attente d'ack par `id`) ; `timer` arme le timeout individuel. */
interface PendingAction {
  resolve: (value: JsonValue) => void;
  reject: (reason: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class WsClient {
  public onMessage: ((message: JsonValue) => void) | null = null;
  public onError: ((error: unknown) => void) | null = null;
  public onClose: (() => void) | null = null;
  public onReconnect: (() => void) | null = null;

  private readonly client: PacificaClient;
  private readonly url: string;
  private readonly createSocket: WebSocketFactory;
  private readonly label: string | undefined;
  private socket: WebSocketLike | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private stableTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly pending = new Map<string, PendingAction>();
  private readonly handlers = new Map<string, Set<StreamHandler>>();
  private readonly activeSubscriptions = new Map<string, JsonObject>();
  private readonly batcher: SubscriptionBatcher;
  private shouldReconnect = false;
  /** Actions signées émises avant l'ouverture du socket, rejouées à `onopen` (connexion paresseuse). */
  private pendingSends: string[] = [];
  private open = false;

  constructor(client: PacificaClient, options: WsClientOptions = {}) {
    this.client = client;
    this.url = options.url ?? client.wsUrls[resolveReadNetwork(client, options.label)];
    this.createSocket = options.webSocket ?? client.webSocket;
    this.label = options.label;
    this.batcher = new SubscriptionBatcher(
      (frame) => this.rawSend(frame),
      (names) => ({ method: 'subscribe', params: JSON.parse(names[0] ?? '{}') as JsonObject }),
      (names) => ({ method: 'unsubscribe', params: JSON.parse(names[0] ?? '{}') as JsonObject }),
    );
  }

  public connect(): Promise<void> {
    this.shouldReconnect = true;
    return new Promise((resolve, reject) => {
      const socket = this.createSocket(this.url);
      this.socket = socket;
      socket.onopen = () => {
        this.open = true;
        for (const payload of this.pendingSends) {
          socket.send(payload);
        }
        this.pendingSends = [];
        this.batcher.setOpen(true);
        this.startHeartbeat();
        this.bumpIdle();
        // Reset du compteur de backoff après une connexion stable (pas dès `onopen` :
        // une socket qui claque aussitôt ne doit pas reboucler à 500 ms sans grimper).
        this.stableTimer = setTimeout(() => {
          this.reconnectAttempts = 0;
          this.stableTimer = null;
        }, RECONNECT_STABLE_MS);
        resolve();
      };
      socket.onmessage = (event) => this.handleMessage(event.data);
      socket.onerror = (error) => {
        if (this.onError !== null) {
          this.onError(error);
        }
        this.rejectAllPending('WebSocket fermé : requête en vol annulée');
        reject(error);
      };
      socket.onclose = () => this.handleClose();
    });
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.open = false;
    this.pendingSends = [];
    this.stopHeartbeat();
    this.stopIdleTimer();
    this.clearStableTimer();
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.batcher.reset();
    this.batcher.setOpen(false);
    this.rejectAllPending('WebSocket fermé : requête en vol annulée');
    if (this.socket !== null) {
      this.socket.close();
      this.socket = null;
    }
  }

  public subscribe(params: JsonObject): void {
    this.activeSubscriptions.set(JSON.stringify(params), params);
    this.batcher.subscribe(JSON.stringify(params));
  }

  public unsubscribe(params: JsonObject): void {
    this.activeSubscriptions.delete(JSON.stringify(params));
    this.batcher.unsubscribe(JSON.stringify(params));
  }

  public sendAction<TResult extends JsonValue = JsonValue>(params: JsonObject): Promise<TResult> {
    const id = globalThis.crypto.randomUUID();
    return new Promise<TResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error('WebSocket : délai dépassé en attente de la réponse'));
      }, ACTION_TIMEOUT_MS);
      this.pending.set(id, { resolve: resolve as (value: JsonValue) => void, reject, timer });
      this.send({ id, params });
    });
  }

  public startHeartbeat(intervalMs: number = WS_HEARTBEAT_INTERVAL): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => this.send({ method: 'ping' }), intervalMs);
  }

  public stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public subscribePrices(handler: StreamHandler): Unsubscribe {
    return this.subscribeChannel('prices', { source: 'prices' }, handler);
  }

  public subscribeOrderbook(
    params: { symbol: string; aggLevel?: number },
    handler: StreamHandler,
  ): Unsubscribe {
    const subscription: JsonObject = { source: 'book', symbol: params.symbol };
    if (params.aggLevel !== undefined) {
      subscription.agg_level = params.aggLevel;
    }
    return this.subscribeChannel('book', subscription, handler);
  }

  public subscribeBbo(params: { symbol: string }, handler: StreamHandler): Unsubscribe {
    return this.subscribeChannel('bbo', { source: 'bbo', symbol: params.symbol }, handler);
  }

  public subscribeTrades(params: { symbol: string }, handler: StreamHandler): Unsubscribe {
    return this.subscribeChannel('trades', { source: 'trades', symbol: params.symbol }, handler);
  }

  public subscribeCandle(
    params: { symbol: string; interval: CandleInterval },
    handler: StreamHandler,
  ): Unsubscribe {
    return this.subscribeChannel(
      'candle',
      { source: 'candle', symbol: params.symbol, interval: params.interval },
      handler,
    );
  }

  public subscribeMarkPriceCandle(
    params: { symbol: string; interval: CandleInterval },
    handler: StreamHandler,
  ): Unsubscribe {
    return this.subscribeChannel(
      'mark_price_candle',
      { source: 'mark_price_candle', symbol: params.symbol, interval: params.interval },
      handler,
    );
  }

  public subscribeAccountInfo(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribeAccount('account_info', handler, account);
  }

  public subscribeAccountPositions(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribeAccount('account_positions', handler, account);
  }

  public subscribeAccountMargin(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribeAccount('account_margin', handler, account);
  }

  public subscribeAccountLeverage(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribeAccount('account_leverage', handler, account);
  }

  public subscribeAccountOrderUpdates(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribeAccount('account_order_updates', handler, account);
  }

  public subscribeAccountTrades(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribeAccount('account_trades', handler, account);
  }

  public subscribeAccountTransfers(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribeAccount('account_transfers', handler, account);
  }

  public subscribeAccountTwapOrders(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribeAccount('account_twap_orders', handler, account);
  }

  public subscribeAccountTwapUpdates(handler: StreamHandler, account?: string): Unsubscribe {
    return this.subscribeAccount('account_twap_order_updates', handler, account);
  }

  public createLimitOrder(params: CreateLimitOrderParams): Promise<JsonValue> {
    const data = buildSignedRequest(
      this.client,
      OperationType.CreateOrder,
      buildLimitOrderPayload(params),
      this.label,
    );
    return this.sendAction({ create_order: data });
  }

  public createMarketOrder(params: CreateMarketOrderParams): Promise<JsonValue> {
    const data = buildSignedRequest(
      this.client,
      OperationType.CreateMarketOrder,
      buildMarketOrderPayload(params),
      this.label,
    );
    return this.sendAction({ create_market_order: data });
  }

  public cancelOrder(params: CancelOrderRef): Promise<JsonValue> {
    const data = buildSignedRequest(
      this.client,
      OperationType.CancelOrder,
      buildCancelOrderPayload(params),
      this.label,
    );
    return this.sendAction({ cancel_order: data });
  }

  public cancelAllOrders(params: CancelAllOrdersRef): Promise<JsonValue> {
    const data = buildSignedRequest(
      this.client,
      OperationType.CancelAllOrders,
      buildCancelAllOrdersPayload(params),
      this.label,
    );
    return this.sendAction({ cancel_all_orders: data });
  }

  public editOrder(params: EditOrderRef): Promise<JsonValue> {
    const data = buildSignedRequest(
      this.client,
      OperationType.EditOrder,
      buildEditOrderPayload(params),
      this.label,
    );
    return this.sendAction({ edit_order: data });
  }

  public batchOrders(actions: BatchAction[]): Promise<JsonValue> {
    return this.sendAction({ actions: buildSignedBatchActions(this.client, actions, this.label) });
  }

  private subscribeAccount(source: string, handler: StreamHandler, account?: string): Unsubscribe {
    const resolvedAccount = account ?? resolveSigner(this.client, this.label).account;
    return this.subscribeChannel(source, { source, account: resolvedAccount }, handler);
  }

  private subscribeChannel(
    channel: string,
    params: JsonObject,
    handler: StreamHandler,
  ): Unsubscribe {
    let handlerSet = this.handlers.get(channel);
    if (handlerSet === undefined) {
      handlerSet = new Set();
      this.handlers.set(channel, handlerSet);
    }
    handlerSet.add(handler);
    this.subscribe(params);
    return () => {
      handlerSet.delete(handler);
      this.unsubscribe(params);
    };
  }

  /**
   * Émet une frame d'abonnement déjà sérialisée (chemin du batcher) ; file si la socket n'est pas réellement
   * **OPEN**. Le seul `this.open` ne suffit pas : il peut être en avance sur l'état réel (reconnexion →
   * `this.socket` réassigné à une socket CONNECTING avant `onopen`, ou frame différée par le throttle du
   * batcher arrivant pendant un close concurrent). `send()` lèverait alors « Sent before connected » — throw
   * non rattrapé qui crashe le process. On vérifie donc `readyState === OPEN` ; les frames filées repartent au
   * prochain `onopen` (abonnements vivants rejoués via `afterReconnect`/`resubscribe`).
   */
  private rawSend(frame: string): void {
    if (this.open === false || this.socket === null || this.socket.readyState !== OPEN) {
      this.pendingSends.push(frame);
      return;
    }
    this.socket.send(frame);
  }

  private send(payload: JsonObject): void {
    this.rawSend(JSON.stringify(payload));
  }

  private handleMessage(raw: unknown): void {
    this.bumpIdle();
    let message: JsonValue;
    try {
      message = JSON.parse(String(raw)) as JsonValue;
    } catch {
      if (this.onError !== null) {
        this.onError(new Error('WebSocket : message JSON illisible ignoré'));
      }
      return;
    }
    if (this.onMessage !== null) {
      this.onMessage(message);
    }
    if (typeof message !== 'object' || message === null || Array.isArray(message) === true) {
      return;
    }
    const id = message.id;
    if (typeof id === 'string') {
      const pendingAction = this.pending.get(id);
      if (pendingAction !== undefined) {
        this.pending.delete(id);
        clearTimeout(pendingAction.timer);
        pendingAction.resolve(message);
        return;
      }
    }
    const channel = message.channel;
    if (typeof channel === 'string' && channel !== 'pong') {
      this.dispatch(channel, message.data ?? null);
    }
  }

  private dispatch(channel: string, data: JsonValue): void {
    const handlerSet = this.handlers.get(channel);
    if (handlerSet !== undefined) {
      for (const handler of handlerSet) {
        handler(data);
      }
    }
  }

  /** Détection d'inactivité : aucun message depuis `IDLE_TIMEOUT_MS` → socket morte → reconnect. */
  private bumpIdle(): void {
    this.stopIdleTimer();
    this.idleTimer = setTimeout(() => this.forceReconnect(), IDLE_TIMEOUT_MS);
  }

  private stopIdleTimer(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private clearStableTimer(): void {
    if (this.stableTimer !== null) {
      clearTimeout(this.stableTimer);
      this.stableTimer = null;
    }
  }

  /** Ferme la socket courante → `handleClose` → `scheduleReconnect`. */
  private forceReconnect(): void {
    if (this.socket !== null) {
      this.socket.close();
    }
  }

  /** Rejette toute action signée en vol (jamais laissée pending) avec une erreur claire. */
  private rejectAllPending(reason: string): void {
    const error = new Error(reason);
    for (const pendingAction of this.pending.values()) {
      clearTimeout(pendingAction.timer);
      pendingAction.reject(error);
    }
    this.pending.clear();
  }

  private handleClose(): void {
    this.stopHeartbeat();
    this.stopIdleTimer();
    this.clearStableTimer();
    this.batcher.reset();
    this.batcher.setOpen(false);
    this.rejectAllPending('WebSocket fermé : requête en vol annulée');
    this.socket = null;
    this.open = false;
    if (this.onClose !== null) {
      this.onClose();
    }
    if (this.shouldReconnect === true) {
      this.scheduleReconnect();
    }
  }

  /** Backoff exponentiel + jitter + cap ; ré-arme tant que `shouldReconnect` (jamais d'abandon). */
  private scheduleReconnect(): void {
    if (this.shouldReconnect === false) {
      return;
    }
    const capped = Math.min(
      RECONNECT_BASE_MS * RECONNECT_FACTOR ** this.reconnectAttempts,
      RECONNECT_CAP_MS,
    );
    const jitter = capped * RECONNECT_JITTER * (2 * Math.random() - 1);
    const delay = Math.max(0, Math.round(capped + jitter));
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect()
        .then(() => this.afterReconnect())
        .catch((error: unknown) => {
          if (this.onError !== null) {
            this.onError(error);
          }
          this.scheduleReconnect();
        });
    }, delay);
  }

  /** Rejoue tous les abonnements vivants (via le batcher) puis notifie `onReconnect`. */
  private afterReconnect(): void {
    this.batcher.resubscribe(this.activeSubscriptions.keys());
    if (this.onReconnect !== null) {
      this.onReconnect();
    }
  }
}

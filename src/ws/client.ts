import { type WebSocketFactory, type WebSocketLike, getConfig } from '../common/config';
import { WS_HEARTBEAT_INTERVAL } from '../common/constants';
import { type JsonObject, type JsonValue, OperationType } from '../common/types';
import { buildSignedBatchActions } from '../rest/orders/batch-order';
import {
  buildCancelAllOrdersPayload,
  buildCancelOrderPayload,
  buildEditOrderPayload,
  buildLimitOrderPayload,
  buildMarketOrderPayload,
} from '../rest/orders/payloads';
import { buildSignedRequest, resolveSigner } from '../rest/signing';
import type {
  BatchAction,
  CancelAllOrdersParams,
  CancelOrderParams,
  CandleInterval,
  CreateLimitOrderParams,
  CreateMarketOrderParams,
  EditOrderParams,
} from '../rest/types';

export type StreamHandler = (data: JsonValue) => void;
export type Unsubscribe = () => void;

export interface WsClientOptions {
  url?: string;
  webSocket?: WebSocketFactory;
  account?: string;
}

interface PendingAction {
  resolve: (value: JsonValue) => void;
  reject: (reason: unknown) => void;
}

export class WsClient {
  public onMessage: ((message: JsonValue) => void) | null = null;
  public onError: ((error: unknown) => void) | null = null;
  public onClose: (() => void) | null = null;
  public onReconnect: (() => void) | null = null;

  private readonly url: string;
  private readonly createSocket: WebSocketFactory;
  private readonly account: string | undefined;
  private socket: WebSocketLike | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private readonly pending = new Map<string, PendingAction>();
  private readonly handlers = new Map<string, Set<StreamHandler>>();
  private readonly activeSubscriptions = new Map<string, JsonObject>();
  private shouldReconnect = false;

  constructor(options: WsClientOptions = {}) {
    const config = getConfig();
    this.url = options.url ?? config.wsUrl;
    this.createSocket = options.webSocket ?? config.webSocket;
    this.account = options.account;
  }

  public connect(): Promise<void> {
    this.shouldReconnect = true;
    return new Promise((resolve, reject) => {
      const socket = this.createSocket(this.url);
      this.socket = socket;
      socket.onopen = () => {
        this.startHeartbeat();
        resolve();
      };
      socket.onmessage = (event) => this.handleMessage(event.data);
      socket.onerror = (error) => {
        if (this.onError !== null) {
          this.onError(error);
        }
        reject(error);
      };
      socket.onclose = () => this.handleClose();
    });
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    if (this.socket !== null) {
      this.socket.close();
      this.socket = null;
    }
  }

  public subscribe(params: JsonObject): void {
    this.activeSubscriptions.set(JSON.stringify(params), params);
    this.send({ method: 'subscribe', params });
  }

  public unsubscribe(params: JsonObject): void {
    this.activeSubscriptions.delete(JSON.stringify(params));
    this.send({ method: 'unsubscribe', params });
  }

  public sendAction<TResult extends JsonValue = JsonValue>(params: JsonObject): Promise<TResult> {
    const id = globalThis.crypto.randomUUID();
    return new Promise<TResult>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (value: JsonValue) => void, reject });
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

  public createLimitOrder(params: CreateLimitOrderParams, account?: string): Promise<JsonValue> {
    const data = buildSignedRequest(
      OperationType.CreateOrder,
      buildLimitOrderPayload(params),
      account ?? this.account,
    );
    return this.sendAction({ create_order: data });
  }

  public createMarketOrder(params: CreateMarketOrderParams, account?: string): Promise<JsonValue> {
    const data = buildSignedRequest(
      OperationType.CreateMarketOrder,
      buildMarketOrderPayload(params),
      account ?? this.account,
    );
    return this.sendAction({ create_market_order: data });
  }

  public cancelOrder(params: CancelOrderParams, account?: string): Promise<JsonValue> {
    const data = buildSignedRequest(
      OperationType.CancelOrder,
      buildCancelOrderPayload(params),
      account ?? this.account,
    );
    return this.sendAction({ cancel_order: data });
  }

  public cancelAllOrders(params: CancelAllOrdersParams, account?: string): Promise<JsonValue> {
    const data = buildSignedRequest(
      OperationType.CancelAllOrders,
      buildCancelAllOrdersPayload(params),
      account ?? this.account,
    );
    return this.sendAction({ cancel_all_orders: data });
  }

  public editOrder(params: EditOrderParams, account?: string): Promise<JsonValue> {
    const data = buildSignedRequest(
      OperationType.EditOrder,
      buildEditOrderPayload(params),
      account ?? this.account,
    );
    return this.sendAction({ edit_order: data });
  }

  public batchOrders(actions: BatchAction[], account?: string): Promise<JsonValue> {
    return this.sendAction({ actions: buildSignedBatchActions(actions, account ?? this.account) });
  }

  private subscribeAccount(source: string, handler: StreamHandler, account?: string): Unsubscribe {
    const resolvedAccount = account ?? this.account ?? resolveSigner().account;
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

  private send(payload: JsonObject): void {
    if (this.socket === null) {
      throw new Error('WebSocket is not connected; call connect() first');
    }
    this.socket.send(JSON.stringify(payload));
  }

  private handleMessage(raw: unknown): void {
    const message = JSON.parse(String(raw)) as JsonValue;
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

  private handleClose(): void {
    this.stopHeartbeat();
    this.socket = null;
    if (this.onClose !== null) {
      this.onClose();
    }
    if (this.shouldReconnect === true) {
      this.reconnect();
    }
  }

  private reconnect(): void {
    this.connect()
      .then(() => {
        for (const params of this.activeSubscriptions.values()) {
          this.send({ method: 'subscribe', params });
        }
        if (this.onReconnect !== null) {
          this.onReconnect();
        }
      })
      .catch((error: unknown) => {
        if (this.onError !== null) {
          this.onError(error);
        }
      });
  }
}

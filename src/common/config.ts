import { REST_URL, TESTNET_REST_URL, TESTNET_WS_URL, WS_URL } from './constants';
import type { Network, Signer } from './types';

export type { Network };

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(): void;
  onopen: ((event: unknown) => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onclose: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

export type WebSocketFactory = (url: string) => WebSocketLike;

export interface InitOptions {
  fetch?: FetchLike;
  webSocket?: WebSocketFactory;
  /** Registry of signers keyed by label. Each signer carries its own network. */
  signers?: Record<string, Signer>;
  /** Override the REST base URL per network. */
  restUrls?: Partial<Record<Network, string>>;
  /** Override the WebSocket base URL per network. */
  wsUrls?: Partial<Record<Network, string>>;
}

/**
 * Contexte d'exécution **isolé** d'un SDK Pacifica : tout ce dont les fonctions REST/WS ont
 * besoin (fetch, urls, signers). Créé par {@link init} et **passé explicitement** à chaque
 * fonction (`getCandles(client, …)`) — il n'y a **plus de singleton global**, donc plusieurs
 * clients (comptes/réseaux différents) coexistent sans se piétiner.
 */
export interface PacificaClient {
  fetch: FetchLike;
  webSocket: WebSocketFactory;
  signers: Record<string, Signer>;
  restUrls: Record<Network, string>;
  wsUrls: Record<Network, string>;
}

/** Construit un {@link PacificaClient} isolé à partir des options. Aucun état global muté. */
export function init(options: InitOptions = {}): PacificaClient {
  const fetchImpl =
    options.fetch ??
    (typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : undefined);
  if (fetchImpl === undefined) {
    throw new Error('No fetch implementation available; pass options.fetch to init()');
  }
  const webSocket = options.webSocket ?? defaultWebSocketFactory();
  if (webSocket === undefined) {
    throw new Error('No WebSocket implementation available; pass options.webSocket to init()');
  }
  return {
    fetch: fetchImpl,
    webSocket,
    signers: options.signers ?? {},
    restUrls: {
      mainnet: options.restUrls?.mainnet ?? REST_URL,
      testnet: options.restUrls?.testnet ?? TESTNET_REST_URL,
    },
    wsUrls: {
      mainnet: options.wsUrls?.mainnet ?? WS_URL,
      testnet: options.wsUrls?.testnet ?? TESTNET_WS_URL,
    },
  };
}

function defaultWebSocketFactory(): WebSocketFactory | undefined {
  if (typeof globalThis.WebSocket !== 'function') {
    return undefined;
  }
  return (url) => new globalThis.WebSocket(url) as unknown as WebSocketLike;
}

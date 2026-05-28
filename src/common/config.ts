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

export interface PacificaConfig {
  fetch: FetchLike;
  webSocket: WebSocketFactory;
  signers: Record<string, Signer>;
  restUrls: Record<Network, string>;
  wsUrls: Record<Network, string>;
}

let config: PacificaConfig | null = null;

export function init(options: InitOptions = {}): void {
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
  config = {
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

export function getConfig(): PacificaConfig {
  if (config === null) {
    throw new Error('Pacifica SDK not initialized; call init() first');
  }
  return config;
}

export function resetConfig(): void {
  config = null;
}

import { REST_URL, TESTNET_REST_URL, TESTNET_WS_URL, WS_URL } from './constants';
import type { Signer } from './types';

export type Network = 'mainnet' | 'testnet';

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
  network?: Network;
  restUrl?: string;
  wsUrl?: string;
  fetch?: FetchLike;
  webSocket?: WebSocketFactory;
  signer?: Signer;
}

export interface PacificaConfig {
  restUrl: string;
  wsUrl: string;
  fetch: FetchLike;
  webSocket: WebSocketFactory;
  signer?: Signer;
}

let config: PacificaConfig | null = null;

export function init(options: InitOptions = {}): void {
  const network = options.network ?? 'mainnet';
  const restUrl = options.restUrl ?? (network === 'testnet' ? TESTNET_REST_URL : REST_URL);
  const wsUrl = options.wsUrl ?? (network === 'testnet' ? TESTNET_WS_URL : WS_URL);
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
  config = { restUrl, wsUrl, fetch: fetchImpl, webSocket, signer: options.signer };
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

import { REST_URL, TESTNET_REST_URL, TESTNET_WS_URL, WS_URL } from './constants';

export type Network = 'mainnet' | 'testnet';

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface InitOptions {
  network?: Network;
  restUrl?: string;
  wsUrl?: string;
  fetch?: FetchLike;
}

export interface PacificaConfig {
  restUrl: string;
  wsUrl: string;
  fetch: FetchLike;
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
  config = { restUrl, wsUrl, fetch: fetchImpl };
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

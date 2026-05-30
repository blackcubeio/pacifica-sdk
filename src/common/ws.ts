import type { WebSocketFactory } from './config';
import type { JsonValue } from './types';

// ── depuis ws/client.ts ──
export type StreamHandler = (data: JsonValue) => void;

export type Unsubscribe = () => void;

export interface WsClientOptions {
  url?: string;
  webSocket?: WebSocketFactory;
  /** Label du signer : choisit le réseau (défaut mainnet) et signe les actions. */
  label?: string;
}

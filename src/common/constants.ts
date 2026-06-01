export const REST_URL = 'https://api.pacifica.fi/api/v1';
export const WS_URL = 'wss://ws.pacifica.fi/ws';

export const TESTNET_REST_URL = 'https://test-api.pacifica.fi/api/v1';
export const TESTNET_WS_URL = 'wss://test-ws.pacifica.fi/ws';

export const DEFAULT_EXPIRY_WINDOW = 30_000;

// ── WebSocket : robustesse (constantes communes aux 4 SDK ; cf. spec WS 0.7.0) ──
/** Ping périodique applicatif (`{ method: 'ping' }`) ; réutilisée par l'idle-timer. */
export const WS_HEARTBEAT_INTERVAL = 30_000;
/** Aucun message reçu depuis 45 s → socket considérée morte, reconnexion forcée. */
export const IDLE_TIMEOUT_MS = 45_000;
/** Délai au-delà duquel une action WS en attente d'ack (`sendAction`) est rejetée. */
export const ACTION_TIMEOUT_MS = 10_000;

// ── WebSocket : reconnexion (backoff exponentiel + jitter + cap + reset) ──
/** Délai de base avant la 1ʳᵉ tentative de reconnexion. */
export const RECONNECT_BASE_MS = 500;
/** Facteur exponentiel du backoff. */
export const RECONNECT_FACTOR = 2;
/** Plafond du délai de reconnexion. */
export const RECONNECT_CAP_MS = 30_000;
/** Amplitude du jitter (±20 %). */
export const RECONNECT_JITTER = 0.2;
/** Durée de connexion ininterrompue au-delà de laquelle on remet le compteur de backoff à zéro. */
export const RECONNECT_STABLE_MS = 10_000;

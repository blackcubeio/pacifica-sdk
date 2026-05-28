import { getConfig } from '../common/config';
import type { JsonObject, Network } from '../common/types';

/**
 * Réseau d'une **lecture**. Le label est optionnel : sans label on retombe sur le **mainnet**
 * (les lectures ne touchent pas au wallet), avec un label on tape sur le réseau de son signer.
 */
export function resolveReadNetwork(label?: string): Network {
  if (label === undefined) {
    return 'mainnet';
  }
  const signer = getConfig().signers[label];
  if (signer === undefined) {
    throw new Error(`Aucun signer enregistré sous "${label}"; ajoute-le dans init({ signers })`);
  }
  return signer.network;
}

export class PacificaApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: number | null,
    message: string,
  ) {
    super(message);
    this.name = 'PacificaApiError';
  }
}

export type QueryValue = string | number | boolean;
export type QueryParams = Record<string, QueryValue | undefined>;

export interface ApiEnvelope<TData> {
  success: boolean;
  data: TData;
  error: string | null;
  code: number | null;
  next_cursor?: string | null;
  has_more?: boolean;
  last_order_id?: number;
}

export function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const url = new URL(baseUrl + path);
  if (query !== undefined) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/** Lecture (non signée). `label` optionnel choisit le réseau (défaut mainnet). */
export function httpGet<TData>(
  path: string,
  query?: QueryParams,
  label?: string,
): Promise<ApiEnvelope<TData>> {
  const config = getConfig();
  const url = buildUrl(config.restUrls[resolveReadNetwork(label)], path, query);
  return config
    .fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })
    .then((response) => parseEnvelope<TData>(response));
}

/** POST sur le réseau du signer `label`. Pour les écritures, le label est obligatoire en amont. */
export function httpPost<TData>(
  path: string,
  body: JsonObject,
  label?: string,
): Promise<ApiEnvelope<TData>> {
  return httpPostTo<TData>(path, body, resolveReadNetwork(label));
}

/** POST sur un réseau explicite (flux à signataires bruts, ex. création de sous-compte). */
export function httpPostTo<TData>(
  path: string,
  body: JsonObject,
  network: Network,
): Promise<ApiEnvelope<TData>> {
  const config = getConfig();
  const url = buildUrl(config.restUrls[network], path);
  return config
    .fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    .then((response) => parseEnvelope<TData>(response));
}

function parseEnvelope<TData>(response: Response): Promise<ApiEnvelope<TData>> {
  return response.text().then((body) => {
    const parsed = tryParseEnvelope<TData>(body);
    if (response.ok === false) {
      const message = parsed?.error ?? (body === '' ? `HTTP ${response.status}` : body);
      throw new PacificaApiError(response.status, parsed?.code ?? null, message);
    }
    if (parsed === null) {
      throw new PacificaApiError(response.status, null, body === '' ? 'Empty response' : body);
    }
    if (parsed.success === false) {
      throw new PacificaApiError(
        response.status,
        parsed.code ?? null,
        parsed.error ?? 'Request failed',
      );
    }
    return parsed;
  });
}

function tryParseEnvelope<TData>(body: string): ApiEnvelope<TData> | null {
  if (body === '') {
    return null;
  }
  try {
    return JSON.parse(body) as ApiEnvelope<TData>;
  } catch {
    return null;
  }
}

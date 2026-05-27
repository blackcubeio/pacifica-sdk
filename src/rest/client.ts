import { getConfig } from '../common/config';
import type { JsonObject } from '../common/types';

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

export function httpGet<TData>(path: string, query?: QueryParams): Promise<ApiEnvelope<TData>> {
  const config = getConfig();
  const url = buildUrl(config.restUrl, path, query);
  return config
    .fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })
    .then((response) => parseEnvelope<TData>(response));
}

export function httpPost<TData>(path: string, body: JsonObject): Promise<ApiEnvelope<TData>> {
  const config = getConfig();
  const url = buildUrl(config.restUrl, path);
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
    const parsed = (body === '' ? {} : JSON.parse(body)) as ApiEnvelope<TData>;
    if (response.ok === false) {
      const message = parsed.error ?? `HTTP ${response.status}`;
      throw new PacificaApiError(response.status, parsed.code ?? null, message);
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

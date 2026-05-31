import type { JsonObject } from '../common/types';
import type { Side } from '../common/types';

/**
 * Ordre **TWAP** Pacifica au format normalisé — **interface dédiée nommée** (pas d'équivalent
 * commun : un TWAP est un méta-ordre tranché). Les **noms de propriété** reprennent le vocabulaire
 * commun (`name`/`side`/`size`/`filled`/`id`/`clientId`/`reduceOnly`/`time`). Le surplus natif
 * (durée, slippage, event_type d'historique…) est conservé dans `xtras` — **rien n'est jeté**.
 */
export interface Twap {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** ID du TWAP exchange. */
  id: string;
  /** Client order id ; `null` si absent. */
  clientId: string | null;
  /** Sens. */
  side: Side;
  /** Quantité totale visée (chaîne décimale). */
  size: string;
  /** Quantité déjà exécutée (chaîne décimale). */
  filled: string;
  /** Reduce-only ; `null` si non fourni. */
  reduceOnly: boolean | null;
  /** Timestamp de création (ms). */
  time: number;
  /** Champs natifs hors cœur (durée, slippage, event_type…), rien jeté ; omis si vide. */
  xtras?: Record<string, unknown>;
}

function str(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

/**
 * Convertisseur **unidirectionnel** TWAP natif (`JsonObject` snake_case) → {@link Twap}.
 * `side` ('bid'/'ask' → 'buy'/'sell'). Le cœur (`order_id`/`symbol`/`amount`/`filled_amount`/
 * `client_order_id`/`reduce_only`/`created_at`) est extrait ; tout le reste (history_id, event_type,
 * duration_seconds, slippage_percent, updated_at…) part dans `xtras`.
 */
export class TwapConverter {
  toCommon(wire: JsonObject): Twap {
    const {
      order_id,
      symbol,
      side,
      amount,
      total_amount,
      filled_amount,
      client_order_id,
      reduce_only,
      created_at,
      ...rest
    } = wire;
    const clientId = client_order_id;
    return {
      name: str(symbol),
      id: str(order_id),
      clientId: clientId === undefined || clientId === null ? null : String(clientId),
      side: side === 'bid' ? 'buy' : 'sell',
      size: str(total_amount ?? amount),
      filled: str(filled_amount),
      reduceOnly: typeof reduce_only === 'boolean' ? reduce_only : null,
      time: typeof created_at === 'number' ? created_at : 0,
      xtras: rest as Record<string, unknown>,
    };
  }
}

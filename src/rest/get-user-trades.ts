import type { UserTrade } from '../common/types';
import { httpGet } from './client';
import { UserTradeConverter, type UserTradeNative } from '../converters/user-trade';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetUserTradesParams {
  /** Adresse du compte (clé publique), **requise** côté Pacifica. */
  user: string;
  /** Filtre optionnel sur une paire. */
  name?: string;
  /** Début (ms). */
  startTime?: number;
  /** Fin (ms). */
  endTime?: number;
  /** Nombre max. */
  limit?: number;
}

/**
 * Exécutions (fills) du compte au **format unifié** `UserTrade` (Pacifica `/trades/history`).
 * Le curseur de pagination n'est pas repris (cf. `getTradeHistory` pour la pagination native).
 */
export function getUserTrades(params: GetUserTradesParams, label?: string): Promise<UserTrade[]> {
  const converter = new UserTradeConverter();
  return httpGet<UserTradeNative[]>(
    '/trades/history',
    {
      account: params.user,
      symbol: params.name,
      start_time: params.startTime,
      end_time: params.endTime,
      limit: params.limit,
    },
    label,
  ).then((envelope) => envelope.data.map((entry) => converter.toCommon(entry)));
}

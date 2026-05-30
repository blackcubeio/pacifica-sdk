import type { PacificaClient } from '../common/config';
import type { GetUserTradesParams } from '../common/types';
import type { UserTrade } from '../common/types';
import { UserTradeConverter, type UserTradeNative } from '../converters/user-trade';
import { httpGet } from './client';

/**
 * Exécutions (fills) du compte au **format unifié** `UserTrade` (Pacifica `/trades/history`).
 * Le curseur de pagination n'est pas repris (cf. `getTradeHistory` pour la pagination native).
 */
export function getUserTrades(
  client: PacificaClient,
  params: GetUserTradesParams,
  label?: string,
): Promise<UserTrade[]> {
  const converter = new UserTradeConverter();
  return httpGet<UserTradeNative[]>(
    client,
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

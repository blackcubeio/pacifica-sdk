import type { PacificaClient } from '../../../common/config';
import type { Paginated, TwapHistoryQuery } from '../../../common/native';
import type { JsonObject } from '../../../common/types';
import { httpGet } from '../../client';

export function getTwapOrderHistory(
  client: PacificaClient,
  query: TwapHistoryQuery,
  label?: string,
): Promise<Paginated<JsonObject>> {
  return httpGet<JsonObject[]>(
    client,
    '/orders/twap/history',
    {
      account: query.account,
      limit: query.limit,
      cursor: query.cursor,
    },
    label,
  ).then((envelope) => ({
    items: envelope.data,
    nextCursor: envelope.next_cursor ?? null,
    hasMore: envelope.has_more ?? false,
  }));
}

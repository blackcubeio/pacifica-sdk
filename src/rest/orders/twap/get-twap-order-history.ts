import type { JsonObject } from '../../../common/types';
import { httpGet } from '../../client';
import type { Paginated, TwapHistoryQuery } from '../../types';

export function getTwapOrderHistory(query: TwapHistoryQuery): Promise<Paginated<JsonObject>> {
  return httpGet<JsonObject[]>('/orders/twap/history', {
    account: query.account,
    limit: query.limit,
    cursor: query.cursor,
  }).then((envelope) => ({
    items: envelope.data,
    nextCursor: envelope.next_cursor ?? null,
    hasMore: envelope.has_more ?? false,
  }));
}

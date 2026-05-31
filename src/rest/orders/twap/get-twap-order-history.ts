import type { PacificaClient } from '../../../common/config';
import type { Paginated, TwapHistoryQuery } from '../../../common/native';
import type { JsonObject } from '../../../common/types';
import { type Twap, TwapConverter } from '../../../converters/twap';
import { httpGet } from '../../client';

export function getTwapOrderHistory(
  client: PacificaClient,
  query: TwapHistoryQuery,
  label?: string,
): Promise<Paginated<Twap>> {
  const converter = new TwapConverter();
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
    items: envelope.data.map((entry) => converter.toCommon(entry)),
    nextCursor: envelope.next_cursor ?? null,
    hasMore: envelope.has_more ?? false,
  }));
}

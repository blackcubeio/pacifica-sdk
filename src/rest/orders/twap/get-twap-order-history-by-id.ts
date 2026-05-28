import type { JsonObject } from '../../../common/types';
import { httpGet } from '../../client';
import type { TwapHistoryByIdQuery } from '../../types';

export function getTwapOrderHistoryById(
  query: TwapHistoryByIdQuery,
  label?: string,
): Promise<JsonObject[]> {
  return httpGet<JsonObject[]>(
    '/orders/twap/history_by_id',
    {
      order_id: query.orderId,
    },
    label,
  ).then((envelope) => envelope.data);
}

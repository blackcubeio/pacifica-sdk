import type { PacificaClient } from '../../../common/config';
import type { TwapHistoryByIdQuery } from '../../../common/native';
import type { JsonObject } from '../../../common/types';
import { httpGet } from '../../client';

export function getTwapOrderHistoryById(
  client: PacificaClient,
  query: TwapHistoryByIdQuery,
  label?: string,
): Promise<JsonObject[]> {
  return httpGet<JsonObject[]>(
    client,
    '/orders/twap/history_by_id',
    {
      order_id: query.orderId,
    },
    label,
  ).then((envelope) => envelope.data);
}

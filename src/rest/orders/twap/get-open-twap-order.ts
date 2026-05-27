import type { JsonObject } from '../../../common/types';
import { httpGet } from '../../client';
import type { AccountQuery } from '../../types';

export function getOpenTwapOrder(query: AccountQuery): Promise<JsonObject[]> {
  return httpGet<JsonObject[]>('/orders/twap', { account: query.account }).then(
    (envelope) => envelope.data,
  );
}

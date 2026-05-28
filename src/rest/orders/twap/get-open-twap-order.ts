import type { JsonObject } from '../../../common/types';
import { httpGet } from '../../client';
import type { AccountQuery } from '../../types';

export function getOpenTwapOrder(query: AccountQuery, label?: string): Promise<JsonObject[]> {
  return httpGet<JsonObject[]>('/orders/twap', { account: query.account }, label).then(
    (envelope) => envelope.data,
  );
}

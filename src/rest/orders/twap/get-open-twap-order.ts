import type { AccountQuery } from '../../../common/native';
import type { JsonObject } from '../../../common/types';
import { httpGet } from '../../client';

export function getOpenTwapOrder(query: AccountQuery, label?: string): Promise<JsonObject[]> {
  return httpGet<JsonObject[]>('/orders/twap', { account: query.account }, label).then(
    (envelope) => envelope.data,
  );
}

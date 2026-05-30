import type { PacificaClient } from '../../../common/config';
import type { AccountQuery } from '../../../common/native';
import type { JsonObject } from '../../../common/types';
import { httpGet } from '../../client';

export function getOpenTwapOrder(
  client: PacificaClient,
  query: AccountQuery,
  label?: string,
): Promise<JsonObject[]> {
  return httpGet<JsonObject[]>(client, '/orders/twap', { account: query.account }, label).then(
    (envelope) => envelope.data,
  );
}

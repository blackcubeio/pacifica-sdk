import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { AddIsolatedMarginParams } from '../types';

export function addIsolatedMargin(params: AddIsolatedMarginParams, signer?: Signer): Promise<void> {
  const payload = { symbol: params.symbol, amount: params.amount };
  const request = buildSignedRequest(OperationType.AddIsolatedMargin, payload, signer);
  return httpPost<null>('/positions/add_isolated_margin', request).then(() => undefined);
}

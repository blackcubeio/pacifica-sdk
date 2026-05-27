import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { UpdateMarginModeParams } from '../types';

export function updateMarginMode(params: UpdateMarginModeParams, signer?: Signer): Promise<void> {
  const payload = { symbol: params.symbol, is_isolated: params.isIsolated };
  const request = buildSignedRequest(OperationType.UpdateMarginMode, payload, signer);
  return httpPost<null>('/account/margin', request).then(() => undefined);
}

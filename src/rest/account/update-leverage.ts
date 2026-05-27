import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { UpdateLeverageParams } from '../types';

export function updateLeverage(params: UpdateLeverageParams, signer?: Signer): Promise<void> {
  const payload = { symbol: params.symbol, leverage: params.leverage };
  const request = buildSignedRequest(OperationType.UpdateLeverage, payload, signer);
  return httpPost<null>('/account/leverage', request).then(() => undefined);
}

import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { UpdateLeverageParams } from '../types';

export function updateLeverage(params: UpdateLeverageParams, account?: string): Promise<void> {
  const payload = { symbol: params.symbol, leverage: params.leverage };
  const request = buildSignedRequest(OperationType.UpdateLeverage, payload, account);
  return httpPost<null>('/account/leverage', request).then(() => undefined);
}

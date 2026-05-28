import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { UpdateLeverageParams } from '../types';

export function updateLeverage(params: UpdateLeverageParams, label: string): Promise<void> {
  const payload = { symbol: params.symbol, leverage: params.leverage };
  const request = buildSignedRequest(OperationType.UpdateLeverage, payload, label);
  return httpPost<null>('/account/leverage', request, label).then(() => undefined);
}

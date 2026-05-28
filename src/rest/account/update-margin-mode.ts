import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { UpdateMarginModeParams } from '../types';

export function updateMarginMode(params: UpdateMarginModeParams, label: string): Promise<void> {
  const payload = { symbol: params.symbol, is_isolated: params.isIsolated };
  const request = buildSignedRequest(OperationType.UpdateMarginMode, payload, label);
  return httpPost<null>('/account/margin', request, label).then(() => undefined);
}

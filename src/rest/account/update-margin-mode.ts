import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { UpdateMarginModeParams } from '../types';

export function updateMarginMode(params: UpdateMarginModeParams, account?: string): Promise<void> {
  const payload = { symbol: params.symbol, is_isolated: params.isIsolated };
  const request = buildSignedRequest(OperationType.UpdateMarginMode, payload, account);
  return httpPost<null>('/account/margin', request).then(() => undefined);
}

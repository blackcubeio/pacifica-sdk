import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CancelStopOrderParams } from '../types';
import { buildCancelStopOrderPayload } from './payloads';

export function cancelStopOrder(params: CancelStopOrderParams, account?: string): Promise<void> {
  const payload = buildCancelStopOrderPayload(params);
  const request = buildSignedRequest(OperationType.CancelStopOrder, payload, account);
  return httpPost<null>('/orders/stop/cancel', request).then(() => undefined);
}

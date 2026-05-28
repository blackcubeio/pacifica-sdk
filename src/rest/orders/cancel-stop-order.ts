import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CancelStopOrderParams } from '../types';
import { buildCancelStopOrderPayload } from './payloads';

export function cancelStopOrder(params: CancelStopOrderParams, label: string): Promise<void> {
  const payload = buildCancelStopOrderPayload(params);
  const request = buildSignedRequest(OperationType.CancelStopOrder, payload, label);
  return httpPost<null>('/orders/stop/cancel', request, label).then(() => undefined);
}

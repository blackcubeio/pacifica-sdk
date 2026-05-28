import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CancelOrderParams } from '../types';
import { buildCancelOrderPayload } from './payloads';

export function cancelOrder(params: CancelOrderParams, label: string): Promise<void> {
  const payload = buildCancelOrderPayload(params);
  const request = buildSignedRequest(OperationType.CancelOrder, payload, label);
  return httpPost<null>('/orders/cancel', request, label).then(() => undefined);
}

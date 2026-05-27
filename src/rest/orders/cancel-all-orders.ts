import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CancelAllOrdersParams, CancelAllResult } from '../types';
import { buildCancelAllOrdersPayload } from './payloads';

export function cancelAllOrders(
  params: CancelAllOrdersParams,
  signer?: Signer,
): Promise<CancelAllResult> {
  const payload = buildCancelAllOrdersPayload(params);
  const request = buildSignedRequest(OperationType.CancelAllOrders, payload, signer);
  return httpPost<{ cancelled_count: number }>('/orders/cancel_all', request).then((envelope) => ({
    cancelledCount: envelope.data.cancelled_count,
  }));
}

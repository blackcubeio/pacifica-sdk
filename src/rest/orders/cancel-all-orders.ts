import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CancelAllOrdersParams, CancelAllResult } from '../types';
import { buildCancelAllOrdersPayload } from './payloads';

export function cancelAllOrders(
  params: CancelAllOrdersParams,
  label: string,
): Promise<CancelAllResult> {
  const payload = buildCancelAllOrdersPayload(params);
  const request = buildSignedRequest(OperationType.CancelAllOrders, payload, label);
  return httpPost<{ cancelled_count: number }>('/orders/cancel_all', request, label).then(
    (envelope) => ({
      cancelledCount: envelope.data.cancelled_count,
    }),
  );
}

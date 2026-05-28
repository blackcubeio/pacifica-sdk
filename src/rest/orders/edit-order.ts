import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CreateOrderResult, EditOrderParams } from '../types';
import { buildEditOrderPayload } from './payloads';

export function editOrder(params: EditOrderParams, account?: string): Promise<CreateOrderResult> {
  const payload = buildEditOrderPayload(params);
  const request = buildSignedRequest(OperationType.EditOrder, payload, account);
  return httpPost<{ order_id: number }>('/orders/edit', request).then((envelope) => ({
    orderId: envelope.data.order_id,
  }));
}

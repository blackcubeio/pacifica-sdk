import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CreateOrderResult, EditOrderParams } from '../types';
import { buildEditOrderPayload } from './payloads';

export function editOrder(params: EditOrderParams, signer?: Signer): Promise<CreateOrderResult> {
  const payload = buildEditOrderPayload(params);
  const request = buildSignedRequest(OperationType.EditOrder, payload, signer);
  return httpPost<{ order_id: number }>('/orders/edit', request).then((envelope) => ({
    orderId: envelope.data.order_id,
  }));
}

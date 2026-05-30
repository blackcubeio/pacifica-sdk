import type { CreateOrderResult, CreateStopOrderParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import { buildStopOrderPayload } from './payloads';

export function createStopOrder(
  params: CreateStopOrderParams,
  label: string,
): Promise<CreateOrderResult> {
  const payload = buildStopOrderPayload(params);
  const request = buildSignedRequest(OperationType.CreateStopOrder, payload, label);
  return httpPost<{ order_id: number }>('/orders/stop/create', request, label).then((envelope) => ({
    orderId: envelope.data.order_id,
  }));
}

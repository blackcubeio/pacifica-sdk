import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CreateOrderResult, CreateStopOrderParams } from '../types';
import { buildStopOrderPayload } from './payloads';

export function createStopOrder(
  params: CreateStopOrderParams,
  account?: string,
): Promise<CreateOrderResult> {
  const payload = buildStopOrderPayload(params);
  const request = buildSignedRequest(OperationType.CreateStopOrder, payload, account);
  return httpPost<{ order_id: number }>('/orders/stop/create', request).then((envelope) => ({
    orderId: envelope.data.order_id,
  }));
}

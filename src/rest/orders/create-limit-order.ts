import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CreateLimitOrderParams, CreateOrderResult } from '../types';
import { buildLimitOrderPayload } from './payloads';

export function createLimitOrder(
  params: CreateLimitOrderParams,
  account?: string,
): Promise<CreateOrderResult> {
  const payload = buildLimitOrderPayload(params);
  const request = buildSignedRequest(OperationType.CreateOrder, payload, account);
  return httpPost<{ order_id: number }>('/orders/create', request).then((envelope) => ({
    orderId: envelope.data.order_id,
  }));
}

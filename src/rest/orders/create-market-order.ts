import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CreateMarketOrderParams, CreateOrderResult } from '../types';
import { buildMarketOrderPayload } from './payloads';

export function createMarketOrder(
  params: CreateMarketOrderParams,
  signer?: Signer,
): Promise<CreateOrderResult> {
  const payload = buildMarketOrderPayload(params);
  const request = buildSignedRequest(OperationType.CreateMarketOrder, payload, signer);
  return httpPost<{ order_id: number }>('/orders/create_market', request).then((envelope) => ({
    orderId: envelope.data.order_id,
  }));
}

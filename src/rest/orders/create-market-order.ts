import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CreateMarketOrderParams, CreateOrderResult } from '../types';
import { buildMarketOrderPayload } from './payloads';

export function createMarketOrder(
  params: CreateMarketOrderParams,
  label: string,
): Promise<CreateOrderResult> {
  const payload = buildMarketOrderPayload(params);
  const request = buildSignedRequest(OperationType.CreateMarketOrder, payload, label);
  return httpPost<{ order_id: number }>('/orders/create_market', request, label).then(
    (envelope) => ({
      orderId: envelope.data.order_id,
    }),
  );
}

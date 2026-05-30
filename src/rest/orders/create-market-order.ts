import type { PacificaClient } from '../../common/config';
import type { CreateMarketOrderParams, CreateOrderResult } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import { buildMarketOrderPayload } from './payloads';

export function createMarketOrder(
  client: PacificaClient,
  params: CreateMarketOrderParams,
  label: string,
): Promise<CreateOrderResult> {
  const payload = buildMarketOrderPayload(params);
  const request = buildSignedRequest(client, OperationType.CreateMarketOrder, payload, label);
  return httpPost<{ order_id: number }>(client, '/orders/create_market', request, label).then(
    (envelope) => ({
      orderId: envelope.data.order_id,
    }),
  );
}

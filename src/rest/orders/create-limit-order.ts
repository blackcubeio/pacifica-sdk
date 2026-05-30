import type { PacificaClient } from '../../common/config';
import type { CreateLimitOrderParams, CreateOrderResult } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import { buildLimitOrderPayload } from './payloads';

export function createLimitOrder(
  client: PacificaClient,
  params: CreateLimitOrderParams,
  label: string,
): Promise<CreateOrderResult> {
  const payload = buildLimitOrderPayload(params);
  const request = buildSignedRequest(client, OperationType.CreateOrder, payload, label);
  return httpPost<{ order_id: number }>(client, '/orders/create', request, label).then(
    (envelope) => ({
      orderId: envelope.data.order_id,
    }),
  );
}

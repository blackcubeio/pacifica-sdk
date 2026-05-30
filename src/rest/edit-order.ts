import type { PacificaClient } from '../common/config';
import type { EditOrderParams, EditOrderResult } from '../common/types';
import { OperationType } from '../common/types';
import { httpPost } from './client';
import { buildEditOrderPayload } from './orders/payloads';
import { buildSignedRequest } from './signing';

/** Modifie un ordre actif (**écriture signée**, Pacifica `/orders/edit`). */
export function editOrder(
  client: PacificaClient,
  params: EditOrderParams,
  label: string,
): Promise<EditOrderResult> {
  const payload = buildEditOrderPayload({
    symbol: params.name,
    price: params.price,
    amount: params.size,
    orderId: params.id === undefined ? undefined : Number(params.id),
    clientOrderId: params.clientId,
  });
  const request = buildSignedRequest(client, OperationType.EditOrder, payload, label);
  return httpPost<{ order_id: number }>(client, '/orders/edit', request, label).then(
    (envelope) => ({
      name: params.name,
      id: String(envelope.data.order_id),
    }),
  );
}

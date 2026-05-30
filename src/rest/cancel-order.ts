import type { PacificaClient } from '../common/config';
import type { CancelOrderParams } from '../common/types';
import { OperationType } from '../common/types';
import { httpPost } from './client';
import { buildCancelOrderPayload } from './orders/payloads';
import { buildSignedRequest } from './signing';

/** Annule un ordre actif (**écriture signée**, Pacifica `/orders/cancel`). */
export function cancelOrder(
  client: PacificaClient,
  params: CancelOrderParams,
  label: string,
): Promise<void> {
  const payload = buildCancelOrderPayload({
    symbol: params.name,
    orderId: params.id === undefined ? undefined : Number(params.id),
    clientOrderId: params.clientId,
  });
  const request = buildSignedRequest(client, OperationType.CancelOrder, payload, label);
  return httpPost<null>(client, '/orders/cancel', request, label).then(() => undefined);
}

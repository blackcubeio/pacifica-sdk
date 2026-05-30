import type { CancelOrderParams } from '../common/types';
import type { MarketKind } from '../common/types';
import { OperationType } from '../common/types';
import { httpPost } from './client';
import { buildCancelOrderPayload } from './orders/payloads';
import { buildSignedRequest } from './signing';

/** Annule un ordre actif (**écriture signée**, Pacifica `/orders/cancel`). */
export function cancelOrder(params: CancelOrderParams, label: string): Promise<void> {
  const payload = buildCancelOrderPayload({
    symbol: params.name,
    orderId: params.id === undefined ? undefined : Number(params.id),
    clientOrderId: params.clientId,
  });
  const request = buildSignedRequest(OperationType.CancelOrder, payload, label);
  return httpPost<null>('/orders/cancel', request, label).then(() => undefined);
}

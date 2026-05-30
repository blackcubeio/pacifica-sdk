import type { EditOrderParams, EditOrderResult } from '../common/types';
import type { MarketKind } from '../common/types';
import { OperationType } from '../common/types';
import { httpPost } from './client';
import { buildEditOrderPayload } from './orders/payloads';
import { buildSignedRequest } from './signing';

/** Modifie un ordre actif (**écriture signée**, Pacifica `/orders/edit`). */
export function editOrder(params: EditOrderParams, label: string): Promise<EditOrderResult> {
  const payload = buildEditOrderPayload({
    symbol: params.name,
    price: params.price,
    amount: params.size,
    orderId: params.id === undefined ? undefined : Number(params.id),
    clientOrderId: params.clientId,
  });
  const request = buildSignedRequest(OperationType.EditOrder, payload, label);
  return httpPost<{ order_id: number }>('/orders/edit', request, label).then((envelope) => ({
    name: params.name,
    id: String(envelope.data.order_id),
  }));
}

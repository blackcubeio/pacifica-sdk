import type { CancelAllOrdersParams, CancelAllResult } from '../common/types';
import type { MarketKind } from '../common/types';
import { OperationType } from '../common/types';
import { httpPost } from './client';
import { buildCancelAllOrdersPayload } from './orders/payloads';
import { buildSignedRequest } from './signing';

/** Annule tous les ordres ouverts (**écriture signée**, Pacifica `/orders/cancel_all`). */
export function cancelAllOrders(
  params: CancelAllOrdersParams,
  label: string,
): Promise<CancelAllResult> {
  const payload = buildCancelAllOrdersPayload({
    allSymbols: params.name === undefined,
    excludeReduceOnly: false,
    symbol: params.name,
  });
  const request = buildSignedRequest(OperationType.CancelAllOrders, payload, label);
  return httpPost<{ cancelled_count: number }>('/orders/cancel_all', request, label).then(
    (envelope) => ({ cancelled: envelope.data.cancelled_count }),
  );
}

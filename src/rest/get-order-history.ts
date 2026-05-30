import type { PacificaClient } from '../common/config';
import type { GetOrderHistoryParams } from '../common/types';
import type { Order } from '../common/types';
import { OrderHistoryConverter, type OrderHistoryNative } from '../converters/order-history';
import { httpGet } from './client';

/**
 * Historique d'ordres au **format unifié** `Order` (Pacifica `/orders/history`).
 * Le curseur de pagination n'est pas repris dans le tableau unifié.
 */
export function getOrderHistory(
  client: PacificaClient,
  params: GetOrderHistoryParams,
  label?: string,
): Promise<Order[]> {
  const converter = new OrderHistoryConverter();
  return httpGet<OrderHistoryNative[]>(
    client,
    '/orders/history',
    { account: params.user, limit: params.limit, cursor: params.cursor },
    label,
  ).then((envelope) => {
    const orders = envelope.data.map((entry) => converter.toCommon(entry));
    return params.name === undefined ? orders : orders.filter((o) => o.name === params.name);
  });
}

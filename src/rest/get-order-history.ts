import type { Order } from '../common/types';
import { httpGet } from './client';
import { OrderHistoryConverter, type OrderHistoryNative } from './converters/order-history';

/** Paramètres unifiés (mêmes champs sur les SDK concernés). */
export interface GetOrderHistoryParams {
  /** Adresse du compte (clé publique), **requise** côté Pacifica. */
  user: string;
  /** Filtre optionnel sur une paire. */
  name?: string;
  /** Nombre max. */
  limit?: number;
  /** Curseur de pagination (Pacifica). */
  cursor?: string;
}

/**
 * Historique d'ordres au **format unifié** `Order` (Pacifica `/orders/history`).
 * Le curseur de pagination n'est pas repris dans le tableau unifié.
 */
export function getOrderHistory(params: GetOrderHistoryParams, label?: string): Promise<Order[]> {
  const converter = new OrderHistoryConverter();
  return httpGet<OrderHistoryNative[]>(
    '/orders/history',
    { account: params.user, limit: params.limit, cursor: params.cursor },
    label,
  ).then((envelope) => {
    const orders = envelope.data.map((entry) => converter.toCommon(entry));
    return params.name === undefined ? orders : orders.filter((o) => o.name === params.name);
  });
}

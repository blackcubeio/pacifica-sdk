import type { Order } from '../common/types';
import { httpGet } from './client';
import { OrderConverter, type OrderNative } from '../converters/order';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetOpenOrdersParams {
  /** Adresse du compte (clé publique), **requise** côté Pacifica. */
  user: string;
  /** Filtre optionnel sur une paire (appliqué côté client). */
  name?: string;
}

/** Ordres ouverts au **format unifié** `Order` (Pacifica `/orders`). */
export function getOpenOrders(params: GetOpenOrdersParams, label?: string): Promise<Order[]> {
  const converter = new OrderConverter();
  return httpGet<OrderNative[]>('/orders', { account: params.user }, label).then((envelope) => {
    const orders = envelope.data.map((order) => converter.toCommon(order));
    return params.name === undefined ? orders : orders.filter((o) => o.name === params.name);
  });
}

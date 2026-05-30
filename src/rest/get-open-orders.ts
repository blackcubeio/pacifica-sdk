import type { PacificaClient } from '../common/config';
import type { GetOpenOrdersParams } from '../common/types';
import type { Order } from '../common/types';
import { OrderConverter, type OrderNative } from '../converters/order';
import { httpGet } from './client';

/** Ordres ouverts au **format unifié** `Order` (Pacifica `/orders`). */
export function getOpenOrders(
  client: PacificaClient,
  params: GetOpenOrdersParams,
  label?: string,
): Promise<Order[]> {
  const converter = new OrderConverter();
  return httpGet<OrderNative[]>(client, '/orders', { account: params.user }, label).then(
    (envelope) => {
      const orders = envelope.data.map((order) => converter.toCommon(order));
      return params.name === undefined ? orders : orders.filter((o) => o.name === params.name);
    },
  );
}

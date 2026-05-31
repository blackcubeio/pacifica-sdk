import type { BatchAction, BatchResult } from '../common/native';
import { BatchActionType } from '../common/native';
import type { Order, Side } from '../common/types';
import { OrderHistoryByIdConverter } from './order-history-by-id';

/** Type d'ordre unifié déduit pour un ordre créé via `placeStop` / leg `Create` de batch. */
function legType(action: BatchAction): Order['type'] {
  switch (action.type) {
    case BatchActionType.Create:
      return 'limit';
    case BatchActionType.CreateMarket:
      return 'market';
    default:
      return 'other';
  }
}

function legSide(side: string): Side {
  return side === 'bid' ? 'buy' : 'sell';
}

/**
 * Sortie normalisée d'un **lot** d'ordres : `BatchResult` (1 résultat par action) → `Order[]`.
 * Seuls les legs **créateurs** (`Create`/`CreateMarket`) produisent un `Order` (id/side/size/prix
 * dérivés du leg) ; les legs `Cancel`/`Edit`/`Tpsl`/`CancelStop` sont ignorés (pas un ordre neuf).
 * L'échec d'un leg donne `status:'rejected'`. Le résultat natif complet va dans `xtras`.
 */
export function batchResultToOrders(actions: BatchAction[], result: BatchResult): Order[] {
  const orders: Order[] = [];
  actions.forEach((action, i) => {
    if (action.type !== BatchActionType.Create && action.type !== BatchActionType.CreateMarket) {
      return;
    }
    const wire = result.results[i];
    const params = action.params;
    const price = action.type === BatchActionType.Create ? action.params.price : null;
    orders.push({
      name: params.symbol,
      kind: 'perp',
      id: wire?.orderId === undefined ? '' : String(wire.orderId),
      clientId: params.clientOrderId ?? null,
      side: legSide(params.side),
      type: legType(action),
      price,
      size: params.amount,
      filled: '0',
      status: wire?.success === false ? 'rejected' : 'open',
      tif: null,
      reduceOnly: params.reduceOnly ?? null,
      time: Date.now(),
      xtras: { result: wire },
    });
  });
  return orders;
}

/**
 * Sortie normalisée d'un **stop** créé (`createStopOrder` ne renvoie qu'un `order_id`) → `Order`.
 * Les autres champs (side/size/prix) sont repris de l'entrée signée. `type` = stop (limite) ou
 * stopMarket (sans limite). Le `triggerPrice` natif va dans `xtras`.
 */
export function stopOrderToCommon(input: {
  name: string;
  side: Side;
  reduceOnly: boolean;
  stopPrice: string;
  limitPrice?: string;
  size?: string;
  clientId?: string;
  orderId: number;
}): Order {
  return {
    name: input.name,
    kind: 'perp',
    id: String(input.orderId),
    clientId: input.clientId ?? null,
    side: input.side,
    type: input.limitPrice === undefined ? 'stopMarket' : 'stop',
    price: input.limitPrice ?? null,
    size: input.size ?? '0',
    filled: '0',
    status: 'open',
    tif: null,
    reduceOnly: input.reduceOnly,
    time: Date.now(),
    xtras: { stopPrice: input.stopPrice },
  };
}

export { OrderHistoryByIdConverter };

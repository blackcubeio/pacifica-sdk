import {
  type OrderHistoryEventType,
  OrderSide,
  type OrderStatus,
  type OrderType,
} from '../common/native';
import type { Order } from '../common/types';

/** Forme camelCase renvoyée par `getOrderHistoryById` (cf. rest `/orders/history_by_id`). */
export interface OrderHistoryByIdEntry {
  historyId: number;
  orderId: number;
  clientOrderId: string | null;
  symbol: string;
  side: OrderSide;
  price: string;
  initialAmount: string;
  filledAmount: string;
  cancelledAmount: string;
  eventType: OrderHistoryEventType;
  orderType: OrderType;
  orderStatus: OrderStatus;
  stopPrice: string | null;
  stopParentOrderId: number | null;
  reduceOnly: boolean;
  createdAt: number;
}

const TYPE: Record<string, Order['type']> = {
  limit: 'limit',
  market: 'market',
  stop_limit: 'stop',
  stop_market: 'stopMarket',
  take_profit_limit: 'takeProfit',
  take_profit_market: 'takeProfitMarket',
  stop_loss_limit: 'stop',
  stop_loss_market: 'stopMarket',
};
const STATUS: Record<string, Order['status']> = {
  open: 'open',
  partially_filled: 'partiallyFilled',
  filled: 'filled',
  cancelled: 'canceled',
  rejected: 'rejected',
};

/**
 * Convertisseur ordre **par id** → {@link Order} (type commun). `getById` renvoie l'**état courant**
 * d'un ordre, dérivé de la dernière entrée d'historique. `type`/`status`/`side` unifiés ; le reste
 * (eventType, cancelledAmount, stopPrice, stopParentOrderId, historyId…) va dans `xtras`.
 */
export class OrderHistoryByIdConverter {
  toCommon(entry: OrderHistoryByIdEntry): Order {
    return {
      name: entry.symbol,
      kind: 'perp',
      id: String(entry.orderId),
      clientId: entry.clientOrderId,
      side: entry.side === OrderSide.Bid ? 'buy' : 'sell',
      type: TYPE[entry.orderType as string] ?? 'other',
      price: entry.price,
      size: entry.initialAmount,
      filled: entry.filledAmount,
      status: STATUS[entry.orderStatus as string] ?? 'other',
      tif: null,
      reduceOnly: entry.reduceOnly,
      time: entry.createdAt,
      xtras: {
        historyId: entry.historyId,
        eventType: entry.eventType,
        cancelledAmount: entry.cancelledAmount,
        stopPrice: entry.stopPrice,
        stopParentOrderId: entry.stopParentOrderId,
      },
    };
  }
}

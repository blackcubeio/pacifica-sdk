import type { MarketKind, Order, Side } from '../common/types';
import { createLimitOrder } from './orders/create-limit-order';
import { createMarketOrder } from './orders/create-market-order';
import { OrderSide, TimeInForce } from './types';

/** Type d'ordre unifié supporté par Pacifica (`placeOrder`). */
export type PlaceOrderType = 'limit' | 'market';
/** Time-in-force unifié. */
export type PlaceOrderTif = 'gtc' | 'ioc' | 'fok' | 'alo';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface PlaceOrderParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Type de marché ; défaut `perp`. */
  kind?: MarketKind;
  /** Sens. */
  side: Side;
  /** Type d'ordre (`limit`/`market`). */
  type: PlaceOrderType;
  /** Quantité (chaîne décimale). */
  size: string;
  /** Prix limite (requis pour `limit`). */
  price?: string;
  /** Time-in-force (limit). */
  tif?: PlaceOrderTif;
  /** Reduce-only. */
  reduceOnly?: boolean;
  /** Client order id. */
  clientId?: string;
  /** Slippage max en % (ordres `market` Pacifica) ; défaut `1`. */
  slippagePercent?: string;
}

const SIDE: Record<Side, OrderSide> = { buy: OrderSide.Bid, sell: OrderSide.Ask };
const TIF: Record<PlaceOrderTif, TimeInForce> = {
  gtc: TimeInForce.Gtc,
  ioc: TimeInForce.Ioc,
  fok: TimeInForce.Fok,
  alo: TimeInForce.Alo,
};

/**
 * Passe un ordre au **format unifié** (**écriture signée**, Pacifica `/orders/create(_market)`).
 * La réponse native ne contient que l'`order_id` → l'`Order` retourné est construit depuis
 * les paramètres (statut `open`, `filled` `0`).
 */
export function placeOrder(params: PlaceOrderParams, label: string): Promise<Order> {
  const side = SIDE[params.side];
  const result =
    params.type === 'market'
      ? createMarketOrder(
          {
            symbol: params.name,
            amount: params.size,
            side,
            slippagePercent: params.slippagePercent ?? '1',
            reduceOnly: params.reduceOnly,
            clientOrderId: params.clientId,
          },
          label,
        )
      : createLimitOrder(
          {
            symbol: params.name,
            price: params.price ?? '0',
            amount: params.size,
            side,
            tif: params.tif === undefined ? undefined : TIF[params.tif],
            reduceOnly: params.reduceOnly,
            clientOrderId: params.clientId,
          },
          label,
        );
  return result.then((res) => ({
    name: params.name,
    kind: 'perp',
    id: String(res.orderId),
    clientId: params.clientId ?? null,
    side: params.side,
    type: params.type,
    price: params.price ?? null,
    size: params.size,
    filled: '0',
    status: 'open',
    tif: params.tif ?? null,
    reduceOnly: params.reduceOnly ?? null,
    time: Date.now(),
    xtras: { orderId: res.orderId },
  }));
}

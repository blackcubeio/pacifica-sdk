import { OrderSide } from '../common/native';
import type { Position } from '../common/types';

/** Position native Pacifica (`/positions`, clés snake_case). */
export interface PositionNative {
  symbol: string;
  side: OrderSide;
  amount: string;
  entry_price: string;
  margin: string;
  funding: string;
  isolated: boolean;
  liquidation_price: string | null;
  created_at: number;
  updated_at: number;
}

/**
 * Convertisseur **bijectif** position : `toCommon(native) → Position` / inverse.
 * `side` (long/short) dérivé du `side` natif (`bid`→long, `ask`→short ; conservé dans `xtras`).
 * Pacifica ne fournit ni markPrice ni uPnl ni levier ici (`null`). Bijection totale.
 */
export class PositionConverter {
  toCommon(wire: PositionNative): Position {
    const { symbol, amount, entry_price, margin, liquidation_price, ...rest } = wire;
    return {
      name: symbol,
      side: rest.side === OrderSide.Bid ? 'long' : 'short',
      size: amount,
      entryPrice: entry_price,
      markPrice: null,
      unrealizedPnl: null,
      leverage: null,
      liquidationPrice: liquidation_price,
      margin,
      xtras: rest as Record<string, unknown>,
    };
  }

  toNative(position: Position): PositionNative {
    return {
      symbol: position.name,
      amount: position.size,
      entry_price: position.entryPrice as string,
      margin: position.margin as string,
      liquidation_price: position.liquidationPrice,
      ...position.xtras,
    } as unknown as PositionNative;
  }
}

// ── WebSocket (unidirectionnel) ───────────────────────────────────────────────

/**
 * Payload WS `account_positions` Pacifica — array (snapshot) d'éléments aux clés courtes
 * `{s, d, a, p, m, f, i, l, t}`. `d`=side (bid=long/ask=short), `a`=taille, `p`=prix d'entrée,
 * `m`=marge, `f`=funding, `i`=isolated, `l`=levier, `t`=temps.
 */
export interface PositionWsNative {
  s: string;
  d: string;
  a: string;
  p: string;
  m: string;
  f: string;
  i: boolean;
  l: number | null;
  t: number;
}

/**
 * Convertisseur WS **unidirectionnel** position → {@link Position}.
 * `side` (long/short depuis `d`), `leverage`=`l`. markPrice/unrealizedPnl non fournis (`null`) ;
 * pas de prix de liquidation dans ce flux (`null`). Le hors-cœur (`f, i, t`) va dans `xtras`.
 */
export class PositionWsConverter {
  toCommon(wire: PositionWsNative): Position {
    const { s, d, a, p, m, l, ...rest } = wire;
    return {
      name: s,
      side: d === OrderSide.Bid ? 'long' : 'short',
      size: a,
      entryPrice: p,
      markPrice: null,
      unrealizedPnl: null,
      leverage: l,
      liquidationPrice: null,
      margin: m,
      xtras: rest as Record<string, unknown>,
    };
  }
}

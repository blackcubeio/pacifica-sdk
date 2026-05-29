import type { Position } from '../../common/types';
import { OrderSide } from '../types';

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

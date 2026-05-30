import type { Price } from '../common/types';

/** Snapshot natif Pacifica (`/info/prices`, clés snake_case). */
export interface PriceNative {
  symbol: string;
  mark: string;
  mid: string;
  oracle: string;
  funding: string;
  next_funding: string;
  open_interest: string;
  volume_24h: string;
  yesterday_price: string;
  timestamp: number;
}

/**
 * Convertisseur **bijectif** prix : `toCommon(native) → Price` / `toNative(price) → native`.
 * Pacifica = perp. `next_funding` (rate, non standard) → `xtras` → bijection totale.
 */
export class PriceConverter {
  toCommon(wire: PriceNative): Price {
    return {
      name: wire.symbol,
      kind: 'perp',
      mark: wire.mark,
      oracle: wire.oracle,
      mid: wire.mid,
      bid: null,
      ask: null,
      last: null,
      funding: wire.funding,
      openInterest: wire.open_interest,
      volume24h: wire.volume_24h,
      prevDayPrice: wire.yesterday_price,
      time: wire.timestamp,
      xtras: { next_funding: wire.next_funding },
    };
  }

  toNative(price: Price): PriceNative {
    const xtras = price.xtras ?? {};
    return {
      symbol: price.name,
      mark: price.mark as string,
      mid: price.mid as string,
      oracle: price.oracle as string,
      funding: price.funding as string,
      next_funding: xtras.next_funding as string,
      open_interest: price.openInterest as string,
      volume_24h: price.volume24h as string,
      yesterday_price: price.prevDayPrice as string,
      timestamp: price.time as number,
    };
  }
}

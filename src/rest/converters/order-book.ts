import type { MarketKind, OrderBook, OrderBookLevel } from '../../common/types';

/** Niveau natif Pacifica (`/book`). */
export interface OrderBookLevelNative {
  p: string;
  a: string;
  n: number;
}

/** Carnet natif Pacifica (`/book`, champ `data`). `l = [bids, asks]`. */
export interface OrderBookNative {
  s: string;
  l: [OrderBookLevelNative[], OrderBookLevelNative[]];
  t: number;
}

/**
 * Convertisseur **bijectif** carnet : `toCommon(native) → OrderBook` / `toNative(book) → native`.
 * Pacifica = perp uniquement (`kind` constant). `name`/`time`/niveaux viennent du wire ;
 * `n` (nb d'ordres) conservé. Rien hors cœur → pas de `xtras` → bijection totale.
 */
export class OrderBookConverter {
  constructor(private readonly kind: MarketKind = 'perp') {}

  toCommon(wire: OrderBookNative): OrderBook {
    return {
      name: wire.s,
      kind: this.kind,
      bids: wire.l[0].map(toLevel),
      asks: wire.l[1].map(toLevel),
      time: wire.t,
    };
  }

  toNative(book: OrderBook): OrderBookNative {
    return {
      s: book.name,
      l: [book.bids.map(toNativeLevel), book.asks.map(toNativeLevel)],
      t: book.time as number,
    };
  }
}

function toLevel(level: OrderBookLevelNative): OrderBookLevel {
  return { price: level.p, size: level.a, n: level.n };
}

function toNativeLevel(level: OrderBookLevel): OrderBookLevelNative {
  return { p: level.price, a: level.size, n: level.n as number };
}

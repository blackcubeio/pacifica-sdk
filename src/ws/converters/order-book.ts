import type { MarketKind, OrderBook, OrderBookLevel } from '../../common/types';

/** Niveau natif du book WS Pacifica — `{p, a, n}` (prix, taille, nb d'ordres). */
export interface BookLevelNative {
  p: string;
  a: string;
  n: number;
}

/** Payload WS `book` Pacifica — `{s, l: [bids, asks]}` (snapshot ; requiert `agg_level`). */
export interface OrderBookWsNative {
  s: string;
  l: [BookLevelNative[], BookLevelNative[]];
}

/**
 * Convertisseur WS **unidirectionnel** carnet → {@link OrderBook}.
 * Pacifica fournit `n` par niveau. Pas de timestamp dans le payload → `time = null`.
 */
export class OrderBookWsConverter {
  constructor(private readonly kind: MarketKind) {}

  toCommon(wire: OrderBookWsNative): OrderBook {
    return {
      name: wire.s,
      kind: this.kind,
      bids: wire.l[0].map(toLevel),
      asks: wire.l[1].map(toLevel),
      time: null,
    };
  }
}

function toLevel(level: BookLevelNative): OrderBookLevel {
  return { price: level.p, size: level.a, n: level.n };
}

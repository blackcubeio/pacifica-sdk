import type { MarketKind, OrderBook } from '../common/types';

/** Payload WS `bbo` Pacifica — `{s, i, li, t, b, B, a, A}` (b/B = bid px/sz, a/A = ask px/sz). */
export interface BboWsNative {
  s: string;
  i: number;
  li: number;
  t: number;
  b: string;
  B: string;
  a: string;
  A: string;
}

/**
 * Convertisseur WS **unidirectionnel** BBO → {@link OrderBook} (1 niveau bid + 1 ask).
 * Pacifica ne fournit pas le nb d'ordres (`n = null`). Le hors-cœur (`i, li`) va dans `xtras`.
 */
export class BboWsConverter {
  constructor(private readonly kind: MarketKind) {}

  toCommon(wire: BboWsNative): OrderBook {
    return {
      name: wire.s,
      kind: this.kind,
      bids: [{ price: wire.b, size: wire.B, n: null }],
      asks: [{ price: wire.a, size: wire.A, n: null }],
      time: wire.t,
      xtras: { i: wire.i, li: wire.li },
    };
  }
}

import { describe, expect, it } from 'vitest';
import type { OrderBook } from '../../src/common/types';
import { OrderBookConverter, type OrderBookNative } from '../../src/rest/converters/order-book';

const WIRE: OrderBookNative = {
  s: 'BTC',
  t: 1_700_000_000_000,
  l: [
    [
      { p: '74000.0', a: '1.5', n: 3 },
      { p: '73999.0', a: '2.0', n: 5 },
    ],
    [{ p: '74001.0', a: '0.5', n: 1 }],
  ],
};

describe('OrderBookConverter Pacifica — bijectivité', () => {
  const conv = new OrderBookConverter('perp');

  it('toCommon mappe le carnet (n conservé, pas de xtras)', () => {
    expect(conv.toCommon(WIRE)).toEqual({
      name: 'BTC',
      kind: 'perp',
      bids: [
        { price: '74000.0', size: '1.5', n: 3 },
        { price: '73999.0', size: '2.0', n: 5 },
      ],
      asks: [{ price: '74001.0', size: '0.5', n: 1 }],
      time: 1_700_000_000_000,
    } satisfies OrderBook);
  });

  it('toNative(toCommon(wire)) ≡ wire (aucun champ perdu)', () => {
    expect(conv.toNative(conv.toCommon(WIRE))).toEqual(WIRE);
  });

  it('toCommon(toNative(book)) ≡ book', () => {
    const book = conv.toCommon(WIRE);
    expect(conv.toCommon(conv.toNative(book))).toEqual(book);
  });
});

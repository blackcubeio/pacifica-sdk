import { describe, expect, it } from 'vitest';
import type { Price } from '../../src/common/types';
import { PriceConverter, type PriceNative } from '../../src/rest/converters/price';

const WIRE: PriceNative = {
  symbol: 'BTC',
  mark: '74000.0',
  mid: '74000.5',
  oracle: '73990.0',
  funding: '0.0001',
  next_funding: '0.0002',
  open_interest: '1234.5',
  volume_24h: '987654321.0',
  yesterday_price: '73000.0',
  timestamp: 1_700_000_000_000,
};

describe('PriceConverter Pacifica — bijectivité', () => {
  const conv = new PriceConverter();

  it('toCommon mappe le snapshot (next_funding dans xtras)', () => {
    expect(conv.toCommon(WIRE)).toEqual({
      name: 'BTC',
      kind: 'perp',
      mark: '74000.0',
      oracle: '73990.0',
      mid: '74000.5',
      bid: null,
      ask: null,
      last: null,
      funding: '0.0001',
      openInterest: '1234.5',
      volume24h: '987654321.0',
      prevDayPrice: '73000.0',
      time: 1_700_000_000_000,
      xtras: { next_funding: '0.0002' },
    } satisfies Price);
  });

  it('toNative(toCommon(wire)) ≡ wire', () => {
    expect(conv.toNative(conv.toCommon(WIRE))).toEqual(WIRE);
  });

  it('toCommon(toNative(price)) ≡ price', () => {
    const price = conv.toCommon(WIRE);
    expect(conv.toCommon(conv.toNative(price))).toEqual(price);
  });
});

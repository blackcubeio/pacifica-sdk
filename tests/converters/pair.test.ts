import { describe, expect, it } from 'vitest';
import type { Market } from '../../src/common/native';
import type { Pair } from '../../src/common/types';
import { PairConverter } from '../../src/converters/pair';

const MARKET: Market = {
  symbol: 'BTC',
  tickSize: '0.1',
  minTick: '0.1',
  maxTick: '1000',
  lotSize: '0.001',
  maxLeverage: 50,
  isolatedOnly: false,
  minOrderSize: '0.001',
  maxOrderSize: '100',
  fundingRate: '0.0001',
  nextFundingRate: '0.0001',
  createdAt: 1_700_000_000_000,
};

describe('PairConverter Pacifica — bijectivité', () => {
  const conv = new PairConverter();

  it('toCommon extrait le cœur, le reste va dans xtras', () => {
    expect(conv.toCommon(MARKET)).toEqual({
      name: 'BTC',
      base: 'BTC',
      quote: 'USDC',
      kind: 'perp',
      szDecimals: 3,
      maxLeverage: 50,
      tickSize: '0.1',
      stepSize: '0.001',
      xtras: {
        minTick: '0.1',
        maxTick: '1000',
        isolatedOnly: false,
        minOrderSize: '0.001',
        maxOrderSize: '100',
        fundingRate: '0.0001',
        nextFundingRate: '0.0001',
        createdAt: 1_700_000_000_000,
      },
    } satisfies Pair);
  });

  it('toNative(toCommon(market)) ≡ market (aucun champ perdu)', () => {
    expect(conv.toNative(conv.toCommon(MARKET))).toEqual(MARKET);
  });

  it('toCommon(toNative(pair)) ≡ pair', () => {
    const pair = conv.toCommon(MARKET);
    expect(conv.toCommon(conv.toNative(pair))).toEqual(pair);
  });
});

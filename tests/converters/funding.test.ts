import { describe, expect, it } from 'vitest';
import type { FundingRate } from '../../src/common/types';
import { FundingConverter, type FundingRateNative } from '../../src/rest/converters/funding';

const FUNDING_CORE_KEYS = ['fundingRate', 'name', 'time'];

const WIRE: FundingRateNative = {
  oracle_price: '73990.0',
  bid_impact_price: '73980.0',
  ask_impact_price: '74000.0',
  funding_rate: '0.0001',
  next_funding_rate: '0.00012',
  created_at: 1_700_000_000_000,
};

describe('FundingConverter Pacifica — bijectivité + conformité', () => {
  const conv = new FundingConverter('BTC');

  it('toCommon mappe le point (name du ctor, oracle/impact/next dans xtras)', () => {
    expect(conv.toCommon(WIRE)).toEqual({
      name: 'BTC',
      fundingRate: '0.0001',
      time: 1_700_000_000_000,
      xtras: {
        oracle_price: '73990.0',
        bid_impact_price: '73980.0',
        ask_impact_price: '74000.0',
        next_funding_rate: '0.00012',
      },
    } satisfies FundingRate);
  });

  it('cœur conforme', () => {
    const core = Object.keys(conv.toCommon(WIRE))
      .filter((k) => k !== 'xtras')
      .sort();
    expect(core).toEqual(FUNDING_CORE_KEYS);
  });

  it('toNative(toCommon(wire)) ≡ wire', () => {
    expect(conv.toNative(conv.toCommon(WIRE))).toEqual(WIRE);
  });
});

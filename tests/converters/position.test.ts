import { describe, expect, it } from 'vitest';
import { PositionConverter, type PositionNative } from '../../src/converters/position';
import { OrderSide } from '../../src/common/native';

const POSITION_CORE_KEYS = [
  'entryPrice',
  'leverage',
  'liquidationPrice',
  'margin',
  'markPrice',
  'name',
  'side',
  'size',
  'unrealizedPnl',
];

const WIRE: PositionNative = {
  symbol: 'BTC',
  side: OrderSide.Ask,
  amount: '0.5',
  entry_price: '74000.0',
  margin: '1850.0',
  funding: '0.1',
  isolated: false,
  liquidation_price: '90000.0',
  created_at: 1_700_000_000_000,
  updated_at: 1_700_000_000_500,
};

describe('PositionConverter Pacifica — bijectivité + conformité', () => {
  const conv = new PositionConverter();

  it('toCommon : side long/short du bid/ask, markPrice/uPnl/leverage null', () => {
    const pos = conv.toCommon(WIRE);
    expect(pos.name).toBe('BTC');
    expect(pos.side).toBe('short');
    expect(pos.size).toBe('0.5');
    expect(pos.markPrice).toBeNull();
    expect(pos.leverage).toBeNull();
    expect(pos.margin).toBe('1850.0');
  });

  it('cœur conforme', () => {
    const core = Object.keys(conv.toCommon(WIRE))
      .filter((k) => k !== 'xtras')
      .sort();
    expect(core).toEqual(POSITION_CORE_KEYS);
  });

  it('toNative(toCommon(wire)) ≡ wire', () => {
    expect(conv.toNative(conv.toCommon(WIRE))).toEqual(WIRE);
  });
});

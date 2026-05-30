import { describe, expect, it } from 'vitest';
import type { Trade } from '../../src/common/types';
import { TradeConverter, type TradeNative } from '../../src/converters/trade';
import { TradeCause, TradeEventType, TradeSide } from '../../src/common/native';

/** Clés du cœur unifié (hors xtras) — DOIVENT être identiques sur les 3 SDK. */
const TRADE_CORE_KEYS = ['id', 'maker', 'price', 'side', 'size', 'time'];

const WIRE: TradeNative = {
  event_type: TradeEventType.FulfillTaker,
  price: '74000.0',
  amount: '0.5',
  side: TradeSide.OpenLong,
  cause: TradeCause.Normal,
  created_at: 1_700_000_000_000,
};

describe('TradeConverter Pacifica — bijectivité + conformité', () => {
  const conv = new TradeConverter();

  it('toCommon : side=taker (open_long->buy), maker=false (fulfill_taker), reste dans xtras', () => {
    expect(conv.toCommon(WIRE)).toEqual({
      price: '74000.0',
      size: '0.5',
      side: 'buy',
      maker: false,
      time: 1_700_000_000_000,
      id: null,
      xtras: { event_type: 'fulfill_taker', side: 'open_long', cause: 'normal' },
    } satisfies Trade);
  });

  it('cœur conforme (mêmes clés que les autres SDK)', () => {
    const core = Object.keys(conv.toCommon(WIRE))
      .filter((k) => k !== 'xtras')
      .sort();
    expect(core).toEqual(TRADE_CORE_KEYS);
  });

  it('maker=true pour un fill maker', () => {
    expect(conv.toCommon({ ...WIRE, event_type: TradeEventType.FulfillMaker }).maker).toBe(true);
  });

  it('toNative(toCommon(wire)) ≡ wire', () => {
    expect(conv.toNative(conv.toCommon(WIRE))).toEqual(WIRE);
  });

  it('toCommon(toNative(trade)) ≡ trade', () => {
    const trade = conv.toCommon(WIRE);
    expect(conv.toCommon(conv.toNative(trade))).toEqual(trade);
  });
});

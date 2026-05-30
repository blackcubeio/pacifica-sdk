import { describe, expect, it } from 'vitest';
import { UserTradeConverter, type UserTradeNative } from '../../src/converters/user-trade';
import { TradeCause, TradeEventType, TradeSide } from '../../src/rest/types';

const USER_TRADE_CORE_KEYS = [
  'fee',
  'feeAsset',
  'id',
  'kind',
  'maker',
  'name',
  'orderId',
  'pnl',
  'price',
  'side',
  'size',
  'time',
];

const WIRE: UserTradeNative = {
  history_id: 77,
  order_id: 555,
  client_order_id: 'cli-1',
  symbol: 'BTC',
  amount: '0.5',
  price: '74000.0',
  entry_price: '73000.0',
  fee: '0.5',
  pnl: '12.0',
  event_type: TradeEventType.FulfillMaker,
  side: TradeSide.CloseShort,
  cause: TradeCause.Normal,
  created_at: 1_700_000_000_000,
};

describe('UserTradeConverter Pacifica — bijectivité + conformité', () => {
  const conv = new UserTradeConverter();

  it('toCommon : side close_short->buy, maker (fulfill_maker), feeAsset null, natifs dans xtras', () => {
    const t = conv.toCommon(WIRE);
    expect(t.side).toBe('buy');
    expect(t.maker).toBe(true);
    expect(t.feeAsset).toBeNull();
    expect(t.id).toBe('77');
    expect(t.orderId).toBe('555');
    expect(t.xtras?.entry_price).toBe('73000.0');
  });

  it('cœur conforme', () => {
    const core = Object.keys(conv.toCommon(WIRE))
      .filter((k) => k !== 'xtras')
      .sort();
    expect(core).toEqual(USER_TRADE_CORE_KEYS);
  });

  it('toNative(toCommon(wire)) ≡ wire', () => {
    expect(conv.toNative(conv.toCommon(WIRE))).toEqual(WIRE);
  });
});

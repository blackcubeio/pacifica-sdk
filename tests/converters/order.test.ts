import { describe, expect, it } from 'vitest';
import { OrderSide, OrderType } from '../../src/common/native';
import { OrderConverter, type OrderNative } from '../../src/converters/order';

const ORDER_CORE_KEYS = [
  'clientId',
  'filled',
  'id',
  'kind',
  'name',
  'price',
  'reduceOnly',
  'side',
  'size',
  'status',
  'tif',
  'time',
  'type',
];

const WIRE: OrderNative = {
  order_id: 555,
  client_order_id: 'cli-1',
  symbol: 'BTC',
  side: OrderSide.Ask,
  price: '74000.0',
  initial_amount: '1.0',
  filled_amount: '0.25',
  cancelled_amount: '0.0',
  stop_price: null,
  order_type: OrderType.Limit,
  stop_parent_order_id: null,
  reduce_only: false,
  created_at: 1_700_000_000_000,
  updated_at: 1_700_000_000_500,
};

describe('OrderConverter Pacifica — bijectivité + conformité', () => {
  const conv = new OrderConverter();

  it('toCommon : side ask->sell, type limit, natifs dans xtras', () => {
    const o = conv.toCommon(WIRE);
    expect(o.name).toBe('BTC');
    expect(o.side).toBe('sell');
    expect(o.type).toBe('limit');
    expect(o.status).toBe('open');
    expect(o.size).toBe('1.0');
    expect(o.filled).toBe('0.25');
    expect(o.id).toBe('555');
    expect(o.xtras?.order_type).toBe('limit');
  });

  it('cœur conforme', () => {
    const core = Object.keys(conv.toCommon(WIRE))
      .filter((k) => k !== 'xtras')
      .sort();
    expect(core).toEqual(ORDER_CORE_KEYS);
  });

  it('toNative(toCommon(wire)) ≡ wire', () => {
    expect(conv.toNative(conv.toCommon(WIRE))).toEqual(WIRE);
  });
});

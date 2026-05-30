import { describe, expect, it } from 'vitest';
import {
  OrderHistoryConverter,
  type OrderHistoryNative,
} from '../../src/converters/order-history';
import { OrderCancelReason, OrderSide, OrderStatus, OrderType } from '../../src/common/native';

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

const WIRE: OrderHistoryNative = {
  order_id: 777,
  client_order_id: 'cli-9',
  symbol: 'BTC',
  side: OrderSide.Bid,
  initial_price: '74000.0',
  average_filled_price: '74010.0',
  amount: '1.0',
  filled_amount: '1.0',
  order_status: OrderStatus.Filled,
  order_type: OrderType.Limit,
  stop_price: null,
  stop_parent_order_id: null,
  reduce_only: false,
  reason: OrderCancelReason.Cancel,
  created_at: 1_700_000_000_000,
  updated_at: 1_700_000_000_500,
};

describe('OrderHistoryConverter Pacifica — bijectivité + conformité', () => {
  const conv = new OrderHistoryConverter();

  it('toCommon : status filled, side bid->buy, natifs dans xtras', () => {
    const o = conv.toCommon(WIRE);
    expect(o.status).toBe('filled');
    expect(o.side).toBe('buy');
    expect(o.type).toBe('limit');
    expect(o.id).toBe('777');
    expect(o.xtras?.average_filled_price).toBe('74010.0');
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

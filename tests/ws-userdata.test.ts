import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../src/common/config';
import type { Order } from '../src/common/types';
import { OrderSide } from '../src/common/types';
import { cancelOrder } from '../src/rest/cancel-order';
import { createLimitOrder } from '../src/rest/orders/create-limit-order';
import { UnifiedWsClient } from '../src/ws/unified-client';
import { buildFarBtcLimit, poll, readEnv } from './helpers';

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');

// Flux user-data unifiés sur le testnet réel (ordre far-from-market, annulé après).
describe('UnifiedWsClient Pacifica user-data (testnet réel)', () => {
  beforeAll(() => {
    init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });
  afterAll(() => resetConfig());

  it(
    'subscribeOrders délivre un Order unifié quand un ordre est placé',
    async () => {
      const clientOrderId = globalThis.crypto.randomUUID();
      const orders: Order[] = [];
      const client = new UnifiedWsClient({ label: account });
      await client.connect();
      try {
        client.subscribeOrders({ user: account }, (order) => orders.push(order));
        const { price, amount } = await buildFarBtcLimit();
        await createLimitOrder(
          { symbol: 'BTC', price, amount, side: OrderSide.Bid, clientOrderId },
          account,
        );
        const received = await poll(
          () => Promise.resolve(orders),
          (evs) => evs.some((o) => o.clientId === clientOrderId),
        );
        const order = received.find((o) => o.clientId === clientOrderId) as Order;
        expect(order.name).toBe('BTC');
        expect(order.kind).toBe('perp');
        expect(typeof order.id).toBe('string');
        expect(order.side).toBe('buy');
        expect(order.type).toBe('limit');
        expect(typeof order.price).toBe('string');
        expect(typeof order.size).toBe('string');
        expect(order.reduceOnly).toBe(false);
      } finally {
        await cancelOrder({ name: 'BTC', clientId: clientOrderId }, account).catch(() => {});
        client.disconnect();
      }
    },
    45_000,
  );
});

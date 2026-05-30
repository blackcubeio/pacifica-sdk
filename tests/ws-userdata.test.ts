import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../src/common/config';
import type { Order, Position, UserTrade } from '../src/common/types';
import { OrderSide } from '../src/common/types';
import { getPrices } from '../src/rest/get-prices';
import { getMarketInfo } from '../src/rest/markets/get-market-info';
import { cancelOrder } from '../src/rest/cancel-order';
import { createLimitOrder } from '../src/rest/orders/create-limit-order';
import { createMarketOrder } from '../src/rest/orders/create-market-order';
import { UnifiedWsClient } from '../src/ws/unified-client';
import { buildFarBtcLimit, countDecimals, poll, readEnv } from './helpers';

async function smallBtcAmount(): Promise<string> {
  const [markets, prices] = await Promise.all([getMarketInfo(), getPrices()]);
  const market = markets.find((m) => m.symbol === 'BTC');
  const price = prices.find((p) => p.name === 'BTC');
  if (market === undefined || price === undefined) throw new Error('BTC introuvable');
  const lot = Number(market.lotSize);
  const amount = Math.ceil((Number(market.minOrderSize) * 1.2) / Number(price.mark) / lot) * lot;
  return amount.toFixed(countDecimals(market.lotSize));
}

function waitFor<T>(bucket: T[], pred: (x: T) => boolean, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = setInterval(() => {
      const found = bucket.find(pred);
      if (found !== undefined) {
        clearInterval(tick);
        resolve(found);
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(tick);
        reject(new Error('timeout waitFor'));
      }
    }, 500);
  });
}

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

  it(
    'subscribeUserTrades + subscribePositions sur une position mini ouverte puis refermée',
    async () => {
      const trades: UserTrade[] = [];
      const positions: Position[] = [];
      const client = new UnifiedWsClient({ label: account });
      await client.connect();
      const amount = await smallBtcAmount();
      try {
        client.subscribeUserTrades({ user: account }, (t) => trades.push(t));
        client.subscribePositions({ user: account }, (p) => positions.push(p));
        await new Promise((r) => setTimeout(r, 1500));
        await createMarketOrder(
          { symbol: 'BTC', amount, side: OrderSide.Bid, slippagePercent: '1' },
          account,
        );
        const fill = await waitFor(trades, (t) => t.name === 'BTC', 20_000);
        expect(fill.kind).toBe('perp');
        expect(typeof fill.id).toBe('string');
        expect(typeof fill.orderId).toBe('string');
        expect(['buy', 'sell']).toContain(fill.side);
        expect(typeof fill.price).toBe('string');
        expect(typeof fill.fee).toBe('string');
        expect(typeof fill.maker).toBe('boolean');

        const pos = await waitFor(positions, (p) => p.name === 'BTC', 20_000);
        expect(['long', 'short']).toContain(pos.side);
        expect(typeof pos.size).toBe('string');
        expect(typeof pos.entryPrice).toBe('string');
        expect(pos.markPrice).toBeNull();
      } finally {
        await createMarketOrder(
          { symbol: 'BTC', amount, side: OrderSide.Ask, slippagePercent: '1', reduceOnly: true },
          account,
        ).catch(() => {});
        client.disconnect();
      }
    },
    55_000,
  );
});

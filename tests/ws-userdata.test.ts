import { describe, expect, it } from 'vitest';
import { init } from '../src/common/config';
import type { Order, Position, UserTrade } from '../src/common/types';
import { Pacifica } from '../src/dex/pacifica';
import { getPrices } from '../src/rest/get-prices';
import { getMarketInfo } from '../src/rest/markets/get-market-info';
import { buildFarBtcLimit, countDecimals, poll, readEnv } from './helpers';

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');

// `ctx` : client brut pour les calculs de taille (lots/min) ; `dex` : la façade testée.
const ctx = init({
  signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } },
});

function dex(): Pacifica {
  return new Pacifica(
    { [account]: { secretKey, publicKey: account, network: 'testnet' } },
    { default: account },
  );
}

async function smallBtcAmount(): Promise<string> {
  const [markets, prices] = await Promise.all([getMarketInfo(ctx), getPrices(ctx)]);
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

// Flux user-data unifiés sur le testnet réel (ordre far-from-market, annulé après), via la classe.
describe('Pacifica.ws() user-data (testnet réel)', () => {
  it('subscribeOrders délivre un Order unifié quand un ordre est placé', async () => {
    const hl = dex();
    const clientOrderId = globalThis.crypto.randomUUID();
    const orders: Order[] = [];
    const off = hl.ws().subscribeOrders((order) => orders.push(order));
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const { price, amount } = await buildFarBtcLimit(ctx);
      await hl.perp().place({
        name: 'BTC',
        side: 'buy',
        type: 'limit',
        size: amount,
        price,
        clientId: clientOrderId,
      });
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
      await hl
        .perp()
        .cancel({ name: 'BTC', clientId: clientOrderId })
        .catch(() => {});
      off();
    }
  }, 45_000);

  it('subscribeUserTrades + subscribePositions sur une position mini ouverte puis refermée', async () => {
    const hl = dex();
    const trades: UserTrade[] = [];
    const positions: Position[] = [];
    const offTrades = hl.ws().subscribeUserTrades((t) => trades.push(t));
    const offPos = hl.ws().subscribePositions((p) => positions.push(p));
    const amount = await smallBtcAmount();
    try {
      await new Promise((r) => setTimeout(r, 1500));
      await hl.perp().place({
        name: 'BTC',
        side: 'buy',
        type: 'market',
        size: amount,
      });
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
      await hl
        .perp()
        .place({
          name: 'BTC',
          side: 'sell',
          type: 'market',
          size: amount,
          reduceOnly: true,
        })
        .catch(() => {});
      offTrades();
      offPos();
    }
  }, 55_000);
});

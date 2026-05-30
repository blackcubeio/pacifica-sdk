import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../src/common/config';
import { UnifiedWsClient } from '../src/ws/unified-client';

// Flux WS unifiés sur le mainnet réel (public, sans wallet).
describe('UnifiedWsClient Pacifica (mainnet réel, public)', () => {
  beforeAll(() => init());
  afterAll(() => resetConfig());

  it(
    'subscribeCandles délivre une Candle unifiée',
    async () => {
      const client = new UnifiedWsClient();
      await client.connect();
      try {
        const candle = await new Promise<Record<string, unknown>>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('timeout candles')), 25_000);
          client.subscribeCandles({ name: 'BTC', interval: '1m' }, (received) => {
            clearTimeout(timer);
            resolve(received as unknown as Record<string, unknown>);
          });
        });
        expect(candle.s).toBe('BTC');
        expect(candle.i).toBe('1m');
        expect(candle.kind).toBe('perp');
        expect(typeof candle.t).toBe('number');
        expect(typeof candle.o).toBe('string');
        expect(candle.qv).toBeNull();
        expect(candle.tbbv).toBeNull();
      } finally {
        client.disconnect();
      }
    },
    30_000,
  );

  it(
    'subscribeTrades délivre un Trade unifié par trade',
    async () => {
      const client = new UnifiedWsClient();
      await client.connect();
      try {
        const trade = await new Promise<Record<string, unknown>>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('timeout trades')), 33_000);
          client.subscribeTrades({ name: 'BTC' }, (received) => {
            clearTimeout(timer);
            resolve(received as unknown as Record<string, unknown>);
          });
        });
        expect(typeof trade.price).toBe('string');
        expect(typeof trade.size).toBe('string');
        expect(['buy', 'sell']).toContain(trade.side);
        expect(trade.maker).toBeNull();
        expect(typeof trade.time).toBe('number');
        expect(typeof trade.id).toBe('number');
      } finally {
        client.disconnect();
      }
    },
    38_000,
  );
});

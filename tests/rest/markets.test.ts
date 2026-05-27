import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { getCandleData } from '../../src/rest/markets/get-candle-data';
import { getMarketInfo } from '../../src/rest/markets/get-market-info';
import { getOrderbook } from '../../src/rest/markets/get-orderbook';
import { getPrices } from '../../src/rest/markets/get-prices';
import { getSpotAssets } from '../../src/rest/spot/get-spot-assets';
import { CandleInterval } from '../../src/rest/types';

const NETWORK_TIMEOUT = 20_000;

describe('init guard', () => {
  it('throws when the SDK is not initialized', () => {
    resetConfig();
    expect(() => getMarketInfo()).toThrow('not initialized');
  });
});

describe('markets (testnet, réseau réel)', () => {
  beforeAll(() => {
    init({ network: 'testnet' });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'getMarketInfo returns a non-empty list of markets',
    () => {
      return getMarketInfo().then((markets) => {
        expect(markets.length).toBeGreaterThan(0);
        const market = markets[0];
        expect(typeof market?.symbol).toBe('string');
        expect(typeof market?.maxLeverage).toBe('number');
        expect(typeof market?.tickSize).toBe('string');
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getPrices returns mark/oracle prices',
    () => {
      return getPrices().then((prices) => {
        expect(prices.length).toBeGreaterThan(0);
        const price = prices[0];
        expect(typeof price?.mark).toBe('string');
        expect(typeof price?.oracle).toBe('string');
        expect(typeof price?.timestamp).toBe('number');
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getOrderbook splits bids and asks',
    () => {
      return getOrderbook({ symbol: 'BTC' }).then((orderbook) => {
        expect(orderbook.symbol).toBe('BTC');
        expect(Array.isArray(orderbook.bids)).toBe(true);
        expect(Array.isArray(orderbook.asks)).toBe(true);
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getCandleData returns candles with mapped fields',
    () => {
      const startTime = Date.now() - 60 * 60 * 1000;
      return getCandleData({ symbol: 'BTC', interval: CandleInterval.OneMinute, startTime }).then(
        (candles) => {
          expect(candles.length).toBeGreaterThan(0);
          const candle = candles[0];
          expect(typeof candle?.openTime).toBe('number');
          expect(typeof candle?.open).toBe('string');
        },
      );
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getSpotAssets returns spot assets',
    () => {
      return getSpotAssets().then((assets) => {
        expect(Array.isArray(assets)).toBe(true);
      });
    },
    NETWORK_TIMEOUT,
  );
});

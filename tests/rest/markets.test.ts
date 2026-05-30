import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { getOrderBook } from '../../src/rest/get-order-book';
import { getPairs } from '../../src/rest/get-pairs';
import { getPrices } from '../../src/rest/get-prices';
import { getCandleData } from '../../src/rest/markets/get-candle-data';
import { getMarketInfo } from '../../src/rest/markets/get-market-info';
import { getSpotAssets } from '../../src/rest/spot/get-spot-assets';
import { CandleInterval } from '../../src/common/native';
import { readEnv } from '../helpers';

const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const NETWORK_TIMEOUT = 20_000;

describe('init guard', () => {
  it('throws when the SDK is not initialized', () => {
    resetConfig();
    expect(() => getMarketInfo()).toThrow('not initialized');
  });
});

describe('markets (testnet, réseau réel)', () => {
  beforeAll(() => {
    init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'getMarketInfo returns a non-empty list of markets',
    () => {
      return getMarketInfo(account).then((markets) => {
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
    'getPairs returns the unified Pair format (perp)',
    () => {
      return getPairs(account).then((pairs) => {
        expect(pairs.length).toBeGreaterThan(0);
        const btc = pairs.find((p) => p.base === 'BTC' && p.kind === 'perp');
        expect(btc?.name).toBe('BTC');
        expect(btc?.quote).toBe('USDC');
        expect(typeof btc?.szDecimals).toBe('number');
        expect(typeof btc?.maxLeverage).toBe('number');
        expect(typeof btc?.tickSize).toBe('string');
        expect(typeof btc?.xtras).toBe('object');
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getPrices renvoie les prix unifiés (mark/oracle/time)',
    () => {
      return getPrices(account).then((prices) => {
        expect(prices.length).toBeGreaterThan(0);
        const price = prices[0];
        expect(price?.kind).toBe('perp');
        expect(typeof price?.mark).toBe('string');
        expect(typeof price?.oracle).toBe('string');
        expect(typeof price?.time).toBe('number');
        expect(typeof price?.xtras?.next_funding).toBe('string');
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getOrderBook renvoie le carnet unifié',
    () => {
      return getOrderBook({ name: 'BTC' }, account).then((book) => {
        expect(book.name).toBe('BTC');
        expect(book.kind).toBe('perp');
        expect(Array.isArray(book.bids)).toBe(true);
        expect(Array.isArray(book.asks)).toBe(true);
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getCandleData returns candles with mapped fields',
    () => {
      const startTime = Date.now() - 60 * 60 * 1000;
      return getCandleData(
        { symbol: 'BTC', interval: CandleInterval.OneMinute, startTime },
        account,
      ).then((candles) => {
        expect(candles.length).toBeGreaterThan(0);
        const candle = candles[0];
        expect(typeof candle?.t).toBe('number');
        expect(typeof candle?.o).toBe('string');
        expect(candle?.s).toBe('BTC');
        expect(candle?.kind).toBe('perp');
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getSpotAssets returns spot assets',
    () => {
      return getSpotAssets({}, account).then((assets) => {
        expect(Array.isArray(assets)).toBe(true);
      });
    },
    NETWORK_TIMEOUT,
  );
});

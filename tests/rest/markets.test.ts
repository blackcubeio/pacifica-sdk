import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { getPairs } from '../../src/rest/get-pairs';
import { getCandleData } from '../../src/rest/markets/get-candle-data';
import { getMarketInfo } from '../../src/rest/markets/get-market-info';
import { getOrderbook } from '../../src/rest/markets/get-orderbook';
import { getPrices } from '../../src/rest/markets/get-prices';
import { getSpotAssets } from '../../src/rest/spot/get-spot-assets';
import { CandleInterval } from '../../src/rest/types';
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
        expect(typeof btc?.raw).toBe('object');
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getPrices returns mark/oracle prices',
    () => {
      return getPrices(account).then((prices) => {
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
      return getOrderbook({ symbol: 'BTC' }, account).then((orderbook) => {
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

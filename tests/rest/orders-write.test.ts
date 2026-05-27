import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { OrderSide } from '../../src/common/types';
import { getMarketInfo } from '../../src/rest/markets/get-market-info';
import { getPrices } from '../../src/rest/markets/get-prices';
import { cancelAllOrders } from '../../src/rest/orders/cancel-all-orders';
import { cancelOrder } from '../../src/rest/orders/cancel-order';
import { createLimitOrder } from '../../src/rest/orders/create-limit-order';

function readEnv(name: string): string {
  const content = readFileSync(new URL('../../.env', import.meta.url), 'utf-8');
  const line = content.split('\n').find((entry) => entry.startsWith(`${name}=`));
  if (line === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  return line.slice(name.length + 1).trim();
}

function countDecimals(step: string): number {
  const dotIndex = step.indexOf('.');
  return dotIndex === -1 ? 0 : step.length - dotIndex - 1;
}

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 30_000;

describe('orders write (testnet, ordres réels)', () => {
  beforeAll(() => {
    init({ network: 'testnet', signer: { secretKey, account } });
  });

  afterAll(() => {
    return cancelAllOrders({ allSymbols: true, excludeReduceOnly: false }).then(() => {
      resetConfig();
    });
  });

  it(
    'places a far limit order then cancels it',
    () => {
      return getMarketInfo().then((markets) => {
        const market = markets.find((entry) => entry.symbol === 'BTC');
        if (market === undefined) {
          throw new Error('BTC market not found on testnet');
        }
        const priceDecimals = countDecimals(market.tickSize);
        const amountDecimals = countDecimals(market.lotSize);
        const tick = Number(market.tickSize);
        const lot = Number(market.lotSize);
        const minOrderUsd = Number(market.minOrderSize);

        return getPrices().then((prices) => {
          const btcPrice = prices.find((entry) => entry.symbol === 'BTC');
          if (btcPrice === undefined) {
            throw new Error('BTC price not found on testnet');
          }
          const mark = Number(btcPrice.mark);
          const bidPrice = Math.floor((mark * 0.5) / tick) * tick;
          const targetNotional = minOrderUsd * 2;
          const amount = Math.ceil(targetNotional / bidPrice / lot) * lot;

          return createLimitOrder({
            symbol: 'BTC',
            price: bidPrice.toFixed(priceDecimals),
            amount: amount.toFixed(amountDecimals),
            side: OrderSide.Bid,
          }).then((created) => {
            expect(typeof created.orderId).toBe('number');
            return cancelOrder({ symbol: 'BTC', orderId: created.orderId });
          });
        });
      });
    },
    NETWORK_TIMEOUT,
  );
});

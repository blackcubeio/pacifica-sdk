import { readFileSync } from 'node:fs';
import type { PacificaClient } from '../src/common/config';
import { getPrices } from '../src/rest/get-prices';
import { getMarketInfo } from '../src/rest/markets/get-market-info';

export function readEnv(name: string): string {
  const content = readFileSync(new URL('../.env', import.meta.url), 'utf-8');
  const line = content.split('\n').find((entry) => entry.startsWith(`${name}=`));
  if (line === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  return line.slice(name.length + 1).trim();
}

export function countDecimals(step: string): number {
  const dotIndex = step.indexOf('.');
  return dotIndex === -1 ? 0 : step.length - dotIndex - 1;
}

export function poll<TValue>(
  fetchValue: () => Promise<TValue>,
  predicate: (value: TValue) => boolean,
  timeoutMs = 25_000,
  intervalMs = 2_000,
): Promise<TValue> {
  const deadline = Date.now() + timeoutMs;
  const attempt = (): Promise<TValue> =>
    fetchValue().then((value) => {
      if (predicate(value) === true) {
        return value;
      }
      if (Date.now() > deadline) {
        throw new Error('poll timed out before predicate was satisfied');
      }
      return new Promise<void>((resolve) => setTimeout(resolve, intervalMs)).then(attempt);
    });
  return attempt();
}

export function hasClientOrderId(
  orders: { clientId: string | null }[],
  clientOrderId: string,
): boolean {
  return orders.some((order) => order.clientId === clientOrderId);
}

export function buildFarBtcLimit(
  client: PacificaClient,
): Promise<{ price: string; amount: string }> {
  return Promise.all([getMarketInfo(client), getPrices(client)]).then(([markets, prices]) => {
    const market = markets.find((entry) => entry.symbol === 'BTC');
    const price = prices.find((entry) => entry.name === 'BTC');
    if (market === undefined || price === undefined) {
      throw new Error('BTC market/price not found on testnet');
    }
    const tick = Number(market.tickSize);
    const lot = Number(market.lotSize);
    const bid = Math.floor((Number(price.mark) * 0.5) / tick) * tick;
    const amount = Math.ceil((Number(market.minOrderSize) * 2) / bid / lot) * lot;
    return {
      price: bid.toFixed(countDecimals(market.tickSize)),
      amount: amount.toFixed(countDecimals(market.lotSize)),
    };
  });
}

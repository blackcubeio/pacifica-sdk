import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { getAccountInfo } from '../../src/rest/account/get-account-info';
import { getPositions } from '../../src/rest/account/get-positions';
import { getOpenOrders } from '../../src/rest/orders/get-open-orders';
import { getOrderHistory } from '../../src/rest/orders/get-order-history';
import { getOpenTwapOrder } from '../../src/rest/orders/twap/get-open-twap-order';

function readEnv(name: string): string {
  const content = readFileSync(new URL('../../.env', import.meta.url), 'utf-8');
  const line = content.split('\n').find((entry) => entry.startsWith(`${name}=`));
  if (line === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  return line.slice(name.length + 1).trim();
}

const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const NETWORK_TIMEOUT = 20_000;

describe('account reading (testnet, réseau réel)', () => {
  beforeAll(() => {
    init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'getAccountInfo returns the sub-account balance fields',
    () => {
      return getAccountInfo({ account }, account).then((info) => {
        expect(typeof info.balance).toBe('string');
        expect(typeof info.accountEquity).toBe('string');
        expect(Array.isArray(info.spotBalances)).toBe(true);
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getPositions returns an array',
    () => {
      return getPositions({ account }, account).then((positions) => {
        expect(Array.isArray(positions)).toBe(true);
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getOpenOrders returns an array',
    () => {
      return getOpenOrders({ account }, account).then((orders) => {
        expect(Array.isArray(orders)).toBe(true);
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getOpenTwapOrder returns an array',
    () => {
      return getOpenTwapOrder({ account }, account).then((twapOrders) => {
        expect(Array.isArray(twapOrders)).toBe(true);
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getOrderHistory returns a paginated result',
    () => {
      return getOrderHistory({ account }, account).then((history) => {
        expect(Array.isArray(history.items)).toBe(true);
        expect(typeof history.hasMore).toBe('boolean');
      });
    },
    NETWORK_TIMEOUT,
  );
});

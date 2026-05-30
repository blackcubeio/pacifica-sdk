import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { type PacificaClient, init } from '../../src/common/config';
import { getAccountInfo } from '../../src/rest/account/get-account-info';
import { getOpenOrders } from '../../src/rest/get-open-orders';
import { getOrderHistory } from '../../src/rest/get-order-history';
import { getPositions } from '../../src/rest/get-positions';
import { getOpenTwapOrder } from '../../src/rest/orders/twap/get-open-twap-order';

let client: PacificaClient;

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
    client = init({
      signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } },
    });
  });

  it(
    'getAccountInfo returns the sub-account balance fields',
    () => {
      return getAccountInfo(client, { account }, account).then((info) => {
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
      return getPositions(client, { user: account }, account).then((positions) => {
        expect(Array.isArray(positions)).toBe(true);
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getOpenOrders returns an array',
    () => {
      return getOpenOrders(client, { user: account }, account).then((orders) => {
        expect(Array.isArray(orders)).toBe(true);
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getOpenTwapOrder returns an array',
    () => {
      return getOpenTwapOrder(client, { account }, account).then((twapOrders) => {
        expect(Array.isArray(twapOrders)).toBe(true);
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'getOrderHistory renvoie des ordres unifiés',
    () => {
      return getOrderHistory(client, { user: account }, account).then((orders) => {
        expect(Array.isArray(orders)).toBe(true);
        for (const o of orders) {
          expect(['buy', 'sell']).toContain(o.side);
          expect(typeof o.status).toBe('string');
        }
      });
    },
    NETWORK_TIMEOUT,
  );
});

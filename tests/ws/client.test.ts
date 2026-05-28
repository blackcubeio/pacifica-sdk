import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { WsClient } from '../../src/ws/client';

function readEnv(name: string): string {
  const content = readFileSync(new URL('../../.env', import.meta.url), 'utf-8');
  const line = content.split('\n').find((entry) => entry.startsWith(`${name}=`));
  if (line === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  return line.slice(name.length + 1).trim();
}

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 20_000;

describe('WsClient (testnet, réseau réel)', () => {
  beforeAll(() => {
    init({ network: 'testnet', signers: { [account]: { secretKey } } });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'connects and receives a prices stream message',
    () => {
      const client = new WsClient();
      return client.connect().then(() => {
        return new Promise<void>((resolve) => {
          const unsubscribe = client.subscribePrices((data) => {
            expect(data).not.toBeNull();
            unsubscribe();
            client.disconnect();
            resolve();
          });
        });
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'sends a signed action (cancelAllOrders) over WS and gets a response',
    () => {
      const client = new WsClient();
      return client
        .connect()
        .then(() => client.cancelAllOrders({ allSymbols: true, excludeReduceOnly: false }))
        .then((response) => {
          expect(response).not.toBeNull();
          client.disconnect();
        });
    },
    NETWORK_TIMEOUT,
  );
});

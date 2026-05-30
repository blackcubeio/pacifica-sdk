import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { type PacificaClient, init } from '../../src/common/config';
import { WsClient } from '../../src/ws/client';

let ctx: PacificaClient;

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
const IDLE_TIMEOUT = 90_000;

describe('WsClient (testnet, réseau réel)', () => {
  beforeAll(() => {
    ctx = init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });

  it(
    'connects and receives a prices stream message',
    () => {
      const client = new WsClient(ctx, { label: account });
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
      const client = new WsClient(ctx, { label: account });
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

  it(
    'stays alive while idle past the 60s server timeout thanks to the heartbeat',
    () => {
      const client = new WsClient(ctx, { label: account });
      let closed = false;
      let reconnected = false;
      client.onClose = () => {
        closed = true;
      };
      client.onReconnect = () => {
        reconnected = true;
      };
      return client
        .connect()
        .then(() => new Promise<void>((resolve) => setTimeout(resolve, 65_000)))
        .then(() => {
          // No close/reconnect during the idle window → the 30s ping kept it alive.
          expect(closed).toBe(false);
          expect(reconnected).toBe(false);
          // And the same connection is still functional.
          return new Promise<void>((resolve) => {
            const unsubscribe = client.subscribePrices(() => {
              unsubscribe();
              client.disconnect();
              resolve();
            });
          });
        });
    },
    IDLE_TIMEOUT,
  );
});

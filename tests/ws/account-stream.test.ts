import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import type { JsonValue } from '../../src/common/types';
import { OrderSide } from '../../src/common/types';
import { cancelOrder } from '../../src/rest/cancel-order';
import { createLimitOrder } from '../../src/rest/orders/create-limit-order';
import { WsClient } from '../../src/ws/client';
import { buildFarBtcLimit, poll, readEnv } from '../helpers';

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 40_000;

describe('WS account stream (testnet, voir passer les opérations)', () => {
  beforeAll(() => {
    init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'an order placed via REST is seen on the account_order_updates stream',
    () => {
      const clientOrderId = globalThis.crypto.randomUUID();
      const events: JsonValue[] = [];
      const client = new WsClient({ label: account });

      return client
        .connect()
        .then(() => {
          client.subscribeAccountOrderUpdates((data) => events.push(data));
          return buildFarBtcLimit();
        })
        .then(({ price, amount }) =>
          createLimitOrder(
            { symbol: 'BTC', price, amount, side: OrderSide.Bid, clientOrderId },
            account,
          ),
        )
        .then(() =>
          poll(
            () => Promise.resolve(events),
            (received) => received.some((event) => JSON.stringify(event).includes(clientOrderId)),
          ),
        )
        .then((received) => {
          expect(received.some((event) => JSON.stringify(event).includes(clientOrderId))).toBe(
            true,
          );
          return cancelOrder({ name: 'BTC', clientId: clientOrderId }, account);
        })
        .then(() => {
          client.disconnect();
        });
    },
    NETWORK_TIMEOUT,
  );
});

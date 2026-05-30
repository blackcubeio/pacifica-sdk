import { beforeAll, describe, expect, it } from 'vitest';
import { type PacificaClient, init } from '../../src/common/config';
import type { JsonValue } from '../../src/common/types';
import { OrderSide } from '../../src/common/types';
import { cancelOrder } from '../../src/rest/cancel-order';
import { createLimitOrder } from '../../src/rest/orders/create-limit-order';
import { WsClient } from '../../src/ws/client';
import { buildFarBtcLimit, poll, readEnv } from '../helpers';

let ctx: PacificaClient;

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 40_000;

describe('WS account stream (testnet, voir passer les opérations)', () => {
  beforeAll(() => {
    ctx = init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });

  it(
    'an order placed via REST is seen on the account_order_updates stream',
    () => {
      const clientOrderId = globalThis.crypto.randomUUID();
      const events: JsonValue[] = [];
      const ws = new WsClient(ctx, { label: account });

      return ws
        .connect()
        .then(() => {
          ws.subscribeAccountOrderUpdates((data) => events.push(data));
          return buildFarBtcLimit(ctx);
        })
        .then(({ price, amount }) =>
          createLimitOrder(
            ctx,
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
          return cancelOrder(ctx, { name: 'BTC', clientId: clientOrderId }, account);
        })
        .then(() => {
          ws.disconnect();
        });
    },
    NETWORK_TIMEOUT,
  );
});

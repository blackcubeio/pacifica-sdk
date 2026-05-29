import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { OrderSide } from '../../src/common/types';
import { getOpenOrders } from '../../src/rest/get-open-orders';
import { WsClient } from '../../src/ws/client';
import { buildFarBtcLimit, hasClientOrderId, poll, readEnv } from '../helpers';

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 40_000;

describe('order lifecycle WS (testnet, WS write visible via REST then undone via WS)', () => {
  beforeAll(() => {
    init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'creates an order over WS, sees it via REST, cancels it over WS, then it is gone',
    () => {
      const clientOrderId = globalThis.crypto.randomUUID();
      const client = new WsClient({ label: account });
      return client
        .connect()
        .then(() => buildFarBtcLimit())
        .then(({ price, amount }) =>
          client.createLimitOrder({
            symbol: 'BTC',
            price,
            amount,
            side: OrderSide.Bid,
            clientOrderId,
          }),
        )
        .then((response) => {
          expect(response).not.toBeNull();
          return poll(
            () => getOpenOrders({ user: account }, account),
            (orders) => hasClientOrderId(orders, clientOrderId),
          );
        })
        .then(() => client.cancelOrder({ symbol: 'BTC', clientOrderId }))
        .then(() =>
          poll(
            () => getOpenOrders({ user: account }, account),
            (orders) => hasClientOrderId(orders, clientOrderId) === false,
          ),
        )
        .then((orders) => {
          expect(hasClientOrderId(orders, clientOrderId)).toBe(false);
          client.disconnect();
        });
    },
    NETWORK_TIMEOUT,
  );
});

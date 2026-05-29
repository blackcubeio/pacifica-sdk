import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { OrderSide } from '../../src/common/types';
import { getOpenOrders } from '../../src/rest/get-open-orders';
import { cancelOrder } from '../../src/rest/orders/cancel-order';
import { createLimitOrder } from '../../src/rest/orders/create-limit-order';
import { buildFarBtcLimit, hasClientOrderId, poll, readEnv } from '../helpers';

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 40_000;

describe('order lifecycle REST (testnet, do → visible → undo → gone)', () => {
  beforeAll(() => {
    init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'places a limit order, sees it in open orders, cancels it, then it is gone',
    () => {
      const clientOrderId = globalThis.crypto.randomUUID();
      return buildFarBtcLimit().then(({ price, amount }) =>
        createLimitOrder(
          { symbol: 'BTC', price, amount, side: OrderSide.Bid, clientOrderId },
          account,
        )
          .then((created) => {
            expect(typeof created.orderId).toBe('number');
            return poll(
              () => getOpenOrders({ user: account }, account),
              (orders) => hasClientOrderId(orders, clientOrderId),
            );
          })
          .then(() => cancelOrder({ symbol: 'BTC', clientOrderId }, account))
          .then(() =>
            poll(
              () => getOpenOrders({ user: account }, account),
              (orders) => hasClientOrderId(orders, clientOrderId) === false,
            ),
          )
          .then((orders) => {
            expect(hasClientOrderId(orders, clientOrderId)).toBe(false);
          }),
      );
    },
    NETWORK_TIMEOUT,
  );
});

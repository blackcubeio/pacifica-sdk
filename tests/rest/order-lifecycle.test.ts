import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { OrderSide } from '../../src/common/types';
import { cancelOrder } from '../../src/rest/orders/cancel-order';
import { createLimitOrder } from '../../src/rest/orders/create-limit-order';
import { getOpenOrders } from '../../src/rest/orders/get-open-orders';
import { buildFarBtcLimit, hasClientOrderId, poll, readEnv } from '../helpers';

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 40_000;

describe('order lifecycle REST (testnet, do → visible → undo → gone)', () => {
  beforeAll(() => {
    init({ network: 'testnet', signer: { secretKey, account } });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'places a limit order, sees it in open orders, cancels it, then it is gone',
    () => {
      const clientOrderId = globalThis.crypto.randomUUID();
      return buildFarBtcLimit().then(({ price, amount }) =>
        createLimitOrder({ symbol: 'BTC', price, amount, side: OrderSide.Bid, clientOrderId })
          .then((created) => {
            expect(typeof created.orderId).toBe('number');
            return poll(
              () => getOpenOrders({ account }),
              (orders) => hasClientOrderId(orders, clientOrderId),
            );
          })
          .then(() => cancelOrder({ symbol: 'BTC', clientOrderId }))
          .then(() =>
            poll(
              () => getOpenOrders({ account }),
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

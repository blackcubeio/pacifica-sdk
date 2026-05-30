import { beforeAll, describe, expect, it } from 'vitest';
import { type PacificaClient, init } from '../../src/common/config';
import { OrderSide } from '../../src/common/types';
import { cancelOrder } from '../../src/rest/cancel-order';
import { getOpenOrders } from '../../src/rest/get-open-orders';
import { createLimitOrder } from '../../src/rest/orders/create-limit-order';
import { buildFarBtcLimit, hasClientOrderId, poll, readEnv } from '../helpers';

let client: PacificaClient;

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 40_000;

describe('order lifecycle REST (testnet, do → visible → undo → gone)', () => {
  beforeAll(() => {
    client = init({
      signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } },
    });
  });

  it(
    'places a limit order, sees it in open orders, cancels it, then it is gone',
    () => {
      const clientOrderId = globalThis.crypto.randomUUID();
      return buildFarBtcLimit(client).then(({ price, amount }) =>
        createLimitOrder(
          client,
          { symbol: 'BTC', price, amount, side: OrderSide.Bid, clientOrderId },
          account,
        )
          .then((created) => {
            expect(typeof created.orderId).toBe('number');
            return poll(
              () => getOpenOrders(client, { user: account }, account),
              (orders) => hasClientOrderId(orders, clientOrderId),
            );
          })
          .then(() => cancelOrder(client, { name: 'BTC', clientId: clientOrderId }, account))
          .then(() =>
            poll(
              () => getOpenOrders(client, { user: account }, account),
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

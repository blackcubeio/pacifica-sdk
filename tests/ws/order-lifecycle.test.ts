import { beforeAll, describe, expect, it } from 'vitest';
import { type PacificaClient, init } from '../../src/common/config';
import { OrderSide } from '../../src/common/types';
import { getOpenOrders } from '../../src/rest/get-open-orders';
import { WsClient } from '../../src/ws/client';
import { buildFarBtcLimit, hasClientOrderId, poll, readEnv } from '../helpers';

let ctx: PacificaClient;

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 40_000;

describe('order lifecycle WS (testnet, WS write visible via REST then undone via WS)', () => {
  beforeAll(() => {
    ctx = init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });

  it(
    'creates an order over WS, sees it via REST, cancels it over WS, then it is gone',
    () => {
      const clientOrderId = globalThis.crypto.randomUUID();
      const ws = new WsClient(ctx, { label: account });
      return ws
        .connect()
        .then(() => buildFarBtcLimit(ctx))
        .then(({ price, amount }) =>
          ws.createLimitOrder({
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
            () => getOpenOrders(ctx, { user: account }, account),
            (orders) => hasClientOrderId(orders, clientOrderId),
          );
        })
        .then(() => ws.cancelOrder({ symbol: 'BTC', clientOrderId }))
        .then(() =>
          poll(
            () => getOpenOrders(ctx, { user: account }, account),
            (orders) => hasClientOrderId(orders, clientOrderId) === false,
          ),
        )
        .then((orders) => {
          expect(hasClientOrderId(orders, clientOrderId)).toBe(false);
          ws.disconnect();
        });
    },
    NETWORK_TIMEOUT,
  );
});

import { afterEach, describe, expect, it } from 'vitest';
import { type PacificaClient, init } from '../../src/common/config';
import { OrderSide } from '../../src/common/types';
import { bindAgentWallet } from '../../src/rest/agent/bind-agent-wallet';
import { listAgentWallets } from '../../src/rest/agent/list-agent-wallets';
import { cancelOrder } from '../../src/rest/cancel-order';
import { PacificaApiError } from '../../src/rest/client';
import { getOpenOrders } from '../../src/rest/get-open-orders';
import { createLimitOrder } from '../../src/rest/orders/create-limit-order';
import { buildFarBtcLimit, hasClientOrderId, poll, readEnv } from '../helpers';

let client: PacificaClient;

const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const accountSecretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const apiSecretKey = readEnv('PACIFICA_API1_PRIVATE_KEY');
const apiPublicKey = readEnv('PACIFICA_API1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 40_000;

describe('API agent key (testnet, réel)', () => {
  afterEach(() => {});

  it(
    'binds the API key to the account (owner-signed) and lists it',
    () => {
      client = init({
        signers: {
          [account]: { secretKey: accountSecretKey, publicKey: account, network: 'testnet' },
        },
      });
      return bindAgentWallet(client, { agentWallet: apiPublicKey }, account)
        .catch((error: unknown) => {
          // Already bound from a previous run → fine (max 20 keys/account).
          if (error instanceof PacificaApiError) {
            return;
          }
          throw error;
        })
        .then(() =>
          poll(
            () => listAgentWallets(client, account),
            (wallets) => wallets.includes(apiPublicKey),
          ),
        )
        .then((wallets) => {
          expect(wallets).toContain(apiPublicKey);
        });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'trades for the account signing with the API key (account + agentWallet)',
    () => {
      client = init({
        signers: {
          [account]: {
            secretKey: apiSecretKey,
            publicKey: account,
            agentWallet: apiPublicKey,
            network: 'testnet',
          },
        },
      });
      const clientOrderId = globalThis.crypto.randomUUID();
      return buildFarBtcLimit(client).then(({ price, amount }) =>
        createLimitOrder(
          client,
          { symbol: 'BTC', price, amount, side: OrderSide.Bid, clientOrderId },
          account,
        )
          .then(() =>
            poll(
              () => getOpenOrders(client, { user: account }, account),
              (orders) => hasClientOrderId(orders, clientOrderId),
            ),
          )
          .then((orders) => {
            // Order signed by the API key is credited to the account it acts for.
            expect(hasClientOrderId(orders, clientOrderId)).toBe(true);
            return cancelOrder(client, { name: 'BTC', clientId: clientOrderId }, account);
          })
          .then(() =>
            poll(
              () => getOpenOrders(client, { user: account }, account),
              (orders) => hasClientOrderId(orders, clientOrderId) === false,
            ),
          ),
      );
    },
    NETWORK_TIMEOUT,
  );
});

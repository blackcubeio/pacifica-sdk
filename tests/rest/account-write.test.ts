import { ed25519 } from '@noble/curves/ed25519';
import bs58 from 'bs58';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { publicKeyFromBase58 } from '../../src/common/utils';
import { createApiConfigKey } from '../../src/rest/account/create-api-config-key';
import { getAccountSettings } from '../../src/rest/account/get-account-settings';
import { listApiConfigKeys } from '../../src/rest/account/list-api-config-keys';
import { revokeApiConfigKey } from '../../src/rest/account/revoke-api-config-key';
import { bindAgentWallet } from '../../src/rest/agent/bind-agent-wallet';
import { listAgentWallets } from '../../src/rest/agent/list-agent-wallets';
import { revokeAgentWallet } from '../../src/rest/agent/revoke-agent-wallet';
import { updateLeverage } from '../../src/rest/update-leverage';
import { poll, readEnv } from '../helpers';

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 40_000;

function btcLeverage(): Promise<number | null> {
  return getAccountSettings({ account }, account).then((settings) => {
    const margin = settings.marginSettings.find((entry) => entry.symbol === 'BTC');
    return margin === undefined ? null : margin.leverage;
  });
}

describe('account write read-back (testnet, do → état visible → undo)', () => {
  beforeAll(() => {
    init({ signers: { [account]: { secretKey, publicKey: account, network: 'testnet' } } });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'updateLeverage is reflected in account settings',
    () => {
      return updateLeverage({ name: 'BTC', leverage: 5 }, account)
        .then(() => poll(btcLeverage, (value) => value === 5))
        .then((value) => {
          expect(value).toBe(5);
          return updateLeverage({ name: 'BTC', leverage: 10 }, account);
        })
        .then(() => poll(btcLeverage, (value) => value === 10))
        .then((value) => {
          expect(value).toBe(10);
        });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'API config key appears after create and disappears after revoke',
    () => {
      return createApiConfigKey(account).then((created) => {
        expect(typeof created.apiKey).toBe('string');
        return poll(
          () => listApiConfigKeys(account),
          (keys) => JSON.stringify(keys).includes(created.apiKey),
        )
          .then(() => revokeApiConfigKey({ apiKey: created.apiKey }, account))
          .then(() =>
            poll(
              () => listApiConfigKeys(account),
              (keys) => JSON.stringify(keys).includes(created.apiKey) === false,
            ),
          );
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'agent wallet appears after bind and disappears after revoke',
    () => {
      const agentWallet = publicKeyFromBase58(bs58.encode(ed25519.utils.randomPrivateKey()));
      return bindAgentWallet({ agentWallet }, account)
        .then(() =>
          poll(
            () => listAgentWallets(account),
            (wallets) => JSON.stringify(wallets).includes(agentWallet),
          ),
        )
        .then(() => revokeAgentWallet({ agentWallet }, account))
        .then(() =>
          poll(
            () => listAgentWallets(account),
            (wallets) => JSON.stringify(wallets).includes(agentWallet) === false,
          ),
        );
    },
    NETWORK_TIMEOUT,
  );
});

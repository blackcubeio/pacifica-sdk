import { readFileSync } from 'node:fs';
import { ed25519 } from '@noble/curves/ed25519';
import bs58 from 'bs58';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { publicKeyFromBase58 } from '../../src/common/utils';
import { createApiConfigKey } from '../../src/rest/account/create-api-config-key';
import { listApiConfigKeys } from '../../src/rest/account/list-api-config-keys';
import { revokeApiConfigKey } from '../../src/rest/account/revoke-api-config-key';
import { updateLeverage } from '../../src/rest/account/update-leverage';
import { bindAgentWallet } from '../../src/rest/agent/bind-agent-wallet';
import { listAgentWallets } from '../../src/rest/agent/list-agent-wallets';
import { revokeAgentWallet } from '../../src/rest/agent/revoke-agent-wallet';
import { getMarketInfo } from '../../src/rest/markets/get-market-info';

function readEnv(name: string): string {
  const content = readFileSync(new URL('../../.env', import.meta.url), 'utf-8');
  const line = content.split('\n').find((entry) => entry.startsWith(`${name}=`));
  if (line === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  return line.slice(name.length + 1).trim();
}

function freshSecretKey(): string {
  return bs58.encode(ed25519.utils.randomPrivateKey());
}

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 30_000;

describe('account write (testnet, écritures réelles)', () => {
  beforeAll(() => {
    init({ network: 'testnet', signer: { secretKey, account } });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'updates leverage on BTC',
    () => {
      return getMarketInfo().then((markets) => {
        const market = markets.find((entry) => entry.symbol === 'BTC');
        if (market === undefined) {
          throw new Error('BTC market not found');
        }
        const leverage = Math.min(10, market.maxLeverage);
        return updateLeverage({ symbol: 'BTC', leverage }).then((result) => {
          expect(result).toBeUndefined();
        });
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'creates, lists then revokes an API config key',
    () => {
      return createApiConfigKey().then((created) => {
        expect(typeof created.apiKey).toBe('string');
        return listApiConfigKeys().then(() => {
          return revokeApiConfigKey({ apiKey: created.apiKey });
        });
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'binds, lists then revokes an agent wallet',
    () => {
      const agentWallet = publicKeyFromBase58(freshSecretKey());
      return bindAgentWallet({ agentWallet }).then(() => {
        return listAgentWallets().then(() => {
          return revokeAgentWallet({ agentWallet });
        });
      });
    },
    NETWORK_TIMEOUT,
  );
});

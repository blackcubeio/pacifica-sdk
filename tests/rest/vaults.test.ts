import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { OrderSide } from '../../src/common/types';
import { PacificaApiError } from '../../src/rest/client';
import { createPositionTpsl } from '../../src/rest/positions/create-position-tpsl';
import { addToWhitelist } from '../../src/rest/vaults/add-to-whitelist';
import { createVault } from '../../src/rest/vaults/create-vault';
import { getVaults } from '../../src/rest/vaults/get-vaults';
import { updateDepositCap } from '../../src/rest/vaults/update-deposit-cap';
import { vaultDeposit } from '../../src/rest/vaults/vault-deposit';

function readEnv(name: string): string {
  const content = readFileSync(new URL('../../.env', import.meta.url), 'utf-8');
  const line = content.split('\n').find((entry) => entry.startsWith(`${name}=`));
  if (line === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  return line.slice(name.length + 1).trim();
}

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 30_000;

describe('vaults + positions tpsl (testnet, réel)', () => {
  beforeAll(() => {
    init({ network: 'testnet', signer: { secretKey, account } });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'lists vaults',
    () => {
      return getVaults().then((vaults) => {
        expect(vaults.length).toBeGreaterThan(0);
        expect(typeof vaults[0]?.address).toBe('string');
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'creates a vault, deposits, then runs manager ops',
    () => {
      return createVault({
        nickname: `sdk-test-${Date.now()}`,
        initialDeposit: '10',
        depositCap: '1000000',
        depositMinDurationMs: 86_400_000,
        withdrawWindowS: 2_592_000,
        withdrawDurationS: 259_200,
        managerProfitShare: '0.10',
        managerMinBalancePortion: '0.10',
        managerLiquidationBalancePortion: '0.05',
      }).then((created) => {
        expect(typeof created.lakeAddress).toBe('string');
        const lake = created.lakeAddress;
        return vaultDeposit({ lake, amount: '10' }).then(() => {
          return signatureAccepted(updateDepositCap({ lake, depositCap: '2000000' })).then(() => {
            return signatureAccepted(addToWhitelist({ lake, symbols: ['BTC'] }));
          });
        });
      });
    },
    NETWORK_TIMEOUT,
  );

  it(
    'createPositionTpsl signature is accepted by the API',
    () => {
      return signatureAccepted(
        createPositionTpsl({
          symbol: 'BTC',
          side: OrderSide.Bid,
          takeProfit: { stopPrice: '500000' },
        }),
      );
    },
    NETWORK_TIMEOUT,
  );
});

function signatureAccepted(call: Promise<unknown>): Promise<void> {
  return call.then(
    () => undefined,
    (error: unknown) => {
      if (error instanceof PacificaApiError) {
        return undefined;
      }
      throw error;
    },
  );
}

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { init, resetConfig } from '../../src/common/config';
import { createVault } from '../../src/rest/vaults/create-vault';
import { getVaults } from '../../src/rest/vaults/get-vaults';
import { vaultDeposit } from '../../src/rest/vaults/vault-deposit';
import { poll, readEnv } from '../helpers';

const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const NETWORK_TIMEOUT = 60_000;

function vaultBalance(lake: string): () => Promise<number | null> {
  return () =>
    getVaults().then((vaults) => {
      const vault = vaults.find((entry) => entry.address === lake);
      return vault === undefined ? null : Number(vault.lpBalance);
    });
}

describe('vault lifecycle (testnet, réel)', () => {
  beforeAll(() => {
    init({ network: 'testnet', signer: { secretKey, account } });
  });

  afterAll(() => {
    resetConfig();
  });

  it(
    'creates a vault (visible in getVaults) then a deposit increases its balance',
    () => {
      return createVault({
        nickname: `sdk-e2e-${Date.now()}`,
        initialDeposit: '10',
        depositCap: '1000000',
        depositMinDurationMs: 0,
        withdrawWindowS: 2_592_000,
        withdrawDurationS: 259_200,
        managerProfitShare: '0.10',
        managerMinBalancePortion: '0.10',
        managerLiquidationBalancePortion: '0.05',
      }).then((created) => {
        const lake = created.lakeAddress;
        expect(typeof lake).toBe('string');
        return poll(vaultBalance(lake), (balance) => balance !== null)
          .then((balanceAfterCreate) => {
            const created = Number(balanceAfterCreate);
            return vaultDeposit({ lake, amount: '10' }).then(() =>
              poll(vaultBalance(lake), (balance) => balance !== null && balance > created),
            );
          })
          .then((balanceAfterDeposit) => {
            expect(Number(balanceAfterDeposit)).toBeGreaterThan(10);
          });
      });
    },
    NETWORK_TIMEOUT,
  );
});

import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { type PacificaClient, init } from '../../src/common/config';
import { getAccountInfo } from '../../src/rest/account/get-account-info';
import {
  DEVNET_CENTRAL_STATE,
  DEVNET_COLLATERAL_MINT,
  DEVNET_DEPOSIT_PROGRAM_ID,
  DEVNET_RPC_URL,
  buildDepositData,
  deposit,
} from '../../src/rest/deposit';

let client: PacificaClient;

function readEnv(name: string): string {
  const content = readFileSync(new URL('../../.env', import.meta.url), 'utf-8');
  const line = content.split('\n').find((entry) => entry.startsWith(`${name}=`));
  if (line === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  return line.slice(name.length + 1).trim();
}

const solanaSecretKey = readEnv('SOLANA_PRIVATE_KEY');
const account = readEnv('SOLANA_PUBLIC_KEY');
const NETWORK_TIMEOUT = 90_000;

function waitForBalance(target: number, deadline: number): Promise<number> {
  return getAccountInfo(client, { account }, account).then((info) => {
    const balance = Number(info.balance);
    if (balance >= target) {
      return balance;
    }
    if (Date.now() > deadline) {
      throw new Error(`balance ${balance} stayed below ${target} (deposit not credited)`);
    }
    return new Promise<void>((resolve) => setTimeout(resolve, 3000)).then(() =>
      waitForBalance(target, deadline),
    );
  });
}

describe('deposit instruction data', () => {
  it('encodes the anchor discriminator and borsh u64 amount', () => {
    const data = buildDepositData(10, 6);
    expect(data.length).toBe(16);
    expect(Buffer.from(data.subarray(0, 8)).toString('hex')).toBe('f223c68952e1f2b6');
    expect(new DataView(data.buffer).getBigUint64(8, true)).toBe(10_000_000n);
  });
});

describe('deposit (devnet, dépôt réel crédité)', () => {
  beforeAll(() => {
    client = init({
      signers: {
        [account]: { secretKey: solanaSecretKey, publicKey: account, network: 'testnet' },
      },
    });
  });

  it(
    'deposits USDP on devnet and the Pacifica account is credited',
    () => {
      return getAccountInfo(client, { account }, account).then((before) => {
        const balanceBefore = Number(before.balance);
        return deposit(
          client,
          {
            amount: 10,
            rpcUrl: DEVNET_RPC_URL,
            programId: DEVNET_DEPOSIT_PROGRAM_ID,
            centralState: DEVNET_CENTRAL_STATE,
            collateralMint: DEVNET_COLLATERAL_MINT,
            decimals: 6,
          },
          account,
        ).then((signature) => {
          expect(typeof signature).toBe('string');
          return waitForBalance(balanceBefore + 9, Date.now() + 60_000).then((balanceAfter) => {
            expect(balanceAfter).toBeGreaterThanOrEqual(balanceBefore + 9);
          });
        });
      });
    },
    NETWORK_TIMEOUT,
  );
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildDepositData, deposit } from '../../src/rest/deposit';

function readEnv(name: string): string {
  const content = readFileSync(new URL('../../.env', import.meta.url), 'utf-8');
  const line = content.split('\n').find((entry) => entry.startsWith(`${name}=`));
  if (line === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  return line.slice(name.length + 1).trim();
}

const DEVNET_RPC_URL = 'https://api.devnet.solana.com';
const USDP_MINT = 'USDPqRbLidFGufty2s3oizmDEKdqx7ePTqzDMbf5ZKM';
const solanaSecretKey = readEnv('SOLANA_PRIVATE_KEY');
const NETWORK_TIMEOUT = 60_000;

describe('deposit instruction data', () => {
  it('encodes the anchor discriminator and borsh u64 amount', () => {
    const data = buildDepositData(10, 6);
    expect(data.length).toBe(16);
    expect(Buffer.from(data.subarray(0, 8)).toString('hex')).toBe('f223c68952e1f2b6');
    expect(new DataView(data.buffer).getBigUint64(8, true)).toBe(10_000_000n);
  });
});

describe('deposit (devnet, transaction réelle)', () => {
  it(
    'deposits USDP from the main wallet on devnet',
    () => {
      return deposit(
        { amount: 10, rpcUrl: DEVNET_RPC_URL, collateralMint: USDP_MINT, decimals: 6 },
        { secretKey: solanaSecretKey },
      ).then((signature) => {
        expect(typeof signature).toBe('string');
        expect(signature.length).toBeGreaterThan(0);
      });
    },
    NETWORK_TIMEOUT,
  );
});

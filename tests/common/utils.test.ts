import { readFileSync } from 'node:fs';
import { ed25519 } from '@noble/curves/ed25519';
import bs58 from 'bs58';
import { describe, expect, it } from 'vitest';
import { OperationType } from '../../src/common/types';
import {
  prepareMessage,
  publicKeyFromBase58,
  signMessage,
  sortJsonKeys,
} from '../../src/common/utils';

function readEnv(name: string): string {
  const content = readFileSync(new URL('../../.env', import.meta.url), 'utf-8');
  const line = content.split('\n').find((entry) => entry.startsWith(`${name}=`));
  if (line === undefined) {
    throw new Error(`Missing env var ${name}`);
  }
  return line.slice(name.length + 1).trim();
}

const subAccountPrivateKey = readEnv('PACIFICA_SUB_ACCOUNT_PRIVATE_KEY');
const subAccountPublicKey = readEnv('PACIFICA_SUB_ACCOUNT_PUBLIC_KEY');

describe('sortJsonKeys', () => {
  it('sorts nested object keys recursively', () => {
    const sorted = sortJsonKeys({ b: 1, a: { d: 2, c: 3 } });
    expect(JSON.stringify(sorted)).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it('preserves array order while sorting item keys', () => {
    const sorted = sortJsonKeys([{ y: 1, x: 2 }]);
    expect(JSON.stringify(sorted)).toBe('[{"x":2,"y":1}]');
  });
});

describe('prepareMessage', () => {
  it('builds a sorted compact snake_case message', () => {
    const message = prepareMessage(
      { type: OperationType.CreateOrder, timestamp: 1_700_000_000_000, expiryWindow: 30_000 },
      { symbol: 'BTC', side: 'bid' },
    );
    expect(message).toBe(
      '{"data":{"side":"bid","symbol":"BTC"},"expiry_window":30000,"timestamp":1700000000000,"type":"create_order"}',
    );
  });
});

describe('publicKeyFromBase58', () => {
  it('derives the sub-account public key from its private key', () => {
    expect(publicKeyFromBase58(subAccountPrivateKey)).toBe(subAccountPublicKey);
  });
});

describe('signMessage', () => {
  it('produces a signature verifiable against the derived public key', () => {
    const header = {
      type: OperationType.CreateMarketOrder,
      timestamp: Date.now(),
      expiryWindow: 30_000,
    };
    const payload = { symbol: 'BTC', side: 'bid', amount: '0.001', reduce_only: false };

    const signed = signMessage(header, payload, subAccountPrivateKey);
    const messageBytes = new TextEncoder().encode(signed.message);
    const verified = ed25519.verify(
      bs58.decode(signed.signature),
      messageBytes,
      bs58.decode(subAccountPublicKey),
    );

    expect(verified).toBe(true);
  });
});

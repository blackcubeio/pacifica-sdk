import { spawnSync } from 'node:child_process';
import { ed25519 } from '@noble/curves/ed25519';
import bs58 from 'bs58';
import type {
  HardwareSignature,
  JsonObject,
  JsonValue,
  SignatureHeader,
  SignedMessage,
} from './types';

export function sortJsonKeys(value: JsonValue): JsonValue {
  if (Array.isArray(value) === true) {
    return value.map((item) => sortJsonKeys(item));
  }
  if (typeof value === 'object' && value !== null) {
    const sortedKeys = Object.keys(value).sort();
    const sorted: JsonObject = {};
    for (const key of sortedKeys) {
      const entryValue = value[key];
      if (entryValue !== undefined) {
        sorted[key] = sortJsonKeys(entryValue);
      }
    }
    return sorted;
  }
  return value;
}

export function prepareMessage(header: SignatureHeader, payload: JsonObject): string {
  const dataToSign: JsonObject = {
    type: header.type,
    timestamp: header.timestamp,
    expiry_window: header.expiryWindow,
    data: payload,
  };
  return JSON.stringify(sortJsonKeys(dataToSign));
}

export function secretKeyFromBase58(secretKey: string): Uint8Array {
  const decoded = bs58.decode(secretKey);
  return decoded.slice(0, 32);
}

export function publicKeyFromBase58(secretKey: string): string {
  const seed = secretKeyFromBase58(secretKey);
  const publicKeyBytes = ed25519.getPublicKey(seed);
  return bs58.encode(publicKeyBytes);
}

export function signMessage(
  header: SignatureHeader,
  payload: JsonObject,
  secretKey: string,
): SignedMessage<string> {
  const message = prepareMessage(header, payload);
  const messageBytes = new TextEncoder().encode(message);
  const seed = secretKeyFromBase58(secretKey);
  const signatureBytes = ed25519.sign(messageBytes, seed);
  return { message, signature: bs58.encode(signatureBytes) };
}

export function signWithHardwareWallet(
  header: SignatureHeader,
  payload: JsonObject,
  hardwareWalletPath: string,
): SignedMessage<HardwareSignature> {
  const message = prepareMessage(header, payload);
  const signing = spawnSync(
    'solana',
    ['sign-offchain-message', '-k', hardwareWalletPath, message],
    { encoding: 'utf-8' },
  );
  if (signing.status !== 0) {
    throw new Error(`Ledger signing failed: ${signing.stderr ?? ''}`);
  }
  const outputLines = signing.stdout.trim().split('\n');
  const signatureValue = outputLines[outputLines.length - 1];
  if (signatureValue === undefined || signatureValue === '') {
    throw new Error('Ledger signing returned no signature');
  }
  return { message, signature: { type: 'hardware', value: signatureValue } };
}

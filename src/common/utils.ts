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

/**
 * Type de clé : `0x…` → EVM. Pacifica est **Solana-only** ; cette fonction fait partie du
 * contrat commun (`KeyHelper`) et renvoie toujours `solana` pour une clé Pacifica (base58).
 */
export function keyTypeOf(privateKey: string): 'evm' | 'solana' {
  return privateKey.startsWith('0x') ? 'evm' : 'solana';
}

/** Adresse Solana (clé publique base58) dérivée d'une clé secrète base58. */
export function solanaAddress(secretKey: string): string {
  return publicKeyFromBase58(secretKey);
}

/** Signe un message brut en **ed25519** (signature base58) avec une clé secrète base58. */
export function signEd25519(message: string, secretKey: string): string {
  const seed = secretKeyFromBase58(secretKey);
  return bs58.encode(ed25519.sign(new TextEncoder().encode(message), seed));
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

/** Convertit un datetime unifié `YYYY-MM-DD HH:MM:SS` (UTC, C7) en millisecondes epoch. */
export function dateToMs(date: string): number {
  return new Date(`${date.replace(' ', 'T')}Z`).getTime();
}

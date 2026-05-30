import { getConfig } from '../common/config';
import { DEFAULT_EXPIRY_WINDOW } from '../common/constants';
import type { ResolvedSigner } from '../common/types';
import type { JsonObject, Network, OperationType, Signer } from '../common/types';
import { publicKeyFromBase58, signMessage } from '../common/utils';

/**
 * Résout le signer d'une **écriture** par son label. Le signer est **obligatoire** : on lève
 * si le label est absent ou inconnu. `account` est la clé publique (le compte), `network` est
 * porté par le signer.
 */
export function resolveSigner(label?: string): ResolvedSigner {
  if (label === undefined) {
    throw new Error('Un signer (label) est obligatoire pour cette action signée');
  }
  const signer = getConfig().signers[label];
  if (signer === undefined) {
    throw new Error(`Aucun signer enregistré sous "${label}"; ajoute-le dans init({ signers })`);
  }
  return {
    label,
    account: signer.publicKey,
    secretKey: signer.secretKey,
    network: signer.network,
    agentWallet: signer.agentWallet,
  };
}

/** Account address for a raw keypair signer (used by the dual-signature subaccount flow). */
export function signerAccount(signer: Signer): string {
  return publicKeyFromBase58(signer.secretKey);
}

export function buildSignedRequest(
  type: OperationType,
  payload: JsonObject,
  label?: string,
  expiryWindow: number = DEFAULT_EXPIRY_WINDOW,
): JsonObject {
  const signer = resolveSigner(label);
  const timestamp = Date.now();
  const signed = signMessage({ type, timestamp, expiryWindow }, payload, signer.secretKey);
  const request: JsonObject = {
    account: signer.account,
    signature: signed.signature,
    timestamp,
    expiry_window: expiryWindow,
    ...payload,
  };
  if (signer.agentWallet !== undefined) {
    request.agent_wallet = signer.agentWallet;
  }
  return request;
}

export function newClientOrderId(): string {
  return globalThis.crypto.randomUUID();
}

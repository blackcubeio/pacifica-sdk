import { getConfig } from '../common/config';
import { DEFAULT_EXPIRY_WINDOW } from '../common/constants';
import type { JsonObject, OperationType, Signer } from '../common/types';
import { publicKeyFromBase58, signMessage } from '../common/utils';

export function resolveSigner(signerOverride?: Signer): Signer {
  const signer = signerOverride ?? getConfig().signer;
  if (signer === undefined) {
    throw new Error('No signer available; pass a signer or set one in init()');
  }
  return signer;
}

export function signerAccount(signer: Signer): string {
  return signer.account ?? publicKeyFromBase58(signer.secretKey);
}

export function buildSignedRequest(
  type: OperationType,
  payload: JsonObject,
  signerOverride?: Signer,
  expiryWindow: number = DEFAULT_EXPIRY_WINDOW,
): JsonObject {
  const signer = resolveSigner(signerOverride);
  const timestamp = Date.now();
  const signed = signMessage({ type, timestamp, expiryWindow }, payload, signer.secretKey);
  const request: JsonObject = {
    account: signerAccount(signer),
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

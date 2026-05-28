import { getConfig } from '../common/config';
import { DEFAULT_EXPIRY_WINDOW } from '../common/constants';
import type { JsonObject, OperationType, Signer } from '../common/types';
import { publicKeyFromBase58, signMessage } from '../common/utils';

export interface ResolvedSigner {
  account: string;
  secretKey: string;
  agentWallet?: string;
}

/**
 * Resolves a signed-call's signer from the account registry set in init().
 * - `account` given → the registered signer for that account.
 * - `account` omitted → the only registered signer, or throws if 0 or 2+.
 */
export function resolveSigner(account?: string): ResolvedSigner {
  const { signers } = getConfig();
  if (account !== undefined) {
    const signer = signers[account];
    if (signer === undefined) {
      throw new Error(`No signer registered for account ${account}; add it in init({ signers })`);
    }
    return { account, secretKey: signer.secretKey, agentWallet: signer.agentWallet };
  }
  const accounts = Object.keys(signers);
  if (accounts.length !== 1) {
    throw new Error('account is required: 0 or multiple signers are registered in init()');
  }
  const onlyAccount = accounts[0] as string;
  const signer = signers[onlyAccount] as Signer;
  return { account: onlyAccount, secretKey: signer.secretKey, agentWallet: signer.agentWallet };
}

/** Account address for a raw keypair signer (used by the dual-signature subaccount flow). */
export function signerAccount(signer: Signer): string {
  return publicKeyFromBase58(signer.secretKey);
}

export function buildSignedRequest(
  type: OperationType,
  payload: JsonObject,
  account?: string,
  expiryWindow: number = DEFAULT_EXPIRY_WINDOW,
): JsonObject {
  const signer = resolveSigner(account);
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

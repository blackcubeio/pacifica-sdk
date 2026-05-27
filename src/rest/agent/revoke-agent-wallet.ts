import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { RevokeAgentWalletParams } from '../types';

export function revokeAgentWallet(params: RevokeAgentWalletParams, signer?: Signer): Promise<void> {
  const payload = { agent_wallet: params.agentWallet };
  const request = buildSignedRequest(OperationType.RevokeAgentWallet, payload, signer);
  return httpPost<null>('/agent/revoke', request).then(() => undefined);
}

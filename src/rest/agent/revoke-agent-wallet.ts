import type { RevokeAgentWalletParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function revokeAgentWallet(params: RevokeAgentWalletParams, label: string): Promise<void> {
  const payload = { agent_wallet: params.agentWallet };
  const request = buildSignedRequest(OperationType.RevokeAgentWallet, payload, label);
  return httpPost<null>('/agent/revoke', request, label).then(() => undefined);
}

import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { RevokeAgentWalletParams } from '../types';

export function revokeAgentWallet(params: RevokeAgentWalletParams, label: string): Promise<void> {
  const payload = { agent_wallet: params.agentWallet };
  const request = buildSignedRequest(OperationType.RevokeAgentWallet, payload, label);
  return httpPost<null>('/agent/revoke', request, label).then(() => undefined);
}

import type { PacificaClient } from '../../common/config';
import type { RevokeAgentWalletParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function revokeAgentWallet(
  client: PacificaClient,
  params: RevokeAgentWalletParams,
  label: string,
): Promise<void> {
  const payload = { agent_wallet: params.agentWallet };
  const request = buildSignedRequest(client, OperationType.RevokeAgentWallet, payload, label);
  return httpPost<null>(client, '/agent/revoke', request, label).then(() => undefined);
}

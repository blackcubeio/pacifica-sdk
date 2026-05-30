import type { PacificaClient } from '../../common/config';
import type { AgentWhitelistedIpParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function removeAgentWhitelistedIp(
  client: PacificaClient,
  params: AgentWhitelistedIpParams,
  label: string,
): Promise<void> {
  const payload = { agent_wallet: params.agentWallet, ip_address: params.ipAddress };
  const request = buildSignedRequest(
    client,
    OperationType.RemoveAgentWhitelistedIp,
    payload,
    label,
  );
  return httpPost<null>(client, '/agent/ip_whitelist/remove', request, label).then(() => undefined);
}

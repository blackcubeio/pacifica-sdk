import type { AgentWhitelistedIpParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function removeAgentWhitelistedIp(
  params: AgentWhitelistedIpParams,
  label: string,
): Promise<void> {
  const payload = { agent_wallet: params.agentWallet, ip_address: params.ipAddress };
  const request = buildSignedRequest(OperationType.RemoveAgentWhitelistedIp, payload, label);
  return httpPost<null>('/agent/ip_whitelist/remove', request, label).then(() => undefined);
}

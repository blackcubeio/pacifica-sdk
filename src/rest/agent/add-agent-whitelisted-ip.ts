import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { AgentWhitelistedIpParams } from '../types';

export function addAgentWhitelistedIp(
  params: AgentWhitelistedIpParams,
  label: string,
): Promise<void> {
  const payload = { agent_wallet: params.agentWallet, ip_address: params.ipAddress };
  const request = buildSignedRequest(OperationType.AddAgentWhitelistedIp, payload, label);
  return httpPost<null>('/agent/ip_whitelist/add', request, label).then(() => undefined);
}

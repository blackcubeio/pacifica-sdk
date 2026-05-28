import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { AgentWhitelistedIpParams } from '../types';

export function addAgentWhitelistedIp(
  params: AgentWhitelistedIpParams,
  account?: string,
): Promise<void> {
  const payload = { agent_wallet: params.agentWallet, ip_address: params.ipAddress };
  const request = buildSignedRequest(OperationType.AddAgentWhitelistedIp, payload, account);
  return httpPost<null>('/agent/ip_whitelist/add', request).then(() => undefined);
}

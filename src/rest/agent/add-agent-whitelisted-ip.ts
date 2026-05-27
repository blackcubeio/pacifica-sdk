import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { AgentWhitelistedIpParams } from '../types';

export function addAgentWhitelistedIp(
  params: AgentWhitelistedIpParams,
  signer?: Signer,
): Promise<void> {
  const payload = { agent_wallet: params.agentWallet, ip_address: params.ipAddress };
  const request = buildSignedRequest(OperationType.AddAgentWhitelistedIp, payload, signer);
  return httpPost<null>('/agent/ip_whitelist/add', request).then(() => undefined);
}

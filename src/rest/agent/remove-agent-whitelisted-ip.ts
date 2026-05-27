import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { AgentWhitelistedIpParams } from '../types';

export function removeAgentWhitelistedIp(
  params: AgentWhitelistedIpParams,
  signer?: Signer,
): Promise<void> {
  const payload = { agent_wallet: params.agentWallet, ip_address: params.ipAddress };
  const request = buildSignedRequest(OperationType.RemoveAgentWhitelistedIp, payload, signer);
  return httpPost<null>('/agent/ip_whitelist/remove', request).then(() => undefined);
}

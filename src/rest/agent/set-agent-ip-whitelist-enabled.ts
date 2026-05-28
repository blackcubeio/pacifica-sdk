import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { SetAgentIpWhitelistEnabledParams } from '../types';

export function setAgentIpWhitelistEnabled(
  params: SetAgentIpWhitelistEnabledParams,
  account?: string,
): Promise<void> {
  const payload = { agent_wallet: params.agentWallet, enabled: params.enabled };
  const request = buildSignedRequest(OperationType.SetAgentIpWhitelistEnabled, payload, account);
  return httpPost<null>('/agent/ip_whitelist/toggle', request).then(() => undefined);
}

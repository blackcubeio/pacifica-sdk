import type { PacificaClient } from '../../common/config';
import type { SetAgentIpWhitelistEnabledParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function setAgentIpWhitelistEnabled(
  client: PacificaClient,
  params: SetAgentIpWhitelistEnabledParams,
  label: string,
): Promise<void> {
  const payload = { agent_wallet: params.agentWallet, enabled: params.enabled };
  const request = buildSignedRequest(
    client,
    OperationType.SetAgentIpWhitelistEnabled,
    payload,
    label,
  );
  return httpPost<null>(client, '/agent/ip_whitelist/toggle', request, label).then(() => undefined);
}

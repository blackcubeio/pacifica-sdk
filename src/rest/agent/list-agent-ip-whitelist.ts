import type { ListAgentIpWhitelistParams } from '../../common/native';
import { type JsonValue, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function listAgentIpWhitelist(
  params: ListAgentIpWhitelistParams,
  label: string,
): Promise<JsonValue> {
  const payload = { api_agent_key: params.agentWallet };
  const request = buildSignedRequest(OperationType.ListAgentIpWhitelist, payload, label);
  return httpPost<JsonValue>('/agent/ip_whitelist/list', request, label).then(
    (envelope) => envelope.data,
  );
}

import type { PacificaClient } from '../../common/config';
import type { ListAgentIpWhitelistParams } from '../../common/native';
import { type JsonValue, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function listAgentIpWhitelist(
  client: PacificaClient,
  params: ListAgentIpWhitelistParams,
  label: string,
): Promise<JsonValue> {
  const payload = { api_agent_key: params.agentWallet };
  const request = buildSignedRequest(client, OperationType.ListAgentIpWhitelist, payload, label);
  return httpPost<JsonValue>(client, '/agent/ip_whitelist/list', request, label).then(
    (envelope) => envelope.data,
  );
}

import { type JsonValue, OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { ListAgentIpWhitelistParams } from '../types';

export function listAgentIpWhitelist(
  params: ListAgentIpWhitelistParams,
  signer?: Signer,
): Promise<JsonValue> {
  const payload = { api_agent_key: params.agentWallet };
  const request = buildSignedRequest(OperationType.ListAgentIpWhitelist, payload, signer);
  return httpPost<JsonValue>('/agent/ip_whitelist/list', request).then((envelope) => envelope.data);
}

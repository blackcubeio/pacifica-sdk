import { type JsonValue, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function listAgentWallets(account?: string): Promise<JsonValue> {
  const request = buildSignedRequest(OperationType.ListAgentWallets, {}, account);
  return httpPost<JsonValue>('/agent/list', request).then((envelope) => envelope.data);
}

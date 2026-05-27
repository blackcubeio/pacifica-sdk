import { type JsonValue, OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function listAgentWallets(signer?: Signer): Promise<JsonValue> {
  const request = buildSignedRequest(OperationType.ListAgentWallets, {}, signer);
  return httpPost<JsonValue>('/agent/list', request).then((envelope) => envelope.data);
}

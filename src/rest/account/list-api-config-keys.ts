import { type JsonValue, OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function listApiConfigKeys(signer?: Signer): Promise<JsonValue> {
  const request = buildSignedRequest(OperationType.ListApiKeys, {}, signer);
  return httpPost<JsonValue>('/account/api_keys', request).then((envelope) => envelope.data);
}

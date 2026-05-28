import { type JsonValue, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function listApiConfigKeys(label: string): Promise<JsonValue> {
  const request = buildSignedRequest(OperationType.ListApiKeys, {}, label);
  return httpPost<JsonValue>('/account/api_keys', request, label).then((envelope) => envelope.data);
}

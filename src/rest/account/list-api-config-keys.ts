import { type JsonValue, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function listApiConfigKeys(account?: string): Promise<JsonValue> {
  const request = buildSignedRequest(OperationType.ListApiKeys, {}, account);
  return httpPost<JsonValue>('/account/api_keys', request).then((envelope) => envelope.data);
}

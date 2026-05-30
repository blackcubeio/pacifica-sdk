import type { PacificaClient } from '../../common/config';
import { type JsonValue, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function listApiConfigKeys(client: PacificaClient, label: string): Promise<JsonValue> {
  const request = buildSignedRequest(client, OperationType.ListApiKeys, {}, label);
  return httpPost<JsonValue>(client, '/account/api_keys', request, label).then(
    (envelope) => envelope.data,
  );
}

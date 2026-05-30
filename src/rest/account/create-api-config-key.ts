import type { PacificaClient } from '../../common/config';
import type { ApiConfigKeyResult } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function createApiConfigKey(
  client: PacificaClient,
  label: string,
): Promise<ApiConfigKeyResult> {
  const request = buildSignedRequest(client, OperationType.CreateApiKey, {}, label);
  return httpPost<{ api_key: string }>(client, '/account/api_keys/create', request, label).then(
    (envelope) => ({
      apiKey: envelope.data.api_key,
    }),
  );
}

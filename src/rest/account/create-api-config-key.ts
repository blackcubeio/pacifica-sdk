import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { ApiConfigKeyResult } from '../types';

export function createApiConfigKey(label: string): Promise<ApiConfigKeyResult> {
  const request = buildSignedRequest(OperationType.CreateApiKey, {}, label);
  return httpPost<{ api_key: string }>('/account/api_keys/create', request, label).then(
    (envelope) => ({
      apiKey: envelope.data.api_key,
    }),
  );
}

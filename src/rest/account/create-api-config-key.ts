import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { ApiConfigKeyResult } from '../types';

export function createApiConfigKey(signer?: Signer): Promise<ApiConfigKeyResult> {
  const request = buildSignedRequest(OperationType.CreateApiKey, {}, signer);
  return httpPost<{ api_key: string }>('/account/api_keys/create', request).then((envelope) => ({
    apiKey: envelope.data.api_key,
  }));
}

import type { RevokeApiConfigKeyParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function revokeApiConfigKey(params: RevokeApiConfigKeyParams, label: string): Promise<void> {
  const payload = { api_key: params.apiKey };
  const request = buildSignedRequest(OperationType.RevokeApiKey, payload, label);
  return httpPost<null>('/account/api_keys/revoke', request, label).then(() => undefined);
}

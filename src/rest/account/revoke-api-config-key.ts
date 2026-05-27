import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { RevokeApiConfigKeyParams } from '../types';

export function revokeApiConfigKey(
  params: RevokeApiConfigKeyParams,
  signer?: Signer,
): Promise<void> {
  const payload = { api_key: params.apiKey };
  const request = buildSignedRequest(OperationType.RevokeApiKey, payload, signer);
  return httpPost<null>('/account/api_keys/revoke', request).then(() => undefined);
}

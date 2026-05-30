import type { PacificaClient } from '../../common/config';
import type { RevokeApiConfigKeyParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function revokeApiConfigKey(
  client: PacificaClient,
  params: RevokeApiConfigKeyParams,
  label: string,
): Promise<void> {
  const payload = { api_key: params.apiKey };
  const request = buildSignedRequest(client, OperationType.RevokeApiKey, payload, label);
  return httpPost<null>(client, '/account/api_keys/revoke', request, label).then(() => undefined);
}

import type { PacificaClient } from '../../common/config';
import type { CreatePositionTpslParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildPositionTpslPayload } from '../orders/payloads';
import { buildSignedRequest } from '../signing';

export function createPositionTpsl(
  client: PacificaClient,
  params: CreatePositionTpslParams,
  label: string,
): Promise<void> {
  const payload = buildPositionTpslPayload(params);
  const request = buildSignedRequest(client, OperationType.SetPositionTpsl, payload, label);
  return httpPost<null>(client, '/positions/tpsl', request, label).then(() => undefined);
}

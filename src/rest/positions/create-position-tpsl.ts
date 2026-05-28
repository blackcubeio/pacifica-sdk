import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildPositionTpslPayload } from '../orders/payloads';
import { buildSignedRequest } from '../signing';
import type { CreatePositionTpslParams } from '../types';

export function createPositionTpsl(params: CreatePositionTpslParams, label: string): Promise<void> {
  const payload = buildPositionTpslPayload(params);
  const request = buildSignedRequest(OperationType.SetPositionTpsl, payload, label);
  return httpPost<null>('/positions/tpsl', request, label).then(() => undefined);
}

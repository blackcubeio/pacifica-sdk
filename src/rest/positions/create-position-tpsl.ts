import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildPositionTpslPayload } from '../orders/payloads';
import { buildSignedRequest } from '../signing';
import type { CreatePositionTpslParams } from '../types';

export function createPositionTpsl(
  params: CreatePositionTpslParams,
  signer?: Signer,
): Promise<void> {
  const payload = buildPositionTpslPayload(params);
  const request = buildSignedRequest(OperationType.SetPositionTpsl, payload, signer);
  return httpPost<null>('/positions/tpsl', request).then(() => undefined);
}

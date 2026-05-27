import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CancelStopOrderParams } from '../types';
import { buildCancelStopOrderPayload } from './payloads';

export function cancelStopOrder(params: CancelStopOrderParams, signer?: Signer): Promise<void> {
  const payload = buildCancelStopOrderPayload(params);
  const request = buildSignedRequest(OperationType.CancelStopOrder, payload, signer);
  return httpPost<null>('/orders/stop/cancel', request).then(() => undefined);
}

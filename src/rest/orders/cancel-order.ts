import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { CancelOrderParams } from '../types';
import { buildCancelOrderPayload } from './payloads';

export function cancelOrder(params: CancelOrderParams, signer?: Signer): Promise<void> {
  const payload = buildCancelOrderPayload(params);
  const request = buildSignedRequest(OperationType.CancelOrder, payload, signer);
  return httpPost<null>('/orders/cancel', request).then(() => undefined);
}

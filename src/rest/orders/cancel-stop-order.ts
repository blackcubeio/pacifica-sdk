import type { PacificaClient } from '../../common/config';
import type { CancelStopOrderParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import { buildCancelStopOrderPayload } from './payloads';

export function cancelStopOrder(
  client: PacificaClient,
  params: CancelStopOrderParams,
  label: string,
): Promise<void> {
  const payload = buildCancelStopOrderPayload(params);
  const request = buildSignedRequest(client, OperationType.CancelStopOrder, payload, label);
  return httpPost<null>(client, '/orders/stop/cancel', request, label).then(() => undefined);
}

import type { PacificaClient } from '../../common/config';
import type { ToggleAutoLendingParams } from '../../common/native';
import { type JsonObject, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function toggleAutoLending(
  client: PacificaClient,
  params: ToggleAutoLendingParams,
  label: string,
): Promise<void> {
  const payload: JsonObject = { disabled: params.disabled };
  const request = buildSignedRequest(client, OperationType.SetAutoLendDisabled, payload, label);
  return httpPost<null>(client, '/account/settings/auto_lend_disabled', request, label).then(
    () => undefined,
  );
}

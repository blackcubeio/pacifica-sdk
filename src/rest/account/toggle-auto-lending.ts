import type { ToggleAutoLendingParams } from '../../common/native';
import { type JsonObject, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function toggleAutoLending(params: ToggleAutoLendingParams, label: string): Promise<void> {
  const payload: JsonObject = { disabled: params.disabled };
  const request = buildSignedRequest(OperationType.SetAutoLendDisabled, payload, label);
  return httpPost<null>('/account/settings/auto_lend_disabled', request, label).then(
    () => undefined,
  );
}

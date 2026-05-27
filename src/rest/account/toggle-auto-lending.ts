import { type JsonObject, OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { ToggleAutoLendingParams } from '../types';

export function toggleAutoLending(params: ToggleAutoLendingParams, signer?: Signer): Promise<void> {
  const payload: JsonObject = { disabled: params.disabled };
  const request = buildSignedRequest(OperationType.SetAutoLendDisabled, payload, signer);
  return httpPost<null>('/account/settings/auto_lend_disabled', request).then(() => undefined);
}

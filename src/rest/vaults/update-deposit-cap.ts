import type { UpdateDepositCapParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function updateDepositCap(params: UpdateDepositCapParams, label: string): Promise<void> {
  const payload = { lake: params.lake, deposit_cap: params.depositCap };
  const request = buildSignedRequest(OperationType.UpdateLakeDepositCap, payload, label);
  return httpPost<null>('/lake/update_deposit_cap', request, label).then(() => undefined);
}

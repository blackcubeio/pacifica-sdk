import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { UpdateDepositCapParams } from '../types';

export function updateDepositCap(params: UpdateDepositCapParams, account?: string): Promise<void> {
  const payload = { lake: params.lake, deposit_cap: params.depositCap };
  const request = buildSignedRequest(OperationType.UpdateLakeDepositCap, payload, account);
  return httpPost<null>('/lake/update_deposit_cap', request).then(() => undefined);
}

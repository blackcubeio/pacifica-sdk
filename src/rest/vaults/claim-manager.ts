import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { ClaimManagerParams } from '../types';

export function claimManager(params: ClaimManagerParams, account?: string): Promise<void> {
  const payload = { lake: params.lake, deposit_amount: params.depositAmount };
  const request = buildSignedRequest(OperationType.ClaimLakeManager, payload, account);
  return httpPost<null>('/lake/claim_manager', request).then(() => undefined);
}

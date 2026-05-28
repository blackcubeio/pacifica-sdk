import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { ClaimReferralCodeParams } from '../types';

export function claimReferralCode(
  params: ClaimReferralCodeParams,
  account?: string,
): Promise<void> {
  const payload = { lake: params.lake, code: params.code };
  const request = buildSignedRequest(OperationType.ClaimLakeReferral, payload, account);
  return httpPost<null>('/lake/claim_referral_code', request).then(() => undefined);
}

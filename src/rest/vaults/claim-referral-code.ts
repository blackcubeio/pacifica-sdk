import type { ClaimReferralCodeParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function claimReferralCode(params: ClaimReferralCodeParams, label: string): Promise<void> {
  const payload = { lake: params.lake, code: params.code };
  const request = buildSignedRequest(OperationType.ClaimLakeReferral, payload, label);
  return httpPost<null>('/lake/claim_referral_code', request, label).then(() => undefined);
}

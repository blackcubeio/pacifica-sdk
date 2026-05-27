import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { ClaimReferralCodeParams } from '../types';

export function claimReferralCode(params: ClaimReferralCodeParams, signer?: Signer): Promise<void> {
  const payload = { lake: params.lake, code: params.code };
  const request = buildSignedRequest(OperationType.ClaimLakeReferral, payload, signer);
  return httpPost<null>('/lake/claim_referral_code', request).then(() => undefined);
}

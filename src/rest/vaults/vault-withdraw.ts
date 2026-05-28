import { type JsonObject, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { VaultWithdrawParams } from '../types';

export function vaultWithdraw(params: VaultWithdrawParams, account?: string): Promise<void> {
  const payload: JsonObject = { lake: params.lake, shares: params.shares };
  if (params.idempotencyKey !== undefined) {
    payload.idempotency_key = params.idempotencyKey;
  }
  const request = buildSignedRequest(OperationType.WithdrawFromLake, payload, account);
  return httpPost<null>('/lake/withdraw', request).then(() => undefined);
}

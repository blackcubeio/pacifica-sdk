import { type JsonObject, OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { VaultDepositParams } from '../types';

export function vaultDeposit(params: VaultDepositParams, signer?: Signer): Promise<void> {
  const payload: JsonObject = { lake: params.lake, amount: params.amount };
  if (params.idempotencyKey !== undefined) {
    payload.idempotency_key = params.idempotencyKey;
  }
  const request = buildSignedRequest(OperationType.DepositToLake, payload, signer);
  return httpPost<null>('/lake/deposit', request).then(() => undefined);
}

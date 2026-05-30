import type { PacificaClient } from '../../common/config';
import type { VaultWithdrawParams } from '../../common/native';
import { type JsonObject, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function vaultWithdraw(
  client: PacificaClient,
  params: VaultWithdrawParams,
  label: string,
): Promise<void> {
  const payload: JsonObject = { lake: params.lake, shares: params.shares };
  if (params.idempotencyKey !== undefined) {
    payload.idempotency_key = params.idempotencyKey;
  }
  const request = buildSignedRequest(client, OperationType.WithdrawFromLake, payload, label);
  return httpPost<null>(client, '/lake/withdraw', request, label).then(() => undefined);
}

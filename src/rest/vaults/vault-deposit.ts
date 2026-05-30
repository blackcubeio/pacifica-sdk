import type { PacificaClient } from '../../common/config';
import type { VaultDepositParams } from '../../common/native';
import { type JsonObject, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function vaultDeposit(
  client: PacificaClient,
  params: VaultDepositParams,
  label: string,
): Promise<void> {
  const payload: JsonObject = { lake: params.lake, amount: params.amount };
  if (params.idempotencyKey !== undefined) {
    payload.idempotency_key = params.idempotencyKey;
  }
  const request = buildSignedRequest(client, OperationType.DepositToLake, payload, label);
  return httpPost<null>(client, '/lake/deposit', request, label).then(() => undefined);
}

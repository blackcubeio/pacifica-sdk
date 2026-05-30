import type { PacificaClient } from '../../common/config';
import type { SubaccountSpotTransferParams } from '../../common/native';
import { type JsonObject, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function subaccountSpotTransfer(
  client: PacificaClient,
  params: SubaccountSpotTransferParams,
  label: string,
): Promise<void> {
  const payload: JsonObject = {
    to_account: params.toAccount,
    symbol: params.symbol,
    amount: params.amount,
  };
  if (params.idempotencyKey !== undefined) {
    payload.idempotency_key = params.idempotencyKey;
  }
  const request = buildSignedRequest(client, OperationType.SubaccountSpotTransfer, payload, label);
  return httpPost<null>(client, '/account/subaccount/spot_asset/transfer', request, label).then(
    () => undefined,
  );
}

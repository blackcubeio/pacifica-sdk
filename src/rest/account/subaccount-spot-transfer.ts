import { type JsonObject, OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { SubaccountSpotTransferParams } from '../types';

export function subaccountSpotTransfer(
  params: SubaccountSpotTransferParams,
  signer?: Signer,
): Promise<void> {
  const payload: JsonObject = {
    to_account: params.toAccount,
    symbol: params.symbol,
    amount: params.amount,
  };
  if (params.idempotencyKey !== undefined) {
    payload.idempotency_key = params.idempotencyKey;
  }
  const request = buildSignedRequest(OperationType.SubaccountSpotTransfer, payload, signer);
  return httpPost<null>('/account/subaccount/spot_asset/transfer', request).then(() => undefined);
}

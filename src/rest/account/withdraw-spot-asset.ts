import { type JsonObject, OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { WithdrawSpotAssetParams, WithdrawSpotResult } from '../types';

interface WithdrawSpotWire {
  symbol: string;
  batch_nonce: number;
  requested_amount: string;
  fee_amount: string;
}

export function withdrawSpotAsset(
  params: WithdrawSpotAssetParams,
  signer?: Signer,
): Promise<WithdrawSpotResult> {
  const payload: JsonObject = { symbol: params.symbol, amount: params.amount };
  if (params.idempotencyKey !== undefined) {
    payload.idempotency_key = params.idempotencyKey;
  }
  const request = buildSignedRequest(OperationType.WithdrawSpotAsset, payload, signer);
  return httpPost<WithdrawSpotWire>('/account/spot_asset/withdraw', request).then((envelope) => ({
    symbol: envelope.data.symbol,
    batchNonce: envelope.data.batch_nonce,
    requestedAmount: envelope.data.requested_amount,
    feeAmount: envelope.data.fee_amount,
  }));
}

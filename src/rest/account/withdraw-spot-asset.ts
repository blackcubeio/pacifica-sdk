import type { PacificaClient } from '../../common/config';
import type { WithdrawSpotAssetParams, WithdrawSpotResult } from '../../common/native';
import { type JsonObject, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

interface WithdrawSpotWire {
  symbol: string;
  batch_nonce: number;
  requested_amount: string;
  fee_amount: string;
}

export function withdrawSpotAsset(
  client: PacificaClient,
  params: WithdrawSpotAssetParams,
  label: string,
): Promise<WithdrawSpotResult> {
  const payload: JsonObject = { symbol: params.symbol, amount: params.amount };
  if (params.idempotencyKey !== undefined) {
    payload.idempotency_key = params.idempotencyKey;
  }
  const request = buildSignedRequest(client, OperationType.WithdrawSpotAsset, payload, label);
  return httpPost<WithdrawSpotWire>(client, '/account/spot_asset/withdraw', request, label).then(
    (envelope) => ({
      symbol: envelope.data.symbol,
      batchNonce: envelope.data.batch_nonce,
      requestedAmount: envelope.data.requested_amount,
      feeAmount: envelope.data.fee_amount,
    }),
  );
}

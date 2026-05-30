import type { PacificaClient } from '../../common/config';
import type { CreateVaultParams, CreateVaultResult } from '../../common/native';
import { type JsonObject, OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function createVault(
  client: PacificaClient,
  params: CreateVaultParams,
  label: string,
): Promise<CreateVaultResult> {
  const payload: JsonObject = {
    nickname: params.nickname,
    initial_deposit: params.initialDeposit,
    deposit_cap: params.depositCap,
    deposit_min_duration_ms: params.depositMinDurationMs,
    withdraw_window_s: params.withdrawWindowS,
    withdraw_duration_s: params.withdrawDurationS,
    manager_profit_share: params.managerProfitShare,
    manager_min_balance_portion: params.managerMinBalancePortion,
    manager_liquidation_balance_portion: params.managerLiquidationBalancePortion,
  };
  if (params.referralCode !== undefined) {
    payload.referral_code = params.referralCode;
  }
  const request = buildSignedRequest(client, OperationType.CreateLake, payload, label);
  return httpPost<{ lake_address: string }>(client, '/lake/create', request, label).then(
    (envelope) => ({
      lakeAddress: envelope.data.lake_address,
    }),
  );
}

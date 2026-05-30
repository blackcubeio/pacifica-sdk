import type { PacificaClient } from '../../common/config';
import type { WithdrawParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function withdraw(
  client: PacificaClient,
  params: WithdrawParams,
  label: string,
): Promise<void> {
  const payload = { amount: params.amount };
  const request = buildSignedRequest(client, OperationType.Withdraw, payload, label);
  return httpPost<null>(client, '/account/withdraw', request, label).then(() => undefined);
}

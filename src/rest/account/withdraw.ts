import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { WithdrawParams } from '../types';

export function withdraw(params: WithdrawParams, label: string): Promise<void> {
  const payload = { amount: params.amount };
  const request = buildSignedRequest(OperationType.Withdraw, payload, label);
  return httpPost<null>('/account/withdraw', request, label).then(() => undefined);
}

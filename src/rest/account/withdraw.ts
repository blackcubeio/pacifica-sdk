import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { WithdrawParams } from '../types';

export function withdraw(params: WithdrawParams, account?: string): Promise<void> {
  const payload = { amount: params.amount };
  const request = buildSignedRequest(OperationType.Withdraw, payload, account);
  return httpPost<null>('/account/withdraw', request).then(() => undefined);
}

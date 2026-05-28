import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { TransferSubaccountFundParams } from '../types';

export function transferSubaccountFund(
  params: TransferSubaccountFundParams,
  account?: string,
): Promise<void> {
  const payload = { to_account: params.toAccount, amount: params.amount };
  const request = buildSignedRequest(OperationType.TransferFunds, payload, account);
  return httpPost<null>('/account/subaccount/transfer', request).then(() => undefined);
}

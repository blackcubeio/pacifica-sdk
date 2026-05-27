import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { TransferSubaccountFundParams } from '../types';

export function transferSubaccountFund(
  params: TransferSubaccountFundParams,
  signer?: Signer,
): Promise<void> {
  const payload = { to_account: params.toAccount, amount: params.amount };
  const request = buildSignedRequest(OperationType.TransferFunds, payload, signer);
  return httpPost<null>('/account/subaccount/transfer', request).then(() => undefined);
}

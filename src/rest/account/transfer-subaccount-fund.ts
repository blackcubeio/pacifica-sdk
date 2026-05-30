import type { PacificaClient } from '../../common/config';
import type { TransferSubaccountFundParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function transferSubaccountFund(
  client: PacificaClient,
  params: TransferSubaccountFundParams,
  label: string,
): Promise<void> {
  const payload = { to_account: params.toAccount, amount: params.amount };
  const request = buildSignedRequest(client, OperationType.TransferFunds, payload, label);
  return httpPost<null>(client, '/account/subaccount/transfer', request, label).then(
    () => undefined,
  );
}

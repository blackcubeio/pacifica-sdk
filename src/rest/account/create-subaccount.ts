import { DEFAULT_EXPIRY_WINDOW } from '../../common/constants';
import { OperationType } from '../../common/types';
import { signMessage } from '../../common/utils';
import { httpPostTo } from '../client';
import { signerAccount } from '../signing';
import type { CreateSubaccountParams } from '../types';

export function createSubaccount(params: CreateSubaccountParams): Promise<void> {
  const timestamp = Date.now();
  const expiryWindow = DEFAULT_EXPIRY_WINDOW;
  const mainAccount = signerAccount(params.main);
  const subAccount = signerAccount(params.sub);

  const subSigned = signMessage(
    { type: OperationType.SubaccountInitiate, timestamp, expiryWindow },
    { account: mainAccount },
    params.sub.secretKey,
  );
  const mainSigned = signMessage(
    { type: OperationType.SubaccountConfirm, timestamp, expiryWindow },
    { signature: subSigned.signature },
    params.main.secretKey,
  );

  const request = {
    main_account: mainAccount,
    subaccount: subAccount,
    main_signature: mainSigned.signature,
    sub_signature: subSigned.signature,
    timestamp,
    expiry_window: expiryWindow,
  };
  return httpPostTo<null>('/account/subaccount/create', request, params.main.network).then(
    () => undefined,
  );
}

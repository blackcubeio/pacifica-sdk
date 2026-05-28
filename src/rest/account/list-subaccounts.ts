import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { Subaccount } from '../types';

interface SubaccountWire {
  address: string;
  balance: string;
  fee_level: number;
  fee_mode: string;
  created_at: number;
}

export function listSubaccounts(account?: string): Promise<Subaccount[]> {
  const request = buildSignedRequest(OperationType.ListSubaccounts, {}, account);
  return httpPost<{ subaccounts: SubaccountWire[] }>('/account/subaccount/list', request).then(
    (envelope) => envelope.data.subaccounts.map((subaccount) => mapSubaccount(subaccount)),
  );
}

function mapSubaccount(wire: SubaccountWire): Subaccount {
  return {
    address: wire.address,
    balance: wire.balance,
    feeLevel: wire.fee_level,
    feeMode: wire.fee_mode,
    createdAt: wire.created_at,
  };
}

import type { PacificaClient } from '../../common/config';
import type { Subaccount } from '../../common/native';
import type { SubAccount } from '../../common/types';
import { OperationType } from '../../common/types';
import { SubAccountConverter } from '../../converters/subaccount';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

interface SubaccountWire {
  address: string;
  balance: string;
  fee_level: number;
  fee_mode: string;
  created_at: number;
}

const converter = new SubAccountConverter();

/**
 * List the master account's sub-accounts, au **format unifié** {@link SubAccount}.
 * Seule l'`address` est dans le cœur ; balance/feeLevel/feeMode/createdAt → `xtras`.
 */
export function getSubAccounts(client: PacificaClient, label: string): Promise<SubAccount[]> {
  const request = buildSignedRequest(client, OperationType.ListSubaccounts, {}, label);
  return httpPost<{ subaccounts: SubaccountWire[] }>(
    client,
    '/account/subaccount/list',
    request,
    label,
  ).then((envelope) =>
    envelope.data.subaccounts.map((wire) => converter.toCommon(mapSubaccount(wire))),
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

import type { AccountQuery, PendingSpotWithdrawal } from '../../common/native';
import { httpGet } from '../client';

interface PendingSpotWithdrawalWire {
  symbol: string;
  amount: string;
  amount_requested: string;
  fee_amount: string;
  batch_nonce: number;
  created_at: number;
}

export function getPendingSpotWithdrawals(
  query: AccountQuery,
  label?: string,
): Promise<PendingSpotWithdrawal[]> {
  return httpGet<PendingSpotWithdrawalWire[]>(
    '/account/spot_asset/withdraw/pending',
    {
      account: query.account,
    },
    label,
  ).then((envelope) => envelope.data.map((entry) => mapPendingSpotWithdrawal(entry)));
}

function mapPendingSpotWithdrawal(wire: PendingSpotWithdrawalWire): PendingSpotWithdrawal {
  return {
    symbol: wire.symbol,
    amount: wire.amount,
    amountRequested: wire.amount_requested,
    feeAmount: wire.fee_amount,
    batchNonce: wire.batch_nonce,
    createdAt: wire.created_at,
  };
}

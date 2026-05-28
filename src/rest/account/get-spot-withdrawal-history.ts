import { httpGet } from '../client';
import type { Paginated, SpotHistoryQuery, SpotWithdrawalEntry } from '../types';

interface SpotWithdrawalWire {
  symbol: string;
  amount: string;
  batch_nonce: number;
  transaction_id: string;
  created_at: number;
}

export function getSpotWithdrawalHistory(
  query: SpotHistoryQuery,
  label?: string,
): Promise<Paginated<SpotWithdrawalEntry>> {
  return httpGet<SpotWithdrawalWire[]>(
    '/account/spot_asset/withdraw/history',
    {
      account: query.account,
      limit: query.limit,
      cursor: query.cursor,
    },
    label,
  ).then((envelope) => ({
    items: envelope.data.map((entry) => mapSpotWithdrawalEntry(entry)),
    nextCursor: envelope.next_cursor ?? null,
    hasMore: envelope.has_more ?? false,
  }));
}

function mapSpotWithdrawalEntry(wire: SpotWithdrawalWire): SpotWithdrawalEntry {
  return {
    symbol: wire.symbol,
    amount: wire.amount,
    batchNonce: wire.batch_nonce,
    transactionId: wire.transaction_id,
    createdAt: wire.created_at,
  };
}

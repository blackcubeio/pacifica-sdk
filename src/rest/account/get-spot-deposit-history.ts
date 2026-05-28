import { httpGet } from '../client';
import type { Paginated, SpotDepositEntry, SpotHistoryQuery } from '../types';

interface SpotDepositWire {
  symbol: string;
  amount: string;
  transaction_id: string;
  created_at: number;
}

export function getSpotDepositHistory(
  query: SpotHistoryQuery,
  label?: string,
): Promise<Paginated<SpotDepositEntry>> {
  return httpGet<SpotDepositWire[]>(
    '/account/spot_asset/deposit/history',
    {
      account: query.account,
      limit: query.limit,
      cursor: query.cursor,
    },
    label,
  ).then((envelope) => ({
    items: envelope.data.map((entry) => mapSpotDepositEntry(entry)),
    nextCursor: envelope.next_cursor ?? null,
    hasMore: envelope.has_more ?? false,
  }));
}

function mapSpotDepositEntry(wire: SpotDepositWire): SpotDepositEntry {
  return {
    symbol: wire.symbol,
    amount: wire.amount,
    transactionId: wire.transaction_id,
    createdAt: wire.created_at,
  };
}

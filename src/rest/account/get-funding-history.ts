import { httpGet } from '../client';
import type { AccountFundingEntry, FundingHistoryQuery, OrderSide, Paginated } from '../types';

interface AccountFundingWire {
  history_id: number;
  symbol: string;
  side: OrderSide;
  amount: string;
  payout: string;
  rate: string;
  created_at: number;
}

export function getFundingHistory(
  query: FundingHistoryQuery,
): Promise<Paginated<AccountFundingEntry>> {
  return httpGet<AccountFundingWire[]>('/funding/history', {
    account: query.account,
    limit: query.limit,
    cursor: query.cursor,
  }).then((envelope) => ({
    items: envelope.data.map((entry) => mapFundingEntry(entry)),
    nextCursor: envelope.next_cursor ?? null,
    hasMore: envelope.has_more ?? false,
  }));
}

function mapFundingEntry(wire: AccountFundingWire): AccountFundingEntry {
  return {
    historyId: wire.history_id,
    symbol: wire.symbol,
    side: wire.side,
    amount: wire.amount,
    payout: wire.payout,
    rate: wire.rate,
    createdAt: wire.created_at,
  };
}

import type {
  AccountFundingEntry,
  FundingHistoryQuery,
  OrderSide,
  Paginated,
} from '../../common/native';
import { httpGet } from '../client';

interface AccountFundingWire {
  history_id: number;
  symbol: string;
  side: OrderSide;
  amount: string;
  payout: string;
  rate: string;
  created_at: number;
}

/**
 * Paiements de funding du **compte** (payouts) — spécifique Pacifica.
 * À ne pas confondre avec `getFundingHistory` (taux public unifié).
 */
export function getAccountFunding(
  query: FundingHistoryQuery,
  label?: string,
): Promise<Paginated<AccountFundingEntry>> {
  return httpGet<AccountFundingWire[]>(
    '/funding/history',
    {
      account: query.account,
      limit: query.limit,
      cursor: query.cursor,
    },
    label,
  ).then((envelope) => ({
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

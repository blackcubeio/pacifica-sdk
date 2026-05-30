import type { PacificaClient } from '../../common/config';
import type {
  Paginated,
  SpotBalanceHistoryEntry,
  SpotBalanceHistoryQuery,
} from '../../common/native';
import { httpGet } from '../client';

interface SpotBalanceHistoryWire {
  amount: string;
  balance: string;
  symbol: string;
  event_type: string;
  created_at: number;
}

export function getSpotBalanceHistory(
  client: PacificaClient,
  query: SpotBalanceHistoryQuery,
  label?: string,
): Promise<Paginated<SpotBalanceHistoryEntry>> {
  return httpGet<SpotBalanceHistoryWire[]>(
    client,
    '/account/spot_balance/history',
    {
      account: query.account,
      symbol: query.symbol,
      limit: query.limit,
      cursor: query.cursor,
    },
    label,
  ).then((envelope) => ({
    items: envelope.data.map((entry) => mapSpotBalanceHistoryEntry(entry)),
    nextCursor: envelope.next_cursor ?? null,
    hasMore: envelope.has_more ?? false,
  }));
}

function mapSpotBalanceHistoryEntry(wire: SpotBalanceHistoryWire): SpotBalanceHistoryEntry {
  return {
    amount: wire.amount,
    balance: wire.balance,
    symbol: wire.symbol,
    eventType: wire.event_type,
    createdAt: wire.created_at,
  };
}

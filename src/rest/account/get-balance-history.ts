import type { PacificaClient } from '../../common/config';
import type {
  BalanceEventType,
  BalanceHistoryEntry,
  BalanceHistoryQuery,
  Paginated,
} from '../../common/native';
import { httpGet } from '../client';

interface BalanceHistoryWire {
  amount: string;
  balance: string;
  pending_balance: string;
  event_type: BalanceEventType;
  created_at: number;
}

export function getBalanceHistory(
  client: PacificaClient,
  query: BalanceHistoryQuery,
  label?: string,
): Promise<Paginated<BalanceHistoryEntry>> {
  return httpGet<BalanceHistoryWire[]>(
    client,
    '/account/balance/history',
    {
      account: query.account,
      limit: query.limit,
      cursor: query.cursor,
    },
    label,
  ).then((envelope) => ({
    items: envelope.data.map((entry) => mapBalanceHistoryEntry(entry)),
    nextCursor: envelope.next_cursor ?? null,
    hasMore: envelope.has_more ?? false,
  }));
}

function mapBalanceHistoryEntry(wire: BalanceHistoryWire): BalanceHistoryEntry {
  return {
    amount: wire.amount,
    balance: wire.balance,
    pendingBalance: wire.pending_balance,
    eventType: wire.event_type,
    createdAt: wire.created_at,
  };
}

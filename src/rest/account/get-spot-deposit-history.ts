import type { PacificaClient } from '../../common/config';
import type { Paginated, SpotDepositEntry, SpotHistoryQuery } from '../../common/native';
import { httpGet } from '../client';

interface SpotDepositWire {
  symbol: string;
  amount: string;
  transaction_id: string;
  created_at: number;
}

export function getSpotDepositHistory(
  client: PacificaClient,
  query: SpotHistoryQuery,
  label?: string,
): Promise<Paginated<SpotDepositEntry>> {
  return httpGet<SpotDepositWire[]>(
    client,
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

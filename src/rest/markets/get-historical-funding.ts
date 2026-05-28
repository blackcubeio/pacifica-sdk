import { httpGet } from '../client';
import type { FundingPoint, HistoricalFundingQuery, Paginated } from '../types';

interface FundingPointWire {
  oracle_price: string;
  bid_impact_price: string;
  ask_impact_price: string;
  funding_rate: string;
  next_funding_rate: string;
  created_at: number;
}

export function getHistoricalFunding(
  query: HistoricalFundingQuery,
  label?: string,
): Promise<Paginated<FundingPoint>> {
  return httpGet<FundingPointWire[]>(
    '/funding_rate/history',
    {
      symbol: query.symbol,
      limit: query.limit,
      cursor: query.cursor,
    },
    label,
  ).then((envelope) => ({
    items: envelope.data.map((point) => mapFundingPoint(point)),
    nextCursor: envelope.next_cursor ?? null,
    hasMore: envelope.has_more ?? false,
  }));
}

function mapFundingPoint(wire: FundingPointWire): FundingPoint {
  return {
    oraclePrice: wire.oracle_price,
    bidImpactPrice: wire.bid_impact_price,
    askImpactPrice: wire.ask_impact_price,
    fundingRate: wire.funding_rate,
    nextFundingRate: wire.next_funding_rate,
    createdAt: wire.created_at,
  };
}

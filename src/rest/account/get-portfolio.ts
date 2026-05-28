import { httpGet } from '../client';
import type { PortfolioPoint, PortfolioQuery } from '../types';

interface PortfolioPointWire {
  account_equity: string;
  pnl: string;
  timestamp: number;
}

export function getPortfolio(query: PortfolioQuery, label?: string): Promise<PortfolioPoint[]> {
  return httpGet<PortfolioPointWire[]>(
    '/portfolio',
    {
      account: query.account,
      time_range: query.timeRange,
      start_time: query.startTime,
      end_time: query.endTime,
      limit: query.limit,
    },
    label,
  ).then((envelope) => envelope.data.map((point) => mapPortfolioPoint(point)));
}

function mapPortfolioPoint(wire: PortfolioPointWire): PortfolioPoint {
  return {
    accountEquity: wire.account_equity,
    pnl: wire.pnl,
    timestamp: wire.timestamp,
  };
}

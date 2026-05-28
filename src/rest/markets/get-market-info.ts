import { httpGet } from '../client';
import type { Market } from '../types';

interface MarketWire {
  symbol: string;
  tick_size: string;
  min_tick: string;
  max_tick: string;
  lot_size: string;
  max_leverage: number;
  isolated_only: boolean;
  min_order_size: string;
  max_order_size: string;
  funding_rate: string;
  next_funding_rate: string;
  created_at: number;
}

export function getMarketInfo(label?: string): Promise<Market[]> {
  return httpGet<MarketWire[]>('/info', undefined, label).then((envelope) =>
    envelope.data.map((market) => mapMarket(market)),
  );
}

function mapMarket(wire: MarketWire): Market {
  return {
    symbol: wire.symbol,
    tickSize: wire.tick_size,
    minTick: wire.min_tick,
    maxTick: wire.max_tick,
    lotSize: wire.lot_size,
    maxLeverage: wire.max_leverage,
    isolatedOnly: wire.isolated_only,
    minOrderSize: wire.min_order_size,
    maxOrderSize: wire.max_order_size,
    fundingRate: wire.funding_rate,
    nextFundingRate: wire.next_funding_rate,
    createdAt: wire.created_at,
  };
}

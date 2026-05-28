import { httpGet } from '../client';
import type { Price } from '../types';

interface PriceWire {
  symbol: string;
  mark: string;
  mid: string;
  oracle: string;
  funding: string;
  next_funding: string;
  open_interest: string;
  volume_24h: string;
  yesterday_price: string;
  timestamp: number;
}

export function getPrices(label?: string): Promise<Price[]> {
  return httpGet<PriceWire[]>('/info/prices', undefined, label).then((envelope) =>
    envelope.data.map((price) => mapPrice(price)),
  );
}

function mapPrice(wire: PriceWire): Price {
  return {
    symbol: wire.symbol,
    mark: wire.mark,
    mid: wire.mid,
    oracle: wire.oracle,
    funding: wire.funding,
    nextFunding: wire.next_funding,
    openInterest: wire.open_interest,
    volume24h: wire.volume_24h,
    yesterdayPrice: wire.yesterday_price,
    timestamp: wire.timestamp,
  };
}

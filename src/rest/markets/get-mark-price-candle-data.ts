import { httpGet } from '../client';
import type { Candle, CandleQuery } from '../types';

interface CandleWire {
  t: number;
  T: number;
  s: string;
  i: string;
  o: string;
  c: string;
  h: string;
  l: string;
  v: string;
  n: number;
}

export function getMarkPriceCandleData(query: CandleQuery): Promise<Candle[]> {
  return httpGet<CandleWire[]>('/kline/mark', {
    symbol: query.symbol,
    interval: query.interval,
    start_time: query.startTime,
    end_time: query.endTime,
  }).then((envelope) => envelope.data.map((candle) => mapCandle(candle)));
}

function mapCandle(wire: CandleWire): Candle {
  return {
    symbol: wire.s,
    interval: wire.i,
    openTime: wire.t,
    closeTime: wire.T,
    open: wire.o,
    close: wire.c,
    high: wire.h,
    low: wire.l,
    volume: wire.v,
    tradeCount: wire.n,
  };
}

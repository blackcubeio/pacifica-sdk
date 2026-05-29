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

export function getMarkPriceCandleData(query: CandleQuery, label?: string): Promise<Candle[]> {
  return httpGet<CandleWire[]>(
    '/kline/mark',
    {
      symbol: query.symbol,
      interval: query.interval,
      start_time: query.startTime,
      end_time: query.endTime,
    },
    label,
  ).then((envelope) => envelope.data.map((candle) => mapCandle(candle)));
}

/** Le wire Pacifica utilise déjà les clés courtes ; on ajoute juste `kind: 'perp'`. */
function mapCandle(wire: CandleWire): Candle {
  return { ...wire, kind: 'perp' };
}

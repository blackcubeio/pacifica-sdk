import type { Candle, CandleQuery } from '../../common/native';
import { CandleConverter, type CandleNative } from '../../converters/candle';
import { httpGet } from '../client';

export function getCandleData(query: CandleQuery, label?: string): Promise<Candle[]> {
  const converter = new CandleConverter('perp');
  return httpGet<CandleNative[]>(
    '/kline',
    {
      symbol: query.symbol,
      interval: query.interval,
      start_time: query.startTime,
      end_time: query.endTime,
    },
    label,
  ).then((envelope) => envelope.data.map((candle) => converter.toCommon(candle)));
}

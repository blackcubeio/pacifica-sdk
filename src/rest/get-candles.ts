import type { PacificaClient } from '../common/config';
import type { Candle, CandleInterval } from '../common/native';
import type { GetCandlesParams } from '../common/types';
import { getCandleData } from './markets/get-candle-data';

/** Bougies au **format unifié** (`getCandles`, même API sur les 3 SDK). */
export function getCandles(
  client: PacificaClient,
  params: GetCandlesParams,
  label?: string,
): Promise<Candle[]> {
  return getCandleData(
    client,
    {
      symbol: params.name,
      interval: params.interval as CandleInterval,
      startTime: params.startTime,
      endTime: params.endTime,
    },
    label,
  );
}

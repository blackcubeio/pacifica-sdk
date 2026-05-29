import type { MarketKind } from '../common/types';
import { getCandleData } from './markets/get-candle-data';
import type { Candle, CandleInterval } from './types';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetCandlesParams {
  /** Identifiant de la paire (= `Pair.name`). */
  name: string;
  /** Intervalle (`1m`, `1h`, `1d`…). */
  interval: string;
  /** Début (ms). */
  startTime: number;
  /** Fin (ms), optionnel. */
  endTime?: number;
  /** Type de marché (Pacifica : `perp` uniquement). */
  kind?: MarketKind;
  /** Ignoré par Pacifica. */
  limit?: number;
}

/** Bougies au **format unifié** (`getCandles`, même API sur les 3 SDK). */
export function getCandles(params: GetCandlesParams, label?: string): Promise<Candle[]> {
  return getCandleData(
    {
      symbol: params.name,
      interval: params.interval as CandleInterval,
      startTime: params.startTime,
      endTime: params.endTime,
    },
    label,
  );
}

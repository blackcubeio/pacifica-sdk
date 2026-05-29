import type { FundingRate } from '../common/types';
import { httpGet } from './client';
import { FundingConverter, type FundingRateNative } from './converters/funding';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetFundingHistoryParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Nombre de points. */
  limit?: number;
  /** Curseur de pagination (Pacifica). */
  cursor?: string;
}

/**
 * Historique du **taux de funding** au format unifié (Pacifica `/funding_rate/history`).
 * Le curseur de pagination n'est pas repris dans le tableau unifié.
 */
export function getFundingHistory(
  params: GetFundingHistoryParams,
  label?: string,
): Promise<FundingRate[]> {
  const converter = new FundingConverter(params.name);
  return httpGet<FundingRateNative[]>(
    '/funding_rate/history',
    { symbol: params.name, limit: params.limit, cursor: params.cursor },
    label,
  ).then((envelope) => envelope.data.map((point) => converter.toCommon(point)));
}

import type { GetFundingHistoryParams } from '../common/types';
import type { FundingRate } from '../common/types';
import { FundingConverter, type FundingRateNative } from '../converters/funding';
import { httpGet } from './client';

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

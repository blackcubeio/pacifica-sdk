import type { Pair } from '../common/types';
import { PairConverter } from '../converters/pair';
import { getMarketInfo } from './markets/get-market-info';

/**
 * Toutes les paires au **format unifié** `Pair`. Pacifica n'expose que des marchés **perp**
 * (`kind: 'perp'`) ; le natif `Market` hors cœur est conservé dans `xtras`.
 */
export function getPairs(label?: string): Promise<Pair[]> {
  const converter = new PairConverter();
  return getMarketInfo(label).then((markets) =>
    markets.map((market) => converter.toCommon(market)),
  );
}

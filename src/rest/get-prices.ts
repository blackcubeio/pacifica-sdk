import type { Price } from '../common/types';
import { httpGet } from './client';
import { PriceConverter, type PriceNative } from './converters/price';

/** Prix de tous les marchés au **format unifié** `Price` (Pacifica `/info/prices`). */
export function getPrices(label?: string): Promise<Price[]> {
  const converter = new PriceConverter();
  return httpGet<PriceNative[]>('/info/prices', undefined, label).then((envelope) =>
    envelope.data.map((price) => converter.toCommon(price)),
  );
}

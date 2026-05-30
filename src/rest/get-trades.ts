import type { GetTradesParams } from '../common/types';
import type { MarketKind, Trade } from '../common/types';
import { TradeConverter, type TradeNative } from '../converters/trade';
import { httpGet } from './client';

/** Trades publics récents au **format unifié** `Trade` (Pacifica `/trades`). */
export function getTrades(params: GetTradesParams, label?: string): Promise<Trade[]> {
  const converter = new TradeConverter();
  return httpGet<TradeNative[]>('/trades', { symbol: params.name }, label).then((envelope) =>
    envelope.data.map((trade) => converter.toCommon(trade)),
  );
}

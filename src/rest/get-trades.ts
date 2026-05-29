import type { MarketKind, Trade } from '../common/types';
import { httpGet } from './client';
import { TradeConverter, type TradeNative } from './converters/trade';

/** Paramètres unifiés (mêmes champs sur les SDK qui exposent les trades publics). */
export interface GetTradesParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Type de marché (Pacifica : `perp` uniquement). */
  kind?: MarketKind;
  /** Ignoré par Pacifica. */
  limit?: number;
}

/** Trades publics récents au **format unifié** `Trade` (Pacifica `/trades`). */
export function getTrades(params: GetTradesParams, label?: string): Promise<Trade[]> {
  const converter = new TradeConverter();
  return httpGet<TradeNative[]>('/trades', { symbol: params.name }, label).then((envelope) =>
    envelope.data.map((trade) => converter.toCommon(trade)),
  );
}

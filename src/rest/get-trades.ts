import type { PacificaClient } from '../common/config';
import type { GetTradesParams } from '../common/types';
import type { Trade } from '../common/types';
import { TradeConverter, type TradeNative } from '../converters/trade';
import { httpGet } from './client';

/** Trades publics récents au **format unifié** `Trade` (Pacifica `/trades`). */
export function getTrades(
  client: PacificaClient,
  params: GetTradesParams,
  label?: string,
): Promise<Trade[]> {
  const converter = new TradeConverter();
  return httpGet<TradeNative[]>(client, '/trades', { symbol: params.name }, label).then(
    (envelope) => envelope.data.map((trade) => converter.toCommon(trade)),
  );
}

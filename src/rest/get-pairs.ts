import type { Pair } from '../common/types';
import { getMarketInfo } from './markets/get-market-info';
import type { Market } from './types';

/** Décimales déduites d'un pas (`"0.001"` → 3, `"1"` → 0). */
function decimalsFromStep(step: string): number {
  const dot = step.indexOf('.');
  return dot < 0 ? 0 : step.length - dot - 1;
}

// Pacifica : marchés **perp** uniquement, collatéral/quote en USDC. Pas de paires spot
// tradables (le « spot » Pacifica = custody d'actifs, pas un orderbook).
function marketToPair(market: Market): Pair {
  return {
    name: market.symbol,
    base: market.symbol,
    quote: 'USDC',
    kind: 'perp',
    szDecimals: decimalsFromStep(market.lotSize),
    maxLeverage: market.maxLeverage,
    tickSize: market.tickSize,
    stepSize: market.lotSize,
    raw: market as unknown as Record<string, unknown>,
  };
}

/**
 * Toutes les paires au **format unifié** `Pair`. Pacifica n'expose que des marchés **perp**
 * (`kind: 'perp'`) ; `raw` contient le `Market` d'origine complet.
 */
export function getPairs(label?: string): Promise<Pair[]> {
  return getMarketInfo(label).then((markets) => markets.map(marketToPair));
}

import type { Market } from '../common/native';
import type { Pair } from '../common/types';

/** Décimales déduites d'un pas (`"0.001"` → 3, `"1"` → 0). */
function decimalsFromStep(step: string): number {
  const dot = step.indexOf('.');
  return dot < 0 ? 0 : step.length - dot - 1;
}

/**
 * Convertisseur **bijectif** paire : `toCommon(market) → Pair` / `toNative(pair) → market`.
 * Pacifica n'expose que des marchés **perp** (collatéral/quote USDC). Le cœur unifié est
 * extrait ; **tout le reste** va dans `xtras` → `toNative(toCommon(x)) ≡ x`.
 * `kind`/`base`/`quote`/`szDecimals` sont dérivés (pas de champ natif dédié).
 */
export class PairConverter {
  toCommon(market: Market): Pair {
    const { symbol: name, tickSize, lotSize, maxLeverage, ...rest } = market;
    const pair: Pair = {
      name,
      base: name,
      quote: 'USDC',
      kind: 'perp',
      szDecimals: decimalsFromStep(lotSize),
      maxLeverage,
      tickSize,
      stepSize: lotSize,
    };
    if (Object.keys(rest).length > 0) {
      pair.xtras = rest as Record<string, unknown>;
    }
    return pair;
  }

  toNative(pair: Pair): Market {
    return {
      symbol: pair.name,
      tickSize: pair.tickSize,
      lotSize: pair.stepSize,
      maxLeverage: pair.maxLeverage,
      ...pair.xtras,
    } as unknown as Market;
  }
}

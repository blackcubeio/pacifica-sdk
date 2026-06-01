import type { AccountSpotBalance } from '../common/native';
import type { Balance } from '../common/types';

/** Solde spot natif Pacifica (issu de `AccountInfo.spotBalances`). */
export type BalanceNative = AccountSpotBalance;

/**
 * Convertisseur **bijectif** solde : `toCommon(native) → Balance` / inverse.
 * `total = amount`, `available = availableToWithdraw` ; pending/limites → `xtras` → bijection totale.
 */
export class BalanceConverter {
  toCommon(wire: BalanceNative): Balance {
    const { symbol, amount, availableToWithdraw, ...rest } = wire;
    return {
      asset: symbol,
      total: amount,
      available: availableToWithdraw,
      usdValue: null,
      xtras: rest as Record<string, unknown>,
    };
  }

  toNative(balance: Balance): BalanceNative {
    // `xtras` porte les champs natifs hors cœur (pending/limites) ; on les ré-étale dans le wire.
    // Cast simple (pas de double `as unknown`) : les 3 champs cœur sont explicitement reconstruits.
    return {
      ...(balance.xtras as Omit<BalanceNative, 'symbol' | 'amount' | 'availableToWithdraw'>),
      symbol: balance.asset,
      amount: balance.total,
      availableToWithdraw: balance.available ?? '0',
    };
  }
}

import type { Balance } from '../common/types';
import type { AccountSpotBalance } from '../rest/types';

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
    return {
      symbol: balance.asset,
      amount: balance.total,
      availableToWithdraw: balance.available as string,
      ...balance.xtras,
    } as unknown as BalanceNative;
  }
}

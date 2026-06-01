import type { Subaccount } from '../common/native';
import type { SubAccount } from '../common/types';

/** Sous-compte natif Pacifica (`/account/subaccount/list`). */
export type SubAccountNative = Subaccount;

/**
 * Convertisseur **bijectif** sous-compte : `toCommon(native) → SubAccount` / inverse.
 * Seule l'`address` est dans le cœur ; le reste (balance, feeLevel, feeMode, createdAt)
 * → `xtras` → bijection totale.
 */
export class SubAccountConverter {
  toCommon(wire: SubAccountNative): SubAccount {
    const { address, ...rest } = wire;
    return { address, xtras: rest as Record<string, unknown> };
  }

  toNative(account: SubAccount): SubAccountNative {
    return { ...(account.xtras as Omit<SubAccountNative, 'address'>), address: account.address };
  }
}

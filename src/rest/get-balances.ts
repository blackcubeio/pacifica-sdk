import type { Balance } from '../common/types';
import { getAccountInfo } from './account/get-account-info';
import { BalanceConverter } from './converters/balance';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetBalancesParams {
  /** Adresse du compte (clé publique), **requise** côté Pacifica. */
  user: string;
}

/**
 * Soldes **spot** par actif au **format unifié** `Balance` (Pacifica `/account.spotBalances`).
 * L'équité/collatéral perp est dans `getAccountInfo` (spécifique Pacifica).
 */
export function getBalances(params: GetBalancesParams, label?: string): Promise<Balance[]> {
  const converter = new BalanceConverter();
  return getAccountInfo({ account: params.user }, label).then((info) =>
    info.spotBalances.map((balance) => converter.toCommon(balance)),
  );
}

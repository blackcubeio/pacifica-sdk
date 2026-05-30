import type { GetBalancesParams } from '../common/types';
import type { Balance } from '../common/types';
import { BalanceConverter } from '../converters/balance';
import { getAccountInfo } from './account/get-account-info';

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

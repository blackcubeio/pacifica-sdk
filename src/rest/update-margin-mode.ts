import type { MarketKind } from '../common/types';
import { OperationType } from '../common/types';
import { httpPost } from './client';
import { buildSignedRequest } from './signing';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface UpdateMarginModeParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** `true` = marge isolée, `false` = cross. */
  isolated: boolean;
  /** Type de marché ; défaut `perp`. */
  kind?: MarketKind;
}

/** Bascule une paire entre marge isolée et cross (**écriture signée**, Pacifica `/account/margin`). */
export function updateMarginMode(params: UpdateMarginModeParams, label: string): Promise<void> {
  const payload = { symbol: params.name, is_isolated: params.isolated };
  const request = buildSignedRequest(OperationType.UpdateMarginMode, payload, label);
  return httpPost<null>('/account/margin', request, label).then(() => undefined);
}

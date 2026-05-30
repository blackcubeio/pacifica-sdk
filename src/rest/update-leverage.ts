import { OperationType } from '../common/types';
import type { MarketKind } from '../common/types';
import { httpPost } from './client';
import { buildSignedRequest } from './signing';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface UpdateLeverageParams {
  /** Paire/symbole (= `Pair.name`). */
  name: string;
  /** Levier cible (entier). */
  leverage: number;
  /** Type de marché ; défaut `perp`. */
  kind?: MarketKind;
}

/** Confirmation unifiée d'un changement de levier. */
export interface LeverageUpdate {
  name: string;
  leverage: number;
  xtras?: Record<string, unknown>;
}

/** Met à jour le levier d'une paire (**écriture signée**, Pacifica `/account/leverage`). */
export function updateLeverage(
  params: UpdateLeverageParams,
  label: string,
): Promise<LeverageUpdate> {
  const request = buildSignedRequest(
    OperationType.UpdateLeverage,
    { symbol: params.name, leverage: params.leverage },
    label,
  );
  return httpPost<null>('/account/leverage', request, label).then(() => ({
    name: params.name,
    leverage: params.leverage,
  }));
}

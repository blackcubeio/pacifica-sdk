import type { LeverageUpdate, UpdateLeverageParams } from '../common/types';
import { OperationType } from '../common/types';
import type { MarketKind } from '../common/types';
import { httpPost } from './client';
import { buildSignedRequest } from './signing';

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

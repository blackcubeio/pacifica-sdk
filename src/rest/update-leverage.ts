import type { PacificaClient } from '../common/config';
import type { LeverageUpdate, UpdateLeverageParams } from '../common/types';
import { OperationType } from '../common/types';
import { httpPost } from './client';
import { buildSignedRequest } from './signing';

/** Met à jour le levier d'une paire (**écriture signée**, Pacifica `/account/leverage`). */
export function updateLeverage(
  client: PacificaClient,
  params: UpdateLeverageParams,
  label: string,
): Promise<LeverageUpdate> {
  const request = buildSignedRequest(
    client,
    OperationType.UpdateLeverage,
    { symbol: params.name, leverage: params.leverage },
    label,
  );
  return httpPost<null>(client, '/account/leverage', request, label).then(() => ({
    name: params.name,
    leverage: params.leverage,
  }));
}

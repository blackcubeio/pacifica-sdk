import type { PacificaClient } from '../common/config';
import type { UpdateMarginModeParams } from '../common/types';
import { OperationType } from '../common/types';
import { httpPost } from './client';
import { buildSignedRequest } from './signing';

/** Bascule une paire entre marge isolée et cross (**écriture signée**, Pacifica `/account/margin`). */
export function updateMarginMode(
  client: PacificaClient,
  params: UpdateMarginModeParams,
  label: string,
): Promise<void> {
  const payload = { symbol: params.name, is_isolated: params.isolated };
  const request = buildSignedRequest(client, OperationType.UpdateMarginMode, payload, label);
  return httpPost<null>(client, '/account/margin', request, label).then(() => undefined);
}

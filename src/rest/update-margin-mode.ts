import type { UpdateMarginModeParams } from '../common/types';
import type { MarketKind } from '../common/types';
import { OperationType } from '../common/types';
import { httpPost } from './client';
import { buildSignedRequest } from './signing';

/** Bascule une paire entre marge isolée et cross (**écriture signée**, Pacifica `/account/margin`). */
export function updateMarginMode(params: UpdateMarginModeParams, label: string): Promise<void> {
  const payload = { symbol: params.name, is_isolated: params.isolated };
  const request = buildSignedRequest(OperationType.UpdateMarginMode, payload, label);
  return httpPost<null>('/account/margin', request, label).then(() => undefined);
}

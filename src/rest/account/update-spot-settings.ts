import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { UpdateSpotSettingsParams } from '../types';

export function updateSpotSettings(
  params: UpdateSpotSettingsParams,
  signer?: Signer,
): Promise<void> {
  const payload = {
    symbol: params.symbol,
    unified_margin_excluded: params.unifiedMarginExcluded,
  };
  const request = buildSignedRequest(OperationType.UpdateAccountSpotSettings, payload, signer);
  return httpPost<null>('/account/settings/spot', request).then(() => undefined);
}

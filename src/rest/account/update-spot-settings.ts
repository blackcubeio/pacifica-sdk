import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { UpdateSpotSettingsParams } from '../types';

export function updateSpotSettings(
  params: UpdateSpotSettingsParams,
  account?: string,
): Promise<void> {
  const payload = {
    symbol: params.symbol,
    unified_margin_excluded: params.unifiedMarginExcluded,
  };
  const request = buildSignedRequest(OperationType.UpdateAccountSpotSettings, payload, account);
  return httpPost<null>('/account/settings/spot', request).then(() => undefined);
}

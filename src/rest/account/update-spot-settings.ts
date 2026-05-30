import type { UpdateSpotSettingsParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function updateSpotSettings(params: UpdateSpotSettingsParams, label: string): Promise<void> {
  const payload = {
    symbol: params.symbol,
    unified_margin_excluded: params.unifiedMarginExcluded,
  };
  const request = buildSignedRequest(OperationType.UpdateAccountSpotSettings, payload, label);
  return httpPost<null>('/account/settings/spot', request, label).then(() => undefined);
}

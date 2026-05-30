import type { PacificaClient } from '../../common/config';
import type { UpdateSpotSettingsParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function updateSpotSettings(
  client: PacificaClient,
  params: UpdateSpotSettingsParams,
  label: string,
): Promise<void> {
  const payload = {
    symbol: params.symbol,
    unified_margin_excluded: params.unifiedMarginExcluded,
  };
  const request = buildSignedRequest(
    client,
    OperationType.UpdateAccountSpotSettings,
    payload,
    label,
  );
  return httpPost<null>(client, '/account/settings/spot', request, label).then(() => undefined);
}

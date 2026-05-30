import type { AddMaxLeverageParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function addMaxLeverage(params: AddMaxLeverageParams, label: string): Promise<void> {
  const payload = {
    lake: params.lake,
    symbols: params.symbols,
    max_leverage: params.maxLeverage,
  };
  const request = buildSignedRequest(OperationType.AddLakeMaxLeverage, payload, label);
  return httpPost<null>('/lake/add_max_leverage', request, label).then(() => undefined);
}

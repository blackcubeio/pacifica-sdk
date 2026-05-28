import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { AddMaxLeverageParams } from '../types';

export function addMaxLeverage(params: AddMaxLeverageParams, account?: string): Promise<void> {
  const payload = {
    lake: params.lake,
    symbols: params.symbols,
    max_leverage: params.maxLeverage,
  };
  const request = buildSignedRequest(OperationType.AddLakeMaxLeverage, payload, account);
  return httpPost<null>('/lake/add_max_leverage', request).then(() => undefined);
}

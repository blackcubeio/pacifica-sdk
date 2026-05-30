import type { VaultSymbolsParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function removeMaxLeverage(params: VaultSymbolsParams, label: string): Promise<void> {
  const payload = { lake: params.lake, symbols: params.symbols };
  const request = buildSignedRequest(OperationType.RemoveLakeMaxLeverage, payload, label);
  return httpPost<null>('/lake/remove_max_leverage', request, label).then(() => undefined);
}

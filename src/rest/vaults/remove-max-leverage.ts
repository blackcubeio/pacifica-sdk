import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { VaultSymbolsParams } from '../types';

export function removeMaxLeverage(params: VaultSymbolsParams, account?: string): Promise<void> {
  const payload = { lake: params.lake, symbols: params.symbols };
  const request = buildSignedRequest(OperationType.RemoveLakeMaxLeverage, payload, account);
  return httpPost<null>('/lake/remove_max_leverage', request).then(() => undefined);
}

import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { VaultSymbolsParams } from '../types';

export function removeFromWhitelist(params: VaultSymbolsParams, account?: string): Promise<void> {
  const payload = { lake: params.lake, symbols: params.symbols };
  const request = buildSignedRequest(OperationType.RemoveLakeWhitelist, payload, account);
  return httpPost<null>('/lake/remove_whitelist', request).then(() => undefined);
}

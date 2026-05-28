import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { VaultSymbolsParams } from '../types';

export function removeFromBlacklist(params: VaultSymbolsParams, account?: string): Promise<void> {
  const payload = { lake: params.lake, symbols: params.symbols };
  const request = buildSignedRequest(OperationType.RemoveLakeBlacklist, payload, account);
  return httpPost<null>('/lake/remove_blacklist', request).then(() => undefined);
}

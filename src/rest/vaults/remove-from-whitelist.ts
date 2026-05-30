import type { VaultSymbolsParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function removeFromWhitelist(params: VaultSymbolsParams, label: string): Promise<void> {
  const payload = { lake: params.lake, symbols: params.symbols };
  const request = buildSignedRequest(OperationType.RemoveLakeWhitelist, payload, label);
  return httpPost<null>('/lake/remove_whitelist', request, label).then(() => undefined);
}

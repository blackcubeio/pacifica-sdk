import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { VaultSymbolsParams } from '../types';

export function removeFromWhitelist(params: VaultSymbolsParams, signer?: Signer): Promise<void> {
  const payload = { lake: params.lake, symbols: params.symbols };
  const request = buildSignedRequest(OperationType.RemoveLakeWhitelist, payload, signer);
  return httpPost<null>('/lake/remove_whitelist', request).then(() => undefined);
}

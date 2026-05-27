import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function revokeAllAgentWallets(signer?: Signer): Promise<void> {
  const request = buildSignedRequest(OperationType.RevokeAllAgentWallets, {}, signer);
  return httpPost<null>('/agent/revoke_all', request).then(() => undefined);
}

import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function revokeAllAgentWallets(account?: string): Promise<void> {
  const request = buildSignedRequest(OperationType.RevokeAllAgentWallets, {}, account);
  return httpPost<null>('/agent/revoke_all', request).then(() => undefined);
}

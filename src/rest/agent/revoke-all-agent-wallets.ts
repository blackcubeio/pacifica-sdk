import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function revokeAllAgentWallets(label: string): Promise<void> {
  const request = buildSignedRequest(OperationType.RevokeAllAgentWallets, {}, label);
  return httpPost<null>('/agent/revoke_all', request, label).then(() => undefined);
}

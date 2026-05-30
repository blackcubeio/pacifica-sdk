import type { PacificaClient } from '../../common/config';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function revokeAllAgentWallets(client: PacificaClient, label: string): Promise<void> {
  const request = buildSignedRequest(client, OperationType.RevokeAllAgentWallets, {}, label);
  return httpPost<null>(client, '/agent/revoke_all', request, label).then(() => undefined);
}

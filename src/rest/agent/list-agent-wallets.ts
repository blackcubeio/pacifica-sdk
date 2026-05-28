import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function listAgentWallets(account?: string): Promise<string[]> {
  const request = buildSignedRequest(OperationType.ListAgentWallets, {}, account);
  return httpPost<{ agent_wallets: string[] }>('/agent/list', request).then(
    (envelope) => envelope.data.agent_wallets,
  );
}

import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function listAgentWallets(label: string): Promise<string[]> {
  const request = buildSignedRequest(OperationType.ListAgentWallets, {}, label);
  return httpPost<{ agent_wallets: string[] }>('/agent/list', request, label).then(
    (envelope) => envelope.data.agent_wallets,
  );
}

import type { PacificaClient } from '../../common/config';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function listAgentWallets(client: PacificaClient, label: string): Promise<string[]> {
  const request = buildSignedRequest(client, OperationType.ListAgentWallets, {}, label);
  return httpPost<{ agent_wallets: string[] }>(client, '/agent/list', request, label).then(
    (envelope) => envelope.data.agent_wallets,
  );
}

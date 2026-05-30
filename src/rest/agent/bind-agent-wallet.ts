import type { PacificaClient } from '../../common/config';
import type { BindAgentWalletParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function bindAgentWallet(
  client: PacificaClient,
  params: BindAgentWalletParams,
  label: string,
): Promise<void> {
  const payload = { agent_wallet: params.agentWallet };
  const request = buildSignedRequest(client, OperationType.BindAgentWallet, payload, label);
  return httpPost<null>(client, '/agent/bind', request, label).then(() => undefined);
}

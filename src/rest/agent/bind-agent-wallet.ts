import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { BindAgentWalletParams } from '../types';

export function bindAgentWallet(params: BindAgentWalletParams, label: string): Promise<void> {
  const payload = { agent_wallet: params.agentWallet };
  const request = buildSignedRequest(OperationType.BindAgentWallet, payload, label);
  return httpPost<null>('/agent/bind', request, label).then(() => undefined);
}

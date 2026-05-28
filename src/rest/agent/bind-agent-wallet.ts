import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { BindAgentWalletParams } from '../types';

export function bindAgentWallet(params: BindAgentWalletParams, account?: string): Promise<void> {
  const payload = { agent_wallet: params.agentWallet };
  const request = buildSignedRequest(OperationType.BindAgentWallet, payload, account);
  return httpPost<null>('/agent/bind', request).then(() => undefined);
}

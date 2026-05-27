import { OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import type { BindAgentWalletParams } from '../types';

export function bindAgentWallet(params: BindAgentWalletParams, signer?: Signer): Promise<void> {
  const payload = { agent_wallet: params.agentWallet };
  const request = buildSignedRequest(OperationType.BindAgentWallet, payload, signer);
  return httpPost<null>('/agent/bind', request).then(() => undefined);
}

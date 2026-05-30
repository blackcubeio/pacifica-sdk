import type { PacificaClient } from '../../common/config';
import type { ClaimManagerParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function claimManager(
  client: PacificaClient,
  params: ClaimManagerParams,
  label: string,
): Promise<void> {
  const payload = { lake: params.lake, deposit_amount: params.depositAmount };
  const request = buildSignedRequest(client, OperationType.ClaimLakeManager, payload, label);
  return httpPost<null>(client, '/lake/claim_manager', request, label).then(() => undefined);
}

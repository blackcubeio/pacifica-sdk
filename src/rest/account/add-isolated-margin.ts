import type { AddIsolatedMarginParams } from '../../common/native';
import { OperationType } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';

export function addIsolatedMargin(params: AddIsolatedMarginParams, label: string): Promise<void> {
  const payload = { symbol: params.symbol, amount: params.amount };
  const request = buildSignedRequest(OperationType.AddIsolatedMargin, payload, label);
  return httpPost<null>('/positions/add_isolated_margin', request, label).then(() => undefined);
}

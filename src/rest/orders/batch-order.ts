import { type JsonObject, OperationType, type Signer } from '../../common/types';
import { httpPost } from '../client';
import { buildSignedRequest } from '../signing';
import {
  type BatchAction,
  type BatchActionResult,
  BatchActionType,
  type BatchResult,
} from '../types';
import {
  buildCancelOrderPayload,
  buildCancelStopOrderPayload,
  buildEditOrderPayload,
  buildLimitOrderPayload,
  buildMarketOrderPayload,
} from './payloads';

interface BatchActionResultWire {
  success: boolean;
  order_id?: number;
  error?: string | null;
}

export function batchOrders(actions: BatchAction[], signer?: Signer): Promise<BatchResult> {
  const signedActions = actions.map((action) => buildBatchAction(action, signer));
  return httpPost<{ results: BatchActionResultWire[] }>('/orders/batch', {
    actions: signedActions,
  }).then((envelope) => ({
    results: envelope.data.results.map((result) => mapBatchActionResult(result)),
  }));
}

function buildBatchAction(action: BatchAction, signer?: Signer): JsonObject {
  switch (action.type) {
    case BatchActionType.Create:
      return {
        type: BatchActionType.Create,
        data: buildSignedRequest(
          OperationType.CreateOrder,
          buildLimitOrderPayload(action.params),
          signer,
        ),
      };
    case BatchActionType.CreateMarket:
      return {
        type: BatchActionType.CreateMarket,
        data: buildSignedRequest(
          OperationType.CreateMarketOrder,
          buildMarketOrderPayload(action.params),
          signer,
        ),
      };
    case BatchActionType.Cancel:
      return {
        type: BatchActionType.Cancel,
        data: buildSignedRequest(
          OperationType.CancelOrder,
          buildCancelOrderPayload(action.params),
          signer,
        ),
      };
    case BatchActionType.Edit:
      return {
        type: BatchActionType.Edit,
        data: buildSignedRequest(
          OperationType.EditOrder,
          buildEditOrderPayload(action.params),
          signer,
        ),
      };
    case BatchActionType.CancelStopOrder:
      return {
        type: BatchActionType.CancelStopOrder,
        data: buildSignedRequest(
          OperationType.CancelStopOrder,
          buildCancelStopOrderPayload(action.params),
          signer,
        ),
      };
    default:
      throw new Error('Unknown batch action type');
  }
}

function mapBatchActionResult(wire: BatchActionResultWire): BatchActionResult {
  return {
    success: wire.success,
    orderId: wire.order_id,
    error: wire.error ?? null,
  };
}

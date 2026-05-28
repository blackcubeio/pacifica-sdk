import { type JsonObject, OperationType } from '../../common/types';
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
  buildPositionTpslPayload,
} from './payloads';

interface BatchActionResultWire {
  success: boolean;
  order_id?: number;
  error?: string | null;
}

export function batchOrders(actions: BatchAction[], label: string): Promise<BatchResult> {
  return httpPost<{ results: BatchActionResultWire[] }>(
    '/orders/batch',
    { actions: buildSignedBatchActions(actions, label) },
    label,
  ).then((envelope) => ({
    results: envelope.data.results.map((result) => mapBatchActionResult(result)),
  }));
}

export function buildSignedBatchActions(actions: BatchAction[], label?: string): JsonObject[] {
  return actions.map((action) => buildBatchAction(action, label));
}

function buildBatchAction(action: BatchAction, label?: string): JsonObject {
  switch (action.type) {
    case BatchActionType.Create:
      return {
        type: BatchActionType.Create,
        data: buildSignedRequest(
          OperationType.CreateOrder,
          buildLimitOrderPayload(action.params),
          label,
        ),
      };
    case BatchActionType.CreateMarket:
      return {
        type: BatchActionType.CreateMarket,
        data: buildSignedRequest(
          OperationType.CreateMarketOrder,
          buildMarketOrderPayload(action.params),
          label,
        ),
      };
    case BatchActionType.Cancel:
      return {
        type: BatchActionType.Cancel,
        data: buildSignedRequest(
          OperationType.CancelOrder,
          buildCancelOrderPayload(action.params),
          label,
        ),
      };
    case BatchActionType.Edit:
      return {
        type: BatchActionType.Edit,
        data: buildSignedRequest(
          OperationType.EditOrder,
          buildEditOrderPayload(action.params),
          label,
        ),
      };
    case BatchActionType.SetPositionTpsl:
      return {
        type: BatchActionType.SetPositionTpsl,
        data: buildSignedRequest(
          OperationType.SetPositionTpsl,
          buildPositionTpslPayload(action.params),
          label,
        ),
      };
    case BatchActionType.CancelStopOrder:
      return {
        type: BatchActionType.CancelStopOrder,
        data: buildSignedRequest(
          OperationType.CancelStopOrder,
          buildCancelStopOrderPayload(action.params),
          label,
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

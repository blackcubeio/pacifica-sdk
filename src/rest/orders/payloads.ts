import type { JsonObject } from '../../common/types';
import { newClientOrderId } from '../signing';
import {
  type CancelAllOrdersParams,
  type CancelOrderParams,
  type CancelStopOrderParams,
  type CreateLimitOrderParams,
  type CreateMarketOrderParams,
  type CreatePositionTpslParams,
  type CreateStopOrderParams,
  type EditOrderParams,
  type StopConfig,
  type StopOrderConfig,
  TimeInForce,
} from '../types';

function buildStopConfig(config: StopConfig): JsonObject {
  const payload: JsonObject = { stop_price: config.stopPrice };
  if (config.limitPrice !== undefined) {
    payload.limit_price = config.limitPrice;
  }
  if (config.clientOrderId !== undefined) {
    payload.client_order_id = config.clientOrderId;
  }
  if (config.triggerPriceType !== undefined) {
    payload.trigger_price_type = config.triggerPriceType;
  }
  return payload;
}

function buildStopOrderConfig(config: StopOrderConfig): JsonObject {
  const payload = buildStopConfig(config);
  if (config.amount !== undefined) {
    payload.amount = config.amount;
  }
  return payload;
}

export function buildLimitOrderPayload(params: CreateLimitOrderParams): JsonObject {
  const payload: JsonObject = {
    symbol: params.symbol,
    price: params.price,
    amount: params.amount,
    side: params.side,
    tif: params.tif ?? TimeInForce.Gtc,
    reduce_only: params.reduceOnly ?? false,
    client_order_id: params.clientOrderId ?? newClientOrderId(),
  };
  if (params.takeProfit !== undefined) {
    payload.take_profit = buildStopConfig(params.takeProfit);
  }
  if (params.stopLoss !== undefined) {
    payload.stop_loss = buildStopConfig(params.stopLoss);
  }
  if (params.builderCode !== undefined) {
    payload.builder_code = params.builderCode;
  }
  return payload;
}

export function buildMarketOrderPayload(params: CreateMarketOrderParams): JsonObject {
  const payload: JsonObject = {
    symbol: params.symbol,
    amount: params.amount,
    side: params.side,
    slippage_percent: params.slippagePercent,
    reduce_only: params.reduceOnly ?? false,
    client_order_id: params.clientOrderId ?? newClientOrderId(),
  };
  if (params.takeProfit !== undefined) {
    payload.take_profit = buildStopConfig(params.takeProfit);
  }
  if (params.stopLoss !== undefined) {
    payload.stop_loss = buildStopConfig(params.stopLoss);
  }
  if (params.builderCode !== undefined) {
    payload.builder_code = params.builderCode;
  }
  return payload;
}

function buildOrderRef(symbol: string, orderId?: number, clientOrderId?: string): JsonObject {
  const payload: JsonObject = { symbol };
  if (orderId !== undefined) {
    payload.order_id = orderId;
  } else if (clientOrderId !== undefined) {
    payload.client_order_id = clientOrderId;
  } else {
    throw new Error('Either orderId or clientOrderId is required');
  }
  return payload;
}

export function buildCancelOrderPayload(params: CancelOrderParams): JsonObject {
  return buildOrderRef(params.symbol, params.orderId, params.clientOrderId);
}

export function buildCancelStopOrderPayload(params: CancelStopOrderParams): JsonObject {
  return buildOrderRef(params.symbol, params.orderId, params.clientOrderId);
}

export function buildCancelAllOrdersPayload(params: CancelAllOrdersParams): JsonObject {
  const payload: JsonObject = {
    all_symbols: params.allSymbols,
    exclude_reduce_only: params.excludeReduceOnly,
  };
  if (params.symbol !== undefined) {
    payload.symbol = params.symbol;
  }
  return payload;
}

export function buildEditOrderPayload(params: EditOrderParams): JsonObject {
  const payload: JsonObject = {
    symbol: params.symbol,
    price: params.price,
    amount: params.amount,
  };
  if (params.orderId !== undefined) {
    payload.order_id = params.orderId;
  } else if (params.clientOrderId !== undefined) {
    payload.client_order_id = params.clientOrderId;
  } else {
    throw new Error('Either orderId or clientOrderId is required');
  }
  return payload;
}

export function buildPositionTpslPayload(params: CreatePositionTpslParams): JsonObject {
  const payload: JsonObject = { symbol: params.symbol, side: params.side };
  if (params.takeProfit !== undefined) {
    payload.take_profit = buildStopConfig(params.takeProfit);
  }
  if (params.stopLoss !== undefined) {
    payload.stop_loss = buildStopConfig(params.stopLoss);
  }
  return payload;
}

export function buildStopOrderPayload(params: CreateStopOrderParams): JsonObject {
  const payload: JsonObject = {
    symbol: params.symbol,
    side: params.side,
    reduce_only: params.reduceOnly,
    stop_order: buildStopOrderConfig(params.stopOrder),
  };
  if (params.builderCode !== undefined) {
    payload.builder_code = params.builderCode;
  }
  return payload;
}

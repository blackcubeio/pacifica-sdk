import { OrderSide } from '../common/types';

export { OrderSide };

export enum CandleInterval {
  OneMinute = '1m',
  ThreeMinutes = '3m',
  FiveMinutes = '5m',
  FifteenMinutes = '15m',
  ThirtyMinutes = '30m',
  OneHour = '1h',
  TwoHours = '2h',
  FourHours = '4h',
  EightHours = '8h',
  TwelveHours = '12h',
  OneDay = '1d',
}

export enum TradeEventType {
  FulfillTaker = 'fulfill_taker',
  FulfillMaker = 'fulfill_maker',
}

export enum TradeSide {
  OpenLong = 'open_long',
  OpenShort = 'open_short',
  CloseLong = 'close_long',
  CloseShort = 'close_short',
}

export enum TradeCause {
  Normal = 'normal',
  MarketLiquidation = 'market_liquidation',
  BackstopLiquidation = 'backstop_liquidation',
  Settlement = 'settlement',
}

export interface Paginated<TItem> {
  items: TItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Market {
  symbol: string;
  tickSize: string;
  minTick: string;
  maxTick: string;
  lotSize: string;
  maxLeverage: number;
  isolatedOnly: boolean;
  minOrderSize: string;
  maxOrderSize: string;
  fundingRate: string;
  nextFundingRate: string;
  createdAt: number;
}

export interface Price {
  symbol: string;
  mark: string;
  mid: string;
  oracle: string;
  funding: string;
  nextFunding: string;
  openInterest: string;
  volume24h: string;
  yesterdayPrice: string;
  timestamp: number;
}

export interface FeeLevel {
  level: number;
  makerFeeRate: string;
  takerFeeRate: string;
}

export interface Candle {
  symbol: string;
  interval: string;
  openTime: number;
  closeTime: number;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
  tradeCount: number;
}

export interface OrderbookLevel {
  price: string;
  amount: string;
  orderCount: number;
}

export interface Orderbook {
  symbol: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  timestamp: number;
}

export interface Trade {
  eventType: TradeEventType;
  price: string;
  amount: string;
  side: TradeSide;
  cause: TradeCause;
  createdAt: number;
}

export interface RecentTrades {
  trades: Trade[];
  lastOrderId: number;
}

export interface FundingPoint {
  oraclePrice: string;
  bidImpactPrice: string;
  askImpactPrice: string;
  fundingRate: string;
  nextFundingRate: string;
  createdAt: number;
}

export interface LoanPool {
  totalBorrowed: string;
  totalBorrowable: string;
  utilization: string;
  borrowRateApr: string;
  borrowRateApy: string;
  lendRateApr: string;
  lendRateApy: string;
  utilizationMax: string;
  autoLenderEntryThreshold: string;
  lastInterestAccrualAt: number | null;
  lastInterestPayoutAt: number | null;
  updatedAt: number;
}

export interface SpotAsset {
  symbol: string;
  tickSize: string;
  lotSize: string;
  active: boolean;
  collateralEnabled: boolean;
  ltvRatio: string;
  createdAt: number;
  updatedAt: number;
}

export interface BridgeAsset {
  symbol: string;
  minimumDeposit: string;
  withdrawalFee: string;
  bridgeProgram: string;
  mint: string | null;
  decimals: number;
}

export interface CandleQuery {
  symbol: string;
  interval: CandleInterval;
  startTime: number;
  endTime?: number;
}

export interface OrderbookQuery {
  symbol: string;
  aggLevel?: number;
}

export interface RecentTradesQuery {
  symbol: string;
}

export interface HistoricalFundingQuery {
  symbol: string;
  limit?: number;
  cursor?: string;
}

export interface SpotAssetsQuery {
  includeInactive?: boolean;
  collateralEnabledOnly?: boolean;
}

export interface BridgeParamsQuery {
  symbol: string;
}

export enum OrderType {
  Limit = 'limit',
  Market = 'market',
  StopLimit = 'stop_limit',
  StopMarket = 'stop_market',
  TakeProfitLimit = 'take_profit_limit',
  StopLossLimit = 'stop_loss_limit',
  TakeProfitMarket = 'take_profit_market',
  StopLossMarket = 'stop_loss_market',
}

export enum OrderStatus {
  Open = 'open',
  PartiallyFilled = 'partially_filled',
  Filled = 'filled',
  Cancelled = 'cancelled',
  Rejected = 'rejected',
}

export enum OrderCancelReason {
  Cancel = 'cancel',
  ForceCancel = 'force_cancel',
  Expired = 'expired',
  PostOnlyRejected = 'post_only_rejected',
  SelfTradePrevented = 'self_trade_prevented',
}

export enum OrderHistoryEventType {
  Make = 'make',
  StopCreated = 'stop_created',
  TwapCreated = 'twap_created',
  FulfillMarket = 'fulfill_market',
  FulfillLimit = 'fulfill_limit',
  Adjust = 'adjust',
  StopParentOrderFilled = 'stop_parent_order_filled',
  StopTriggered = 'stop_triggered',
  StopUpgrade = 'stop_upgrade',
  TwapTriggered = 'twap_triggered',
  Cancel = 'cancel',
  ForceCancel = 'force_cancel',
  Expired = 'expired',
  PostOnlyRejected = 'post_only_rejected',
  SelfTradePrevented = 'self_trade_prevented',
}

export enum BalanceEventType {
  Deposit = 'deposit',
  DepositRelease = 'deposit_release',
  Withdraw = 'withdraw',
  Trade = 'trade',
  MarketLiquidation = 'market_liquidation',
  BackstopLiquidation = 'backstop_liquidation',
  AdlLiquidation = 'adl_liquidation',
  SubaccountTransfer = 'subaccount_transfer',
  Funding = 'funding',
  Payout = 'payout',
}

export enum PortfolioTimeRange {
  OneDay = '1d',
  SevenDays = '7d',
  FourteenDays = '14d',
  ThirtyDays = '30d',
  All = 'all',
}

export interface AccountSpotBalance {
  symbol: string;
  amount: string;
  availableToWithdraw: string;
  pendingBalance: string;
  dailyWithdrawAmountUsd: string;
  effectiveDailyDepositLimitUsd: string;
  effectiveDailyWithdrawLimitUsd: string;
}

export interface AccountInfo {
  balance: string;
  feeLevel: number;
  makerFee: string;
  takerFee: string;
  accountEquity: string;
  availableToSpend: string;
  availableToWithdraw: string;
  pendingBalance: string;
  pendingInterest: string;
  spotCollateral: string;
  crossAccountEquity: string | null;
  spotMarketValue: string;
  totalMarginUsed: string;
  crossMmr: string;
  positionsCount: number;
  ordersCount: number;
  stopOrdersCount: number;
  updatedAt: number;
  spotBalances: AccountSpotBalance[];
}

export interface MarginSetting {
  symbol: string;
  isolated: boolean;
  leverage: number;
  createdAt: number;
  updatedAt: number;
}

export interface SpotSetting {
  symbol: string;
  unifiedMarginExcluded: boolean;
}

export interface AccountSettings {
  autoLendDisabled: boolean | null;
  marginSettings: MarginSetting[];
  spotSettings: SpotSetting[];
}

export interface Position {
  symbol: string;
  side: OrderSide;
  amount: string;
  entryPrice: string;
  margin: string;
  funding: string;
  isolated: boolean;
  liquidationPrice: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface LoanSpotBalance {
  symbol: string;
  amount: string;
  ltvRatio: string;
  marketValue: string;
  collateralValue: string;
}

export interface AccountLoan {
  borrowed: string;
  pendingInterest: string;
  collateralUtilization: string;
  totalInterestEarned: string;
  totalInterestPaid: string;
  spotBalances: LoanSpotBalance[];
  updatedAt: number;
}

export interface TradeHistoryEntry {
  historyId: number;
  orderId: number;
  clientOrderId: string | null;
  symbol: string;
  amount: string;
  price: string;
  entryPrice: string;
  fee: string;
  pnl: string;
  eventType: TradeEventType;
  side: TradeSide;
  cause: TradeCause;
  createdAt: number;
}

export interface AccountFundingEntry {
  historyId: number;
  symbol: string;
  side: OrderSide;
  amount: string;
  payout: string;
  rate: string;
  createdAt: number;
}

export interface PortfolioPoint {
  accountEquity: string;
  pnl: string;
  timestamp: number;
}

export interface BalanceHistoryEntry {
  amount: string;
  balance: string;
  pendingBalance: string;
  eventType: BalanceEventType;
  createdAt: number;
}

export interface SpotBalanceHistoryEntry {
  amount: string;
  balance: string;
  symbol: string;
  eventType: string;
  createdAt: number;
}

export interface SpotDepositEntry {
  symbol: string;
  amount: string;
  transactionId: string;
  createdAt: number;
}

export interface SpotWithdrawalEntry {
  symbol: string;
  amount: string;
  batchNonce: number;
  transactionId: string;
  createdAt: number;
}

export interface PendingSpotWithdrawal {
  symbol: string;
  amount: string;
  amountRequested: string;
  feeAmount: string;
  batchNonce: number;
  createdAt: number;
}

export interface Order {
  orderId: number;
  clientOrderId: string | null;
  symbol: string;
  side: OrderSide;
  price: string;
  initialAmount: string;
  filledAmount: string;
  cancelledAmount: string;
  stopPrice: string | null;
  orderType: OrderType;
  stopParentOrderId: number | null;
  reduceOnly: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface OrderHistoryEntry {
  orderId: number;
  clientOrderId: string | null;
  symbol: string;
  side: OrderSide;
  initialPrice: string;
  averageFilledPrice: string;
  amount: string;
  filledAmount: string;
  orderStatus: OrderStatus;
  orderType: OrderType;
  stopPrice: string | null;
  stopParentOrderId: number | null;
  reduceOnly: boolean;
  reason: OrderCancelReason | null;
  createdAt: number;
  updatedAt: number;
}

export interface OrderHistoryByIdEntry {
  historyId: number;
  orderId: number;
  clientOrderId: string | null;
  symbol: string;
  side: OrderSide;
  price: string;
  initialAmount: string;
  filledAmount: string;
  cancelledAmount: string;
  eventType: OrderHistoryEventType;
  orderType: OrderType;
  orderStatus: OrderStatus;
  stopPrice: string | null;
  stopParentOrderId: number | null;
  reduceOnly: boolean;
  createdAt: number;
}

export interface AccountQuery {
  account: string;
}

export interface TradeHistoryQuery {
  account: string;
  symbol?: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
  cursor?: string;
}

export interface FundingHistoryQuery {
  account: string;
  limit?: number;
  cursor?: string;
}

export interface PortfolioQuery {
  account: string;
  timeRange: PortfolioTimeRange;
  startTime?: number;
  endTime?: number;
  limit?: number;
}

export interface BalanceHistoryQuery {
  account: string;
  limit?: number;
  cursor?: string;
}

export interface SpotBalanceHistoryQuery {
  account: string;
  symbol?: string;
  limit?: number;
  cursor?: string;
}

export interface SpotHistoryQuery {
  account: string;
  limit?: number;
  cursor?: string;
}

export interface OrderHistoryQuery {
  account: string;
  limit?: number;
  cursor?: string;
}

export interface OrderHistoryByIdQuery {
  orderId: number;
}

export interface TwapHistoryQuery {
  account: string;
  limit?: number;
  cursor?: string;
}

export interface TwapHistoryByIdQuery {
  orderId: number;
}

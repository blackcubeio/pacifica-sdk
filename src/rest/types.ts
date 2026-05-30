import { OrderSide, TimeInForce, TriggerPriceType } from '../common/types';
import type { Signer } from '../common/types';

export { OrderSide, TimeInForce, TriggerPriceType };
export type { Signer };
// Formats unifiés (vivent dans common/types) ; ré-export pour compat des imports.
export type {
  Balance,
  Candle,
  FundingRate,
  Order,
  Position,
  Price,
  Trade,
  UserTrade,
} from '../common/types';

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

export interface FeeLevel {
  level: number;
  makerFeeRate: string;
  takerFeeRate: string;
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

export interface StopConfig {
  stopPrice: string;
  limitPrice?: string;
  clientOrderId?: string;
  triggerPriceType?: TriggerPriceType;
}

export interface StopOrderConfig {
  stopPrice: string;
  limitPrice?: string;
  clientOrderId?: string;
  triggerPriceType?: TriggerPriceType;
  amount?: string;
}

export interface CreateLimitOrderParams {
  symbol: string;
  price: string;
  amount: string;
  side: OrderSide;
  tif?: TimeInForce;
  reduceOnly?: boolean;
  clientOrderId?: string;
  takeProfit?: StopConfig;
  stopLoss?: StopConfig;
  builderCode?: string;
}

export interface CreateMarketOrderParams {
  symbol: string;
  amount: string;
  side: OrderSide;
  slippagePercent: string;
  reduceOnly?: boolean;
  clientOrderId?: string;
  takeProfit?: StopConfig;
  stopLoss?: StopConfig;
  builderCode?: string;
}

export interface CancelOrderParams {
  symbol: string;
  orderId?: number;
  clientOrderId?: string;
}

export interface CancelAllOrdersParams {
  allSymbols: boolean;
  excludeReduceOnly: boolean;
  symbol?: string;
}

export interface EditOrderParams {
  symbol: string;
  price: string;
  amount: string;
  orderId?: number;
  clientOrderId?: string;
}

export interface CreateStopOrderParams {
  symbol: string;
  side: OrderSide;
  reduceOnly: boolean;
  stopOrder: StopOrderConfig;
  builderCode?: string;
}

export interface CancelStopOrderParams {
  symbol: string;
  orderId?: number;
  clientOrderId?: string;
}

export interface CreateOrderResult {
  orderId: number;
}

export interface CancelAllResult {
  cancelledCount: number;
}

export enum BatchActionType {
  Create = 'Create',
  CreateMarket = 'CreateMarket',
  Cancel = 'Cancel',
  Edit = 'Edit',
  SetPositionTpsl = 'SetPositionTpsl',
  CancelStopOrder = 'CancelStopOrder',
}

export type BatchAction =
  | { type: BatchActionType.Create; params: CreateLimitOrderParams }
  | { type: BatchActionType.CreateMarket; params: CreateMarketOrderParams }
  | { type: BatchActionType.Cancel; params: CancelOrderParams }
  | { type: BatchActionType.Edit; params: EditOrderParams }
  | { type: BatchActionType.SetPositionTpsl; params: CreatePositionTpslParams }
  | { type: BatchActionType.CancelStopOrder; params: CancelStopOrderParams };

export interface BatchActionResult {
  success: boolean;
  orderId?: number;
  error: string | null;
}

export interface BatchResult {
  results: BatchActionResult[];
}


export interface UpdateMarginModeParams {
  symbol: string;
  isIsolated: boolean;
}

export interface AddIsolatedMarginParams {
  symbol: string;
  amount: string;
}

export interface ToggleAutoLendingParams {
  disabled: boolean | null;
}

export interface UpdateSpotSettingsParams {
  symbol: string;
  unifiedMarginExcluded: boolean;
}

export interface WithdrawParams {
  amount: string;
}

export interface WithdrawSpotAssetParams {
  symbol: string;
  amount: string;
  idempotencyKey?: string;
}

export interface WithdrawSpotResult {
  symbol: string;
  batchNonce: number;
  requestedAmount: string;
  feeAmount: string;
}

export interface Subaccount {
  address: string;
  balance: string;
  feeLevel: number;
  feeMode: string;
  createdAt: number;
}

export interface CreateSubaccountParams {
  main: Signer;
  sub: Signer;
}

export interface TransferSubaccountFundParams {
  toAccount: string;
  amount: string;
}

export interface SubaccountSpotTransferParams {
  toAccount: string;
  symbol: string;
  amount: string;
  idempotencyKey?: string;
}

export interface ApiConfigKeyResult {
  apiKey: string;
}

export interface RevokeApiConfigKeyParams {
  apiKey: string;
}

export interface BindAgentWalletParams {
  agentWallet: string;
}

export interface RevokeAgentWalletParams {
  agentWallet: string;
}

export interface ListAgentIpWhitelistParams {
  agentWallet: string;
}

export interface AgentWhitelistedIpParams {
  agentWallet: string;
  ipAddress: string;
}

export interface SetAgentIpWhitelistEnabledParams {
  agentWallet: string;
  enabled: boolean;
}

export interface CreatePositionTpslParams {
  symbol: string;
  side: OrderSide;
  takeProfit?: StopConfig;
  stopLoss?: StopConfig;
}

export interface VaultConfig {
  depositCap: string | null;
  managerProfitShare: string | null;
  managerLossShare: string | null;
  depositMinDurationMs: number | null;
  managerMinBalancePortion: string | null;
  managerLiquidationBalancePortion: string | null;
  withdrawWindowS: number | null;
  withdrawDurationS: number | null;
}

export interface Vault {
  address: string;
  creator: string;
  manager: string | null;
  nickname: string | null;
  lpShares: string;
  managerShares: string;
  lpBalance: string;
  managerBalance: string;
  lastCheckedEquity: string;
  highWatermark: string;
  createdAt: number;
  referrer: string | null;
  userShare: string | null;
  config: VaultConfig | null;
}

export interface CreateVaultParams {
  nickname: string;
  initialDeposit: string;
  depositCap: string;
  depositMinDurationMs: number;
  withdrawWindowS: number;
  withdrawDurationS: number;
  managerProfitShare: string;
  managerMinBalancePortion: string;
  managerLiquidationBalancePortion: string;
  referralCode?: string;
}

export interface CreateVaultResult {
  lakeAddress: string;
}

export interface VaultDepositParams {
  lake: string;
  amount: string;
  idempotencyKey?: string;
}

export interface VaultWithdrawParams {
  lake: string;
  shares: string;
  idempotencyKey?: string;
}

export interface ClaimReferralCodeParams {
  lake: string;
  code: string;
}

export interface ClaimManagerParams {
  lake: string;
  depositAmount: string;
}

export interface UpdateDepositCapParams {
  lake: string;
  depositCap: string;
}

export interface VaultSymbolsParams {
  lake: string;
  symbols: string[];
}

export interface AddMaxLeverageParams {
  lake: string;
  symbols: string[];
  maxLeverage: string;
}

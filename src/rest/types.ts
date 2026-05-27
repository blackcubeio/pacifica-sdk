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

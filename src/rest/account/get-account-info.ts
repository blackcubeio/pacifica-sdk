import { httpGet } from '../client';
import type { AccountInfo, AccountQuery, AccountSpotBalance } from '../types';

interface SpotBalanceWire {
  symbol: string;
  amount: string;
  available_to_withdraw: string;
  pending_balance: string;
  daily_withdraw_amount_usd: string;
  effective_daily_deposit_limit_usd: string;
  effective_daily_withdraw_limit_usd: string;
}

interface AccountInfoWire {
  balance: string;
  fee_level: number;
  maker_fee: string;
  taker_fee: string;
  account_equity: string;
  available_to_spend: string;
  available_to_withdraw: string;
  pending_balance: string;
  pending_interest: string;
  spot_collateral: string;
  cross_account_equity: string | null;
  spot_market_value: string;
  total_margin_used: string;
  cross_mmr: string;
  positions_count: number;
  orders_count: number;
  stop_orders_count: number;
  updated_at: number;
  spot_balances: SpotBalanceWire[];
}

export function getAccountInfo(query: AccountQuery): Promise<AccountInfo> {
  return httpGet<AccountInfoWire>('/account', { account: query.account }).then((envelope) =>
    mapAccountInfo(envelope.data),
  );
}

function mapAccountInfo(wire: AccountInfoWire): AccountInfo {
  return {
    balance: wire.balance,
    feeLevel: wire.fee_level,
    makerFee: wire.maker_fee,
    takerFee: wire.taker_fee,
    accountEquity: wire.account_equity,
    availableToSpend: wire.available_to_spend,
    availableToWithdraw: wire.available_to_withdraw,
    pendingBalance: wire.pending_balance,
    pendingInterest: wire.pending_interest,
    spotCollateral: wire.spot_collateral,
    crossAccountEquity: wire.cross_account_equity,
    spotMarketValue: wire.spot_market_value,
    totalMarginUsed: wire.total_margin_used,
    crossMmr: wire.cross_mmr,
    positionsCount: wire.positions_count,
    ordersCount: wire.orders_count,
    stopOrdersCount: wire.stop_orders_count,
    updatedAt: wire.updated_at,
    spotBalances: wire.spot_balances.map((balance) => mapSpotBalance(balance)),
  };
}

function mapSpotBalance(wire: SpotBalanceWire): AccountSpotBalance {
  return {
    symbol: wire.symbol,
    amount: wire.amount,
    availableToWithdraw: wire.available_to_withdraw,
    pendingBalance: wire.pending_balance,
    dailyWithdrawAmountUsd: wire.daily_withdraw_amount_usd,
    effectiveDailyDepositLimitUsd: wire.effective_daily_deposit_limit_usd,
    effectiveDailyWithdrawLimitUsd: wire.effective_daily_withdraw_limit_usd,
  };
}

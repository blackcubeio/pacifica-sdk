import type { AccountLoan, AccountQuery, LoanSpotBalance } from '../../common/native';
import { httpGet } from '../client';

interface LoanSpotBalanceWire {
  symbol: string;
  amount: string;
  ltv_ratio: string;
  market_value: string;
  collateral_value: string;
}

interface AccountLoanWire {
  borrowed: string;
  pending_interest: string;
  collateral_utilization: string;
  total_interest_earned: string;
  total_interest_paid: string;
  spot_balances: LoanSpotBalanceWire[];
  updated_at: number;
}

export function getAccountLoan(query: AccountQuery, label?: string): Promise<AccountLoan> {
  return httpGet<AccountLoanWire>('/account/loan', { account: query.account }, label).then(
    (envelope) => mapAccountLoan(envelope.data),
  );
}

function mapAccountLoan(wire: AccountLoanWire): AccountLoan {
  return {
    borrowed: wire.borrowed,
    pendingInterest: wire.pending_interest,
    collateralUtilization: wire.collateral_utilization,
    totalInterestEarned: wire.total_interest_earned,
    totalInterestPaid: wire.total_interest_paid,
    spotBalances: wire.spot_balances.map((balance) => mapLoanSpotBalance(balance)),
    updatedAt: wire.updated_at,
  };
}

function mapLoanSpotBalance(wire: LoanSpotBalanceWire): LoanSpotBalance {
  return {
    symbol: wire.symbol,
    amount: wire.amount,
    ltvRatio: wire.ltv_ratio,
    marketValue: wire.market_value,
    collateralValue: wire.collateral_value,
  };
}

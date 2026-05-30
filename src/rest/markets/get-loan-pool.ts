import type { PacificaClient } from '../../common/config';
import type { LoanPool } from '../../common/native';
import { httpGet } from '../client';

interface LoanPoolWire {
  total_borrowed: string;
  total_borrowable: string;
  utilization: string;
  borrow_rate_apr: string;
  borrow_rate_apy: string;
  lend_rate_apr: string;
  lend_rate_apy: string;
  utilization_max: string;
  auto_lender_entry_threshold: string;
  last_interest_accrual_at: number | null;
  last_interest_payout_at: number | null;
  updated_at: number;
}

export function getLoanPool(client: PacificaClient, label?: string): Promise<LoanPool> {
  return httpGet<LoanPoolWire>(client, '/loan_pool', undefined, label).then((envelope) =>
    mapLoanPool(envelope.data),
  );
}

function mapLoanPool(wire: LoanPoolWire): LoanPool {
  return {
    totalBorrowed: wire.total_borrowed,
    totalBorrowable: wire.total_borrowable,
    utilization: wire.utilization,
    borrowRateApr: wire.borrow_rate_apr,
    borrowRateApy: wire.borrow_rate_apy,
    lendRateApr: wire.lend_rate_apr,
    lendRateApy: wire.lend_rate_apy,
    utilizationMax: wire.utilization_max,
    autoLenderEntryThreshold: wire.auto_lender_entry_threshold,
    lastInterestAccrualAt: wire.last_interest_accrual_at,
    lastInterestPayoutAt: wire.last_interest_payout_at,
    updatedAt: wire.updated_at,
  };
}

import { httpGet } from '../client';
import type { Vault, VaultConfig } from '../types';

interface VaultConfigWire {
  deposit_cap: string;
  manager_profit_share: string;
  manager_loss_share?: string | null;
  deposit_min_duration_ms: number;
  manager_min_balance_portion: string;
  manager_liquidation_balance_portion: string;
  withdraw_window_s: number;
  withdraw_duration_s: number;
}

interface VaultWire {
  address: string;
  creator: string;
  manager: string | null;
  nickname: string;
  lp_shares: string;
  manager_shares: string;
  lp_balance: string;
  manager_balance: string;
  last_checked_equity: string;
  high_watermark: string;
  created_at: number;
  referrer?: string | null;
  user_share?: string | null;
  config?: VaultConfigWire | null;
}

export function getVaults(): Promise<Vault[]> {
  return httpGet<{ lakes: VaultWire[] }>('/lake/list').then((envelope) =>
    envelope.data.lakes.map((vault) => mapVault(vault)),
  );
}

function mapVault(wire: VaultWire): Vault {
  return {
    address: wire.address,
    creator: wire.creator,
    manager: wire.manager,
    nickname: wire.nickname,
    lpShares: wire.lp_shares,
    managerShares: wire.manager_shares,
    lpBalance: wire.lp_balance,
    managerBalance: wire.manager_balance,
    lastCheckedEquity: wire.last_checked_equity,
    highWatermark: wire.high_watermark,
    createdAt: wire.created_at,
    referrer: wire.referrer ?? null,
    userShare: wire.user_share ?? null,
    config: wire.config === undefined || wire.config === null ? null : mapConfig(wire.config),
  };
}

function mapConfig(wire: VaultConfigWire): VaultConfig {
  return {
    depositCap: wire.deposit_cap,
    managerProfitShare: wire.manager_profit_share,
    managerLossShare: wire.manager_loss_share ?? null,
    depositMinDurationMs: wire.deposit_min_duration_ms,
    managerMinBalancePortion: wire.manager_min_balance_portion,
    managerLiquidationBalancePortion: wire.manager_liquidation_balance_portion,
    withdrawWindowS: wire.withdraw_window_s,
    withdrawDurationS: wire.withdraw_duration_s,
  };
}

import { httpGet } from '../client';
import type { AccountQuery, AccountSettings, MarginSetting, SpotSetting } from '../types';

interface MarginSettingWire {
  symbol: string;
  isolated: boolean;
  leverage: number;
  created_at: number;
  updated_at: number;
}

interface SpotSettingWire {
  symbol: string;
  unified_margin_excluded: boolean;
}

interface AccountSettingsWire {
  auto_lend_disabled: boolean | null;
  margin_settings?: MarginSettingWire[];
  spot_settings?: SpotSettingWire[];
}

export function getAccountSettings(query: AccountQuery): Promise<AccountSettings> {
  return httpGet<AccountSettingsWire>('/account/settings', { account: query.account }).then(
    (envelope) => mapAccountSettings(envelope.data),
  );
}

function mapAccountSettings(wire: AccountSettingsWire): AccountSettings {
  const marginSettings = wire.margin_settings ?? [];
  const spotSettings = wire.spot_settings ?? [];
  return {
    autoLendDisabled: wire.auto_lend_disabled,
    marginSettings: marginSettings.map((setting) => mapMarginSetting(setting)),
    spotSettings: spotSettings.map((setting) => mapSpotSetting(setting)),
  };
}

function mapMarginSetting(wire: MarginSettingWire): MarginSetting {
  return {
    symbol: wire.symbol,
    isolated: wire.isolated,
    leverage: wire.leverage,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}

function mapSpotSetting(wire: SpotSettingWire): SpotSetting {
  return {
    symbol: wire.symbol,
    unifiedMarginExcluded: wire.unified_margin_excluded,
  };
}

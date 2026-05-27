import { httpGet } from '../client';
import type { SpotAsset, SpotAssetsQuery } from '../types';

interface SpotAssetWire {
  symbol: string;
  tick_size: string;
  lot_size: string;
  active: boolean;
  collateral_enabled: boolean;
  ltv_ratio: string;
  created_at: number;
  updated_at: number;
}

export function getSpotAssets(query: SpotAssetsQuery = {}): Promise<SpotAsset[]> {
  return httpGet<SpotAssetWire[]>('/spot_assets', {
    include_inactive: query.includeInactive,
    collateral_enabled_only: query.collateralEnabledOnly,
  }).then((envelope) => envelope.data.map((asset) => mapSpotAsset(asset)));
}

function mapSpotAsset(wire: SpotAssetWire): SpotAsset {
  return {
    symbol: wire.symbol,
    tickSize: wire.tick_size,
    lotSize: wire.lot_size,
    active: wire.active,
    collateralEnabled: wire.collateral_enabled,
    ltvRatio: wire.ltv_ratio,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}

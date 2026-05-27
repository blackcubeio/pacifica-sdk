import { httpGet } from '../client';
import type { BridgeAsset } from '../types';

interface BridgeAssetWire {
  symbol: string;
  minimum_deposit: string;
  withdrawal_fee: string;
  bridge_program: string;
  mint: string | null;
  decimals: number;
}

export function getBridgeInfo(): Promise<BridgeAsset[]> {
  return httpGet<BridgeAssetWire[]>('/spot_assets/bridge/info').then((envelope) =>
    envelope.data.map((asset) => mapBridgeAsset(asset)),
  );
}

function mapBridgeAsset(wire: BridgeAssetWire): BridgeAsset {
  return {
    symbol: wire.symbol,
    minimumDeposit: wire.minimum_deposit,
    withdrawalFee: wire.withdrawal_fee,
    bridgeProgram: wire.bridge_program,
    mint: wire.mint,
    decimals: wire.decimals,
  };
}

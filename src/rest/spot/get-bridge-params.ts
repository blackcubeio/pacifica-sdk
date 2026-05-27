import { httpGet } from '../client';
import type { BridgeAsset, BridgeParamsQuery } from '../types';

interface BridgeAssetWire {
  symbol: string;
  minimum_deposit: string;
  withdrawal_fee: string;
  bridge_program: string;
  mint: string | null;
  decimals: number;
}

export function getBridgeParams(query: BridgeParamsQuery): Promise<BridgeAsset> {
  return httpGet<BridgeAssetWire>(`/spot_assets/bridge/parameters/${query.symbol}`).then(
    (envelope) => mapBridgeAsset(envelope.data),
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

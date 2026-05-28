import { httpGet } from '../client';
import type { FeeLevel } from '../types';

interface FeeLevelWire {
  level: number;
  maker_fee_rate: string;
  taker_fee_rate: string;
}

export function getFeeLevels(label?: string): Promise<FeeLevel[]> {
  return httpGet<FeeLevelWire[]>('/info/fees', undefined, label).then((envelope) =>
    envelope.data.map((feeLevel) => mapFeeLevel(feeLevel)),
  );
}

function mapFeeLevel(wire: FeeLevelWire): FeeLevel {
  return {
    level: wire.level,
    makerFeeRate: wire.maker_fee_rate,
    takerFeeRate: wire.taker_fee_rate,
  };
}

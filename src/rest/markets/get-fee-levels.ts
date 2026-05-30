import type { PacificaClient } from '../../common/config';
import type { FeeLevel } from '../../common/native';
import { httpGet } from '../client';

interface FeeLevelWire {
  level: number;
  maker_fee_rate: string;
  taker_fee_rate: string;
}

export function getFeeLevels(client: PacificaClient, label?: string): Promise<FeeLevel[]> {
  return httpGet<FeeLevelWire[]>(client, '/info/fees', undefined, label).then((envelope) =>
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

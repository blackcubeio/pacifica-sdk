import type { FundingRate } from '../../common/types';

/** Point de funding natif Pacifica (`/funding_rate/history`) — `name` vient de la requête. */
export interface FundingRateNative {
  oracle_price: string;
  bid_impact_price: string;
  ask_impact_price: string;
  funding_rate: string;
  next_funding_rate: string;
  created_at: number;
}

/**
 * Convertisseur **bijectif** funding : `toCommon(native) → FundingRate` / inverse.
 * `name` (absent du wire) porté par le convertisseur ; oracle/impact/next → `xtras`.
 */
export class FundingConverter {
  constructor(private readonly name: string) {}

  toCommon(wire: FundingRateNative): FundingRate {
    return {
      name: this.name,
      fundingRate: wire.funding_rate,
      time: wire.created_at,
      xtras: {
        oracle_price: wire.oracle_price,
        bid_impact_price: wire.bid_impact_price,
        ask_impact_price: wire.ask_impact_price,
        next_funding_rate: wire.next_funding_rate,
      },
    };
  }

  toNative(funding: FundingRate): FundingRateNative {
    const xtras = funding.xtras ?? {};
    return {
      oracle_price: xtras.oracle_price as string,
      bid_impact_price: xtras.bid_impact_price as string,
      ask_impact_price: xtras.ask_impact_price as string,
      funding_rate: funding.fundingRate,
      next_funding_rate: xtras.next_funding_rate as string,
      created_at: funding.time,
    };
  }
}

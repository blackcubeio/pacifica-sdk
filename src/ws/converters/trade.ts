import type { Side, Trade } from '../../common/types';
import { TradeSide } from '../../rest/types';

/**
 * Payload WS `trades` Pacifica — array d'éléments `{h, s, a, p, d, tc, t, li, it}`.
 * `d` = direction du taker (`open_long`/`close_short` = achat ; `open_short`/`close_long` = vente).
 */
export interface TradeWsNative {
  h: number;
  s: string;
  a: string;
  p: string;
  d: string;
  tc: string;
  t: number;
  li: number;
  it: number;
}

/** Direction taker (agresseur) depuis `d` ; `null` si valeur inattendue. */
function takerSide(d: string): Side | null {
  if (d === TradeSide.OpenLong || d === TradeSide.CloseShort) {
    return 'buy';
  }
  if (d === TradeSide.OpenShort || d === TradeSide.CloseLong) {
    return 'sell';
  }
  return null;
}

/**
 * Convertisseur WS **unidirectionnel** trade : `toCommon(payload) → Trade`.
 * `side` = taker (depuis `d`) ; `maker = null` (flux public, pas de rôle de fill). `d` reste
 * dans `xtras` (open/close non récupérable depuis `side` seul) — rien jeté.
 */
export class TradeWsConverter {
  toCommon(wire: TradeWsNative): Trade {
    const { p, a, t, h, ...rest } = wire;
    return {
      price: p,
      size: a,
      side: takerSide(wire.d),
      maker: null,
      time: t,
      id: h,
      xtras: rest as Record<string, unknown>,
    };
  }
}

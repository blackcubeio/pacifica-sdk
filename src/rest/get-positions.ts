import type { Position } from '../common/types';
import { httpGet } from './client';
import { PositionConverter, type PositionNative } from '../converters/position';

/** Paramètres unifiés (mêmes champs sur les 3 SDK). */
export interface GetPositionsParams {
  /** Adresse du compte (clé publique), **requise** côté Pacifica. */
  user: string;
  /** Filtre optionnel sur une paire (appliqué côté client). */
  name?: string;
}

/** Positions ouvertes au **format unifié** `Position` (Pacifica `/positions`). */
export function getPositions(params: GetPositionsParams, label?: string): Promise<Position[]> {
  const converter = new PositionConverter();
  return httpGet<PositionNative[]>('/positions', { account: params.user }, label).then(
    (envelope) => {
      const positions = envelope.data.map((position) => converter.toCommon(position));
      return params.name === undefined
        ? positions
        : positions.filter((position) => position.name === params.name);
    },
  );
}

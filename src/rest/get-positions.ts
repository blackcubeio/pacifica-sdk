import type { PacificaClient } from '../common/config';
import type { GetPositionsParams } from '../common/types';
import type { Position } from '../common/types';
import { PositionConverter, type PositionNative } from '../converters/position';
import { httpGet } from './client';

/** Positions ouvertes au **format unifié** `Position` (Pacifica `/positions`). */
export function getPositions(
  client: PacificaClient,
  params: GetPositionsParams,
  label?: string,
): Promise<Position[]> {
  const converter = new PositionConverter();
  return httpGet<PositionNative[]>(client, '/positions', { account: params.user }, label).then(
    (envelope) => {
      const positions = envelope.data.map((position) => converter.toCommon(position));
      return params.name === undefined
        ? positions
        : positions.filter((position) => position.name === params.name);
    },
  );
}

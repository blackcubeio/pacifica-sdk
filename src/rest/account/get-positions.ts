import { httpGet } from '../client';
import type { AccountQuery, OrderSide, Position } from '../types';

interface PositionWire {
  symbol: string;
  side: OrderSide;
  amount: string;
  entry_price: string;
  margin: string;
  funding: string;
  isolated: boolean;
  liquidation_price: string | null;
  created_at: number;
  updated_at: number;
}

export function getPositions(query: AccountQuery, label?: string): Promise<Position[]> {
  return httpGet<PositionWire[]>('/positions', { account: query.account }, label).then((envelope) =>
    envelope.data.map((position) => mapPosition(position)),
  );
}

function mapPosition(wire: PositionWire): Position {
  return {
    symbol: wire.symbol,
    side: wire.side,
    amount: wire.amount,
    entryPrice: wire.entry_price,
    margin: wire.margin,
    funding: wire.funding,
    isolated: wire.isolated,
    liquidationPrice: wire.liquidation_price,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}

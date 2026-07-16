import { describe, expect, it } from 'vitest';
import { Pacifica } from '../src/dex/pacifica';

// Pacifica n'expose ni mark ni uPnl par position (`GET /positions`). La façade doit les DÉRIVER du mark public
// (`GET /info/prices`) : uPnl = |size| × (mark − entry) × (long ? +1 : −1). Vérifié avec un fetch mock (les deux
// endpoints), hors réseau. Cas ICP short : 47.3 × (2.18 − 2.1617) = +0.8656 (matche l'affichage exchange).
function mockDex(positions: unknown[], prices: unknown[]): Pacifica {
  const fetchMock = (async (url: string) => {
    const body = String(url).includes('/info/prices') ? { data: prices } : { data: positions };
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
  return new Pacifica(
    { acc: { publicKey: 'ACC', secretKey: 'seed', network: 'mainnet' } as never },
    { default: 'acc', fetch: fetchMock },
  );
}

const ICP_POSITION = {
  symbol: 'ICP',
  side: 'ask', // short
  amount: '47.3',
  entry_price: '2.18',
  margin: '20.4',
  funding: '0',
  liquidation_price: null,
  isolated: true,
  created_at: 0,
  updated_at: 0,
};
const ICP_PRICE = {
  symbol: 'ICP',
  mark: '2.1617',
  oracle: '2.16',
  mid: '2.1617',
  funding: '0',
  open_interest: '0',
  volume_24h: '0',
  yesterday_price: '2.2',
  timestamp: 0,
  next_funding: '0',
};

describe('Pacifica getPositions — uPnl/mark dérivés du prix public', () => {
  it('remplit markPrice + unrealizedPnl (short en profit) depuis le mark', async () => {
    const positions = await mockDex([ICP_POSITION], [ICP_PRICE]).perp().getPositions();
    const icp = positions[0];
    if (icp === undefined) {
      throw new Error('position ICP manquante');
    }
    expect(icp.markPrice).toBe('2.1617');
    // short : (mark − entry) × size × −1 = (2.1617 − 2.18) × 47.3 × −1 ≈ +0.8656
    expect(Number(icp.unrealizedPnl)).toBeCloseTo(0.8656, 3);
  });

  it('mark introuvable → markPrice/unrealizedPnl restent null (jamais un 0 déguisé)', async () => {
    const positions = await mockDex([ICP_POSITION], []).perp().getPositions();
    const icp = positions[0];
    if (icp === undefined) {
      throw new Error('position ICP manquante');
    }
    expect(icp.markPrice).toBeNull();
    expect(icp.unrealizedPnl).toBeNull();
  });
});

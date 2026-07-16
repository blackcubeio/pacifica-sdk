import { describe, expect, it } from 'vitest';
import { Pacifica } from '../src/dex/pacifica';
import { readEnv } from './helpers';

// VRAI test testnet (pas de mock) : pacifica n'expose ni mark ni uPnl par position → la façade les dérive du mark
// public (getPrices). On l'exerce sur une position RÉELLE : ouvrir un market → getPositions → asserter markPrice ET
// unrealizedPnl non-null → fermer (cleanup inconditionnel).
const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const ready = secretKey !== undefined && account !== undefined;

describe.skipIf(!ready)('Pacifica getPositions — markPrice + unrealizedPnl (testnet réel)', () => {
  const dex = new Pacifica(
    {
      [account as string]: {
        secretKey: secretKey as string,
        publicKey: account as string,
        network: 'testnet',
      },
    },
    { default: account as string },
  );

  it('open market → getPositions renseigne markPrice + unrealizedPnl → close', async () => {
    const perp = dex.perp();
    const symbol = 'BTC';
    const pair = (await perp.getPairs()).find((p) => p.name === symbol);
    const mark = Number((await perp.getPrices()).find((p) => p.name === symbol)?.mark);
    if (pair === undefined || Number.isFinite(mark) === false || mark <= 0) {
      throw new Error('pas de marché BTC testnet exploitable');
    }
    const step = String(pair.stepSize ?? '0.0001');
    const dec = (value: string): number => (value.split('.')[1] ?? '').length;
    const size = (Math.ceil(15 / mark / Number(step)) * Number(step)).toFixed(dec(step));

    const order = (side: 'buy' | 'sell', reduceOnly: boolean, sz: string) =>
      perp.place({
        name: symbol,
        side,
        type: 'market',
        size: sz,
        slippagePercent: '5',
        reduceOnly,
      });

    await order('buy', false, size);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const pos = (await perp.getPositions({ name: symbol })).find(
        (p) => p.name === symbol && Math.abs(Number(p.size)) > 0,
      );
      expect(pos).toBeDefined();
      expect(pos?.markPrice).not.toBeNull(); // dérivé du mark public
      expect(Number(pos?.markPrice)).toBeGreaterThan(0);
      expect(pos?.unrealizedPnl).not.toBeNull(); // dérivé (|size| × (mark − entry) × sens)
    } finally {
      const pos = (await perp.getPositions({ name: symbol })).find(
        (p) => p.name === symbol && Math.abs(Number(p.size)) > 0,
      );
      if (pos !== undefined) {
        await order('sell', true, String(Math.abs(Number(pos.size))));
      }
    }
  }, 30_000);
});

import { describe, expect, it } from 'vitest';
import { Pacifica } from '../src/dex/pacifica';
import { readEnv } from './helpers';

function envOf(name: string): string | undefined {
  try {
    return readEnv(name);
  } catch {
    return undefined;
  }
}

const SECRET = envOf('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const ACCOUNT = envOf('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const signed = SECRET !== undefined && ACCOUNT !== undefined;

describe('Façade Pacifica (réel)', () => {
  it('perp().getCandles — public, sans signer', async () => {
    const dex = new Pacifica();
    const candles = await dex.perp().getCandles({
      name: 'BTC',
      interval: '1m',
      startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    });
    expect(candles.length).toBeGreaterThan(0);
    expect(candles[0]?.kind).toBe('perp');
    expect(typeof candles[0]?.o).toBe('string');
  }, 20_000);

  it('perp().getPairs — tout est perp (Pacifica perp-only)', async () => {
    const dex = new Pacifica();
    const pairs = await dex.perp().getPairs();
    expect(pairs.length).toBeGreaterThan(0);
    expect(pairs.every((p) => p.kind === 'perp')).toBe(true);
  }, 20_000);

  it('deux instances Pacifica parallèles ne partagent aucun état global', async () => {
    const a = new Pacifica();
    const b = new Pacifica();
    const [pa, pb] = await Promise.all([a.perp().getPrices(), b.perp().getPrices()]);
    expect(pa.length).toBeGreaterThan(0);
    expect(pb.length).toBeGreaterThan(0);
    expect(pa[0]?.kind).toBe('perp');
    expect(pb[0]?.kind).toBe('perp');
  }, 25_000);

  it.skipIf(!signed)('helpers() — Solana (keyTypeOf / solanaAddress / signEd25519)', () => {
    const dex = new Pacifica();
    const h = dex.helpers();
    expect(h.keyTypeOf(SECRET as string)).toBe('solana');
    expect(h.solanaAddress(SECRET as string)).toBe(ACCOUNT);
    const sig = h.signEd25519('hello', SECRET as string);
    expect(typeof sig).toBe('string');
    expect(sig.length).toBeGreaterThan(0);
  });

  it.skipIf(!signed)(
    'account().getBalances — signé testnet',
    async () => {
      const dex = new Pacifica(
        {
          deskA: {
            secretKey: SECRET as string,
            publicKey: ACCOUNT as string,
            network: 'testnet',
          },
        },
        { default: 'deskA' },
      );
      const balances = await dex.account().getBalances();
      expect(Array.isArray(balances)).toBe(true);
    },
    20_000,
  );

  it('ws perp subscribeCandles — lazy connect / auto-unsubscribe', async () => {
    const dex = new Pacifica();
    const candle = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout ws candles')), 25_000);
      const off = dex.ws().subscribeCandles({ name: 'BTC', interval: '1m' }, (c) => {
        clearTimeout(timer);
        off();
        resolve(c as unknown as Record<string, unknown>);
      });
    });
    expect(candle.s).toBe('BTC');
    expect(candle.kind).toBe('perp');
  }, 30_000);
});

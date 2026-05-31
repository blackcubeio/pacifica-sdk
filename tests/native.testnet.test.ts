import { describe, expect, it } from 'vitest';
import { Pacifica } from '../src/dex/pacifica';
import { readEnv } from './helpers';

// Validation des capacités **signées** du namespace `native` sur **testnet réel** (politique : on
// valide toujours les capacités signées). On exerce des **lectures signées** non destructrices
// (`agents().getAgents()`, `apiKeys().getApiKeys()`) : elles prouvent le chemin d'authentification/
// signature des scopes natifs après l'alignement de nommage (get-préfixe + verbes nus).
const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const ready = secretKey !== undefined && account !== undefined;

describe.skipIf(!ready)('Pacifica native — capacités signées (testnet réel)', () => {
  const dex = new Pacifica(
    { [account as string]: { secretKey, publicKey: account, network: 'testnet' } },
    { default: account },
  );

  it('native.agents().getAgents() (lecture signée)', async () => {
    const agents = await dex.native.agents().getAgents();
    console.log('agents:', JSON.stringify(agents));
    expect(agents).toBeDefined();
  });

  it('native.apiKeys().getApiKeys() (lecture signée)', async () => {
    const keys = await dex.native.apiKeys().getApiKeys();
    console.log('apiKeys:', JSON.stringify(keys));
    expect(keys).toBeDefined();
  });

  it('native.vaults().getVaults() (lecture publique via la façade native)', async () => {
    const vaults = await dex.native.vaults().getVaults();
    expect(vaults).toBeDefined();
  });

  it('native.ws() : flux compte (account_info) reçu sur testnet', async () => {
    const msg = await new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('aucun message account_info en 8 s')), 8000);
      const off = dex.native.ws().subscribeAccountInfo((m) => {
        clearTimeout(timer);
        off();
        resolve(m);
      });
    });
    console.log('account_info reçu:', JSON.stringify(msg).slice(0, 120));
    expect(msg).toBeDefined();
  }, 15_000);

  it('native.ws() : trading WS réel (placeLimit ALO loin → cancelAll)', async () => {
    const ref = Number((await dex.perp().getPrices()).find((p) => p.name === 'BTC')?.mid ?? 0);
    expect(ref).toBeGreaterThan(0);
    // Entrées vocabulaire commun (name/side:'buy'/size/price) ; sortie WsAck typée.
    const ack = await dex.native.ws().placeLimit({
      name: 'BTC',
      side: 'buy',
      price: (ref * 0.5).toFixed(0),
      size: '0.0001',
      tif: 'alo',
    });
    console.log('ws placeLimit ack:', JSON.stringify(ack).slice(0, 120));
    expect(typeof ack.ok).toBe('boolean');
    await dex.native.ws().cancelAll();
  }, 30_000);
});

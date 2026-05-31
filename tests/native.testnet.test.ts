import { describe, expect, it } from 'vitest';
import { Pacifica } from '../src/dex/pacifica';
import { readEnv } from './helpers';

// Validation des capacités **signées** du namespace `native` sur **testnet réel** (politique : on
// valide toujours les capacités signées). On exerce des **lectures signées** non destructrices
// (`agents().list()`, `apiKeys().list()`) : elles prouvent le chemin d'authentification/signature
// des scopes natifs après l'alignement de nommage (verbes `list`/`approve`/`revoke`…).
const secretKey = readEnv('PACIFICA_SUB_ACCOUNT1_PRIVATE_KEY');
const account = readEnv('PACIFICA_SUB_ACCOUNT1_PUBLIC_KEY');
const ready = secretKey !== undefined && account !== undefined;

describe.skipIf(!ready)('Pacifica native — capacités signées (testnet réel)', () => {
  const dex = new Pacifica(
    { [account as string]: { secretKey, publicKey: account, network: 'testnet' } },
    { default: account },
  );

  it('native.agents().list() (lecture signée)', async () => {
    const agents = await dex.native.agents().list();
    console.log('agents:', JSON.stringify(agents));
    expect(agents).toBeDefined();
  });

  it('native.apiKeys().list() (lecture signée)', async () => {
    const keys = await dex.native.apiKeys().list();
    console.log('apiKeys:', JSON.stringify(keys));
    expect(keys).toBeDefined();
  });

  it('native.vaults().getVaults() (lecture publique via la façade native)', async () => {
    const vaults = await dex.native.vaults().getVaults();
    expect(vaults).toBeDefined();
  });
});

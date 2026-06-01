import { describe, expect, it } from 'vitest';
// Importe la surface publique RÉELLE (depuis src/index.ts) telle que la doc l'annonce :
// chaque `import { X } from '@blackcube/pacifica-sdk'` des pages doc/ doit résoudre ici.
import * as sdk from '../src';
import {
  DEVNET_CENTRAL_STATE,
  DEVNET_COLLATERAL_MINT,
  DEVNET_DEPOSIT_PROGRAM_ID,
  DEVNET_RPC_URL,
  Pacifica,
  buildDepositData,
  deposit,
  init,
} from '../src';
// Types documentés (entrées de deposit/init) : exercés au niveau du type.
import type { DepositParams, InitOptions, PacificaClient } from '../src';

describe('Surface publique (runtime)', () => {
  it('exporte la façade `Pacifica` comme classe', () => {
    expect(typeof Pacifica).toBe('function');
    expect(typeof new Pacifica()).toBe('object');
  });

  it('exporte `init` (constructeur de PacificaClient) comme fonction', () => {
    expect(typeof init).toBe('function');
    const client = init();
    expect(typeof client).toBe('object');
    expect(typeof client.fetch).toBe('function');
  });

  it('exporte la fonction libre `deposit` et le helper `buildDepositData`', () => {
    expect(typeof deposit).toBe('function');
    expect(deposit.length).toBe(3); // deposit(client, params, label)
    expect(typeof buildDepositData).toBe('function');
    const data = buildDepositData(10, 6);
    expect(data).toBeInstanceOf(Uint8Array);
    expect(data.length).toBe(16);
  });

  it('exporte les constantes devnet comme valeurs string', () => {
    for (const c of [
      DEVNET_RPC_URL,
      DEVNET_DEPOSIT_PROGRAM_ID,
      DEVNET_CENTRAL_STATE,
      DEVNET_COLLATERAL_MINT,
    ]) {
      expect(typeof c).toBe('string');
      expect(c.length).toBeGreaterThan(0);
    }
    expect(DEVNET_RPC_URL).toContain('devnet');
  });

  it("n'exporte AUCune primitive de signature interne (façade signe pour toi)", () => {
    const internes = [
      'signMessage',
      'sortJsonKeys',
      'prepareMessage',
      'signWithHardwareWallet',
      'secretKeyFromBase58',
      'publicKeyFromBase58',
      'OperationType',
    ];
    for (const name of internes) {
      expect(name in sdk).toBe(false);
    }
  });
});

// ── Exercice des types documentés (compile-time ; échoue à tsc si un type disparaît) ──
const _opts: InitOptions = { signers: {} };
const _params: DepositParams = { amount: 10 };
const _client: PacificaClient = init(_opts);
void _params;
void _client;

# Dépôt (on-chain)

Le dépôt de collatéral n'est **pas une route API** : c'est une **transaction Solana** envoyée
directement au programme Pacifica (ce que font l'UI et le SDK Python). Il s'appuie sur le moderne
`@solana/kit` + `@solana-program/token` (pas le legacy `@solana/web3.js`).

Autorité : ◎ **wallet Solana** — signé par la keypair Solana on-chain du compte déposant, résolue
depuis le `label` du signer (**obligatoire**). C'est une signature Solana, jamais une clé API Pacifica.

## Fonction

`deposit` est la **seule fonction libre** hors de la classe `Pacifica` (une TX on-chain n'a pas sa
place dans la façade REST/WS). Elle prend le **client en premier argument** : l'appelant le construit
avec `init` (le même que la façade utilise en interne), puis le label désigne le signer.

```ts
deposit(client: PacificaClient, params: DepositParams, label: string): Promise<string> // signature de TX
```

```ts
interface DepositParams {
  amount: number;               // ex. 10 = 10 USDC/USDP
  rpcUrl?: string;              // défaut : mainnet-beta
  rpcSubscriptionsUrl?: string; // défaut : dérivé de rpcUrl (https→wss)
  programId?: string;
  centralState?: string;
  collateralMint?: string;
  decimals?: number;            // défaut : 6
}
```

`buildDepositData(amount, decimals)` est exporté pour inspecter/tester l'encodage sans rien envoyer.

## Disposition de l'instruction

- Discriminant Anchor `sha256("global:deposit")[:8]` (= `f223c68952e1f2b6`) + montant en `u64` LE (`amount × 10^decimals`).
- **Le vault est dérivé** : ATA de `centralState` pour le mint (aucune adresse de vault à fournir).
- 10 comptes : depositor (signer), ATA du depositor, central_state, vault, token program, ATA program, mint, system program, event_authority (PDA `["__event_authority"]`), program.
- Envoyé via `sendAndConfirmTransactionFactory` de `@solana/kit`.

## ⚠️ Le programme diffère selon l'environnement

| | Programme | central_state | mint |
|---|---|---|---|
| **mainnet** (défauts) | `PCFA5iYg…` | `9Gdmhq…` | USDC `EPjFW…` |
| **testnet / devnet** | `peRPsYCcB1J9…` | `2zPRq…` | USDP `USDPqRbL…` |

Constantes devnet exportées : `DEVNET_RPC_URL`, `DEVNET_DEPOSIT_PROGRAM_ID`,
`DEVNET_CENTRAL_STATE`, `DEVNET_COLLATERAL_MINT`.

```ts
import {
  init, deposit,
  DEVNET_RPC_URL, DEVNET_DEPOSIT_PROGRAM_ID, DEVNET_CENTRAL_STATE, DEVNET_COLLATERAL_MINT,
} from '@blackcube/pacifica-sdk';

// Le client porte le registre des signers (clé Solana base58 par label).
const client = init({
  signers: {
    deskA: { secretKey: SOLANA_PRIVATE_KEY, publicKey: SOLANA_ADDRESS, network: 'testnet' },
  },
});

await deposit(
  client,
  {
    amount: 10,
    rpcUrl: DEVNET_RPC_URL,
    programId: DEVNET_DEPOSIT_PROGRAM_ID,
    centralState: DEVNET_CENTRAL_STATE,
    collateralMint: DEVNET_COLLATERAL_MINT,
  },
  'deskA', // le label résout la keypair Solana qui signe et paie la TX
);
```

> Vérifié **de bout en bout sur devnet** : après le dépôt, le solde du compte Pacifica
> (`getAccountInfo`) augmente bien du montant déposé. ⚠️ Utiliser le programme mainnet
> (`PCFA…`) sur devnet produit une transaction qui *confirme* mais ne **crédite pas** le compte.

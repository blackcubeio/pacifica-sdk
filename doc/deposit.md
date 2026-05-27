# Deposit (on-chain)

Le dépôt de collatérale **n'est pas une route API** — c'est une **transaction Solana** directe
vers le programme Pacifica (ce que fait l'UI / le SDK Python). Utilise `@solana/kit` +
`@solana-program/token` (SDK moderne, pas le legacy `@solana/web3.js`).

## Fonction

```ts
deposit(params: DepositParams, signer?: Signer): Promise<string>   // signature de transaction
```

```ts
interface DepositParams {
  amount: number;               // ex. 10 = 10 USDC/USDP
  rpcUrl?: string;              // défaut: mainnet-beta
  rpcSubscriptionsUrl?: string; // défaut: dérivé de rpcUrl (https→wss)
  programId?: string;
  centralState?: string;
  collateralMint?: string;
  decimals?: number;            // défaut: 6
}
```

`buildDepositData(amount, decimals)` est exporté pour inspecter/tester l'encodage sans envoyer.

## Construction de l'instruction

- Discriminateur Anchor `sha256("global:deposit")[:8]` (= `f223c68952e1f2b6`) + montant `u64` LE (`amount × 10^decimals`).
- **Vault dérivé** : ATA de `centralState` pour le mint (pas d'adresse de vault à fournir).
- 10 comptes : depositor (signer), ATA depositor, central_state, vault, token program, ATA program, mint, system program, event_authority (PDA `["__event_authority"]`), program.
- Envoi via `sendAndConfirmTransactionFactory` de `@solana/kit`.

## ⚠️ Le programme diffère selon l'environnement

| | Programme | central_state | mint |
|---|---|---|---|
| **mainnet** (défauts) | `PCFA5iYg…` | `9Gdmhq…` | USDC `EPjFW…` |
| **testnet / devnet** | `peRPsYCcB1J9…` | `2zPRq…` | USDP `USDPqRbL…` |

Constantes devnet exportées : `DEVNET_RPC_URL`, `DEVNET_DEPOSIT_PROGRAM_ID`,
`DEVNET_CENTRAL_STATE`, `DEVNET_COLLATERAL_MINT`.

```ts
import {
  deposit, DEVNET_RPC_URL, DEVNET_DEPOSIT_PROGRAM_ID, DEVNET_CENTRAL_STATE, DEVNET_COLLATERAL_MINT,
} from '@blackcube/pacifica-sdk';

deposit(
  {
    amount: 10,
    rpcUrl: DEVNET_RPC_URL,
    programId: DEVNET_DEPOSIT_PROGRAM_ID,
    centralState: DEVNET_CENTRAL_STATE,
    collateralMint: DEVNET_COLLATERAL_MINT,
  },
  { secretKey: SOLANA_PRIVATE_KEY },
);
```

> Vérifié **end-to-end sur devnet** : après le dépôt, le solde du compte Pacifica
> (`getAccountInfo`) augmente réellement du montant déposé. ⚠️ Utiliser le programme mainnet
> (`PCFA…`) sur devnet produit une transaction qui *confirme* mais ne **crédite pas** le compte.

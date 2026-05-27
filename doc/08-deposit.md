# Deposit on-chain (Solana)

Dépôt de collatérale **directement on-chain** (transaction Solana native vers le programme
Pacifica), indépendant de l'API REST/WS. Utilise la SDK moderne **`@solana/kit`** +
**`@solana-program/token`** (pas le legacy `@solana/web3.js`).

## Fonction

```ts
deposit(params: DepositParams, signer?: Signer): Promise<string>   // signature de transaction
```

```ts
interface DepositParams {
  amount: number;             // montant en unités de collatérale (ex. 10 = 10 USDC)
  rpcUrl?: string;            // défaut: https://api.mainnet-beta.solana.com
  rpcSubscriptionsUrl?: string; // défaut: dérivé de rpcUrl (https→wss)
  programId?: string;         // défaut: PCFA5iYgmqK6MqPhWNKg7Yv7auX7VZ4Cx7T1eJyrAMH
  centralState?: string;      // défaut: 9Gdmhq4Gv1LnNMp7aiS1HSVd7pNnXNMsbuXALCQRmGjY
  collateralMint?: string;    // défaut: USDC mainnet (EPjFW…)
  decimals?: number;          // défaut: 6
}
```

Le `signer` fournit la clé (base58) qui paie et signe la transaction Solana ; à défaut, celui
d'`init()`.

## Construction de l'instruction

- **Discriminateur Anchor** : `sha256("global:deposit")[:8]` (= `f223c68952e1f2b6`).
- **Données** : discriminateur + montant en `u64` little-endian (`amount × 10^decimals`).
- **Vault dérivé** : ATA de `centralState` pour le mint (pas d'adresse de vault à fournir).
- **10 comptes**, dans l'ordre : depositor (signer), ATA du depositor, central_state, vault,
  token program, ATA program, mint, system program, event_authority (PDA `["__event_authority"]`),
  program.

`buildDepositData(amount, decimals)` est exporté pour inspecter/tester l'encodage des données
de l'instruction sans rien envoyer. L'envoi (confirmation) passe par
`sendAndConfirmTransactionFactory` de `@solana/kit` (RPC + RPC subscriptions).

## ⚠️ Le programme diffère selon l'environnement

Le programme de dépôt et le `central_state` **ne sont pas les mêmes** en mainnet et en
testnet (= Solana devnet). Il faut passer les bons paramètres :

| | Programme | central_state | mint |
|---|---|---|---|
| **mainnet** (défauts) | `PCFA5iYg…` | `9Gdmhq…` | USDC `EPjFW…` |
| **testnet / devnet** | `peRPsYCcB1J9…` | `2zPRq…` | USDP `USDPqRbL…` |

Constantes devnet exportées : `DEVNET_RPC_URL`, `DEVNET_DEPOSIT_PROGRAM_ID`,
`DEVNET_CENTRAL_STATE`, `DEVNET_COLLATERAL_MINT`. Le vault et l'event_authority sont **dérivés**
automatiquement à partir du programme/central_state fournis.

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

> Vérifié **end-to-end sur devnet** : après le dépôt, le solde du compte Pacifica (via
> `getAccountInfo`) **augmente réellement** du montant déposé. ⚠️ Utiliser le programme mainnet
> (`PCFA…`) sur devnet produit une transaction qui *confirme* mais ne **crédite pas** le compte.

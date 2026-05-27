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

## Mainnet vs testnet (devnet)

Le programme `PCFA…` et `central_state` existent **aussi sur devnet** (= « testnet » Pacifica
on-chain). Pour déposer en testnet : passer `rpcUrl` devnet + `collateralMint` **USDP**
(`USDPqRbLidFGufty2s3oizmDEKdqx7ePTqzDMbf5ZKM`, la collatérale testnet). Le vault est dérivé
automatiquement (ATA de central_state pour le mint).

```ts
deposit(
  { amount: 10, rpcUrl: 'https://api.devnet.solana.com', collateralMint: 'USDPqRbL…', decimals: 6 },
  { secretKey: SOLANA_PRIVATE_KEY },
);
```

> Vérifié par une **transaction réelle confirmée sur devnet** (dépôt de 10 USDP depuis le
> wallet principal). Le dépôt mainnet engage de vrais USDC.

# @blackcube/pacifica-sdk — Documentation

SDK TypeScript pour l'exchange [Pacifica](https://pacifica.fi) (perp DEX Solana).
Organisation calquée sur la [doc API Pacifica](https://pacifica.gitbook.io/docs/api-documentation/api).

## Sommaire

### REST API
- [Markets](./rest-api/markets.md) — données de marché (GET publics)
- [Account](./rest-api/account.md) — compte, positions, historiques, écritures signées
- [Orders](./rest-api/orders.md) — ordres (lecture + écritures signées), TP/SL, batch, TWAP
- [Spot](./rest-api/spot.md) — actifs spot et bridge
- [Subaccounts](./rest-api/subaccounts.md) — création et transferts de sous-comptes
- [Vaults](./rest-api/vaults.md) — vaults (lakes) : gestion LP et manager

### WebSocket
- [Subscriptions](./websocket/subscriptions.md) — flux temps réel
- [Trading operations](./websocket/trading-operations.md) — actions signées via WS

### Signing & on-chain
- [Signing](./signing.md) — signature Ed25519, operation types, hardware wallet, agent wallets, API config keys
- [Deposit](./deposit.md) — dépôt de collatérale on-chain (Solana)

## Installation

```bash
pnpm add @blackcube/pacifica-sdk
```

Compatible Node.js et navigateur. `signWithHardwareWallet` (Ledger) et `deposit` (on-chain)
ont des prérequis spécifiques (voir leurs pages).

## Initialisation

Le SDK s'initialise **une fois** ; toute l'API hérite de la configuration.

```ts
import { init } from '@blackcube/pacifica-sdk';

init();                                                // mainnet
init({ network: 'testnet' });                          // testnet
init({ network: 'testnet', signer: { secretKey } });   // + signer pour les écritures
```

| Option | Type | Défaut |
|---|---|---|
| `network` | `'mainnet' \| 'testnet'` | `'mainnet'` |
| `restUrl` / `wsUrl` | `string` | selon `network` |
| `fetch` | `FetchLike` | `globalThis.fetch` |
| `webSocket` | `WebSocketFactory` | `globalThis.WebSocket` |
| `signer` | `Signer` | — (requis pour les écritures) |

Appeler l'API avant `init()` lève `Pacifica SDK not initialized`. `resetConfig()` réinitialise.

## Conventions

- **API publique en camelCase** ; conversion vers le wire snake_case en interne.
- **Réponses mappées en camelCase**. Montants/prix = **strings décimales**.
- Erreurs → `PacificaApiError` (`status`, `code`, `message`).
- Écritures → objet [`Signer`](./signing.md) (`init` ou argument par appel).

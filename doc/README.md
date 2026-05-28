# @blackcube/pacifica-sdk — Documentation

TypeScript SDK for the [Pacifica](https://pacifica.fi) exchange (perpetuals DEX on Solana).
Organised like the [Pacifica API docs](https://pacifica.gitbook.io/docs/api-documentation/api).

## Contents

### REST API
- [Markets](./rest-api/markets.md) — market data (public GET)
- [Account](./rest-api/account.md) — account, positions, history, signed writes
- [Orders](./rest-api/orders.md) — orders (read + signed writes), TP/SL, batch, TWAP
- [Spot](./rest-api/spot.md) — spot assets and bridge
- [Subaccounts](./rest-api/subaccounts.md) — subaccount creation and transfers
- [Vaults](./rest-api/vaults.md) — vaults (lakes): LP and manager operations

### WebSocket
- [Subscriptions](./websocket/subscriptions.md) — real-time streams
- [Trading operations](./websocket/trading-operations.md) — signed actions over WS

### Signing & on-chain
- [Signing](./signing.md) — Ed25519 signing, operation types, hardware wallet, agent wallets, API config keys
- [Deposit](./deposit.md) — on-chain collateral deposit (Solana)

## Installation

```bash
pnpm add @blackcube/pacifica-sdk
```

Works in Node.js and the browser. `signWithHardwareWallet` (Ledger) and `deposit` (on-chain)
have specific prerequisites (see their pages).

## Initialisation

The SDK is initialised **once**; the whole API inherits the configuration.

```ts
import { init } from '@blackcube/pacifica-sdk';

init();                                                // mainnet
init({ network: 'testnet' });                          // testnet
init({ network: 'testnet', signers: { [account]: { secretKey } } }); // + signer registry
```

| Option | Type | Default |
|---|---|---|
| `network` | `'mainnet' \| 'testnet'` | `'mainnet'` |
| `restUrl` / `wsUrl` | `string` | per `network` |
| `fetch` | `FetchLike` | `globalThis.fetch` |
| `webSocket` | `WebSocketFactory` | `globalThis.WebSocket` |
| `signers` | `Record<account, Signer>` | — (required for writes) |

Calling the API before `init()` throws `Pacifica SDK not initialized`. `resetConfig()` resets it.

## Multi-account

Register one signer per account address in `init({ signers })`, then reference an account by
address on signed calls — `createLimitOrder(params, account)` — and on account subscriptions.
With a single registered account the `account` argument is optional.

## Conventions

- **Public API in camelCase**; converted to the snake_case wire format internally.
- **Responses mapped to camelCase**. Amounts/prices are **decimal strings**.
- Errors throw `PacificaApiError` (`status`, `code`, `message`).
- Writes reference a registered [account](./signing.md) (registry in `init`, `account` per call).

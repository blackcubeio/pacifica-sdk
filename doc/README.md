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

init();                                                          // reads only, mainnet fallback
init({
  signers: {
    trader: { secretKey, publicKey, network: 'mainnet' },        // a mainnet signer
    tester: { secretKey, publicKey, network: 'testnet' },        // a testnet signer
  },
});
```

| Option | Type | Default |
|---|---|---|
| `signers` | `Record<label, Signer>` | — (required for writes) |
| `fetch` | `FetchLike` | `globalThis.fetch` |
| `webSocket` | `WebSocketFactory` | `globalThis.WebSocket` |
| `restUrls` / `wsUrls` | `Record<Network, string>` | per network |

Each `Signer` carries its own `network`, so mainnet and testnet coexist in one process. Calling the
API before `init()` throws `Pacifica SDK not initialized`. `resetConfig()` resets it.

## Labels, networks & read/write rules

Register one signer per **label** in `init({ signers })`; each signer carries its own `network`.
Every call takes the label as a trailing argument:

- **Reads** (`getPrices`, `getPositions`, subscriptions…) — label is **optional**. No label →
  **mainnet**; a label → that signer's network. `getPrices('tester')`.
- **Writes** (`createLimitOrder`, `withdraw`, `updateLeverage`…) — label is **mandatory** and throws
  if omitted. It selects both the wallet and the network: `createLimitOrder(params, 'tester')`.

Because the network lives on the signer, mainnet and testnet are usable at the same time.

## Authority — which credential each function needs

Every function is annotated on its page with the credential it requires. Summary:

| Mark | Required credential | Covers |
|---|---|---|
| 🔓 **Public** | none | all market reads, account/order/vault reads, market WS streams |
| 🔑 **Account key or API key** | the account's own key **or** a bound API key | trading, account writes, withdraw, vault ops, subaccount transfers, WS trading |
| 👤 **Account key only** | the account's **own** key (API key rejected) | agent-key & API-key management |
| ✍️ **Dual** | main + new sub keys | `createSubaccount` |
| ◎ **Solana wallet** | on-chain Solana keypair | `deposit` |

**API keys are per account (incl. per subaccount)** and only work for the account they are bound
to — register one signer per label (its `publicKey` is the account, `secretKey` the API key) in
`init({ signers })`. See [Signing › Authority](./signing.md).

## Conventions

- **Public API in camelCase**; converted to the snake_case wire format internally.
- **Responses mapped to camelCase**. Amounts/prices are **decimal strings**.
- Errors throw `PacificaApiError` (`status`, `code`, `message`).
- Writes reference a registered signer by [label](./signing.md) (registry in `init`, label per call).

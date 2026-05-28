# @blackcube/pacifica-sdk

[![npm](https://img.shields.io/npm/v/@blackcube/pacifica-sdk.svg)](https://www.npmjs.com/package/@blackcube/pacifica-sdk)
[![license](https://img.shields.io/npm/l/@blackcube/pacifica-sdk.svg)](./LICENSE)

TypeScript SDK for the [Pacifica](https://pacifica.fi) exchange — a perpetuals DEX on Solana.
Full coverage of the REST API, WebSocket API, request signing (Ed25519) and on-chain deposits.

> **Unofficial / community SDK.** Not affiliated with or endorsed by Pacifica. "Pacifica" is a
> trademark of its respective owner. Use at your own risk.

## Features

- ✅ **REST** — markets, account, orders, spot, subaccounts, vaults (read + signed writes)
- ✅ **WebSocket** — subscriptions (prices, orderbook, account streams…) and signed trading actions
- ✅ **Signing** — Ed25519 (software or Ledger hardware wallet), agent wallets, API config keys
- ✅ **On-chain deposit** — native Solana transaction via [`@solana/kit`](https://www.solanakit.com/)
- ✅ Typed end-to-end, ESM + CJS + `.d.ts`, works in Node.js and the browser
- ✅ Mainnet & testnet (Solana devnet) out of the box

## Install

```bash
npm install @blackcube/pacifica-sdk
# or
pnpm add @blackcube/pacifica-sdk
```

Requires Node.js ≥ 22 (for the built-in WebSocket used by `WsClient`; or inject one).
Browsers work as-is.

## Quick start

```ts
import { init, getPrices, createLimitOrder, OrderSide, WsClient } from '@blackcube/pacifica-sdk';

// Initialise once — the whole API inherits this config.
// Register one signer per account address; reference an account on signed calls.
init({
  network: 'testnet',
  signers: { [process.env.PACIFICA_ACCOUNT]: { secretKey: process.env.PACIFICA_SECRET_KEY } },
});

// Public read
const prices = await getPrices();

// Signed write — `account` is optional when a single signer is registered
const { orderId } = await createLimitOrder({
  symbol: 'BTC',
  price: '50000',
  amount: '0.001',
  side: OrderSide.Bid,
});

// WebSocket: stream + signed actions
const ws = new WsClient();
await ws.connect();
ws.subscribePrices((data) => console.log(data));
await ws.createMarketOrder({ symbol: 'BTC', amount: '0.001', side: OrderSide.Bid, slippagePercent: '0.5' });
```

## Configuration

`init(options)` sets a single global config; every call inherits it.

| Option | Type | Default |
|---|---|---|
| `network` | `'mainnet' \| 'testnet'` | `'mainnet'` |
| `restUrl` / `wsUrl` | `string` | per `network` |
| `fetch` | `FetchLike` | `globalThis.fetch` |
| `webSocket` | `WebSocketFactory` | `globalThis.WebSocket` |
| `signers` | `Record<account, Signer>` | — (required for signed writes) |

Signed writes reference a registered account: register signers keyed by account address in
`init({ signers })` (`Signer = { secretKey, agentWallet? }`), then pass the `account` per call
(optional when a single account is registered). Multi-account ready. See [docs/signing](./doc/signing.md).

## API documentation

Organised like the [Pacifica API docs](https://pacifica.gitbook.io/docs/api-documentation/api):

- **REST API** — [Markets](./doc/rest-api/markets.md) · [Account](./doc/rest-api/account.md) · [Orders](./doc/rest-api/orders.md) · [Spot](./doc/rest-api/spot.md) · [Subaccounts](./doc/rest-api/subaccounts.md) · [Vaults](./doc/rest-api/vaults.md)
- **WebSocket** — [Subscriptions](./doc/websocket/subscriptions.md) · [Trading operations](./doc/websocket/trading-operations.md)
- **Signing & on-chain** — [Signing](./doc/signing.md) · [Deposit](./doc/deposit.md)

Full index: [`doc/`](./doc/README.md).

## Conventions

- Public API in **camelCase**; converted to the wire `snake_case` internally.
- Responses mapped to **camelCase**. Amounts and prices are **decimal strings**.
- Errors throw `PacificaApiError` (`status`, `code`, `message`).

## Development

```bash
pnpm install
pnpm typecheck   # tsc --noEmit
pnpm lint        # biome
pnpm test        # vitest (real integration tests against testnet)
pnpm build       # tsup → dist (ESM + CJS + d.ts)
```

> Tests are **real integration tests** (no mocks) hitting the Pacifica testnet / Solana devnet,
> and require trading credentials in a `.env` file. They run sequentially.

## License

[BSD-3-Clause](./LICENSE) © Blackcube

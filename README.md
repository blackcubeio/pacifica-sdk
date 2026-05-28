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
- ✅ **Mainnet & testnet at the same time** — the network is carried per signer, not globally

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

// Initialise once. Register one signer per label; each signer carries its own
// network, so mainnet and testnet live side by side in the same process.
init({
  signers: {
    trader: { secretKey: '…', publicKey: '…', network: 'mainnet' },
    tester: { secretKey: '…', publicKey: '…', network: 'testnet' },
  },
});

// Public read — label is OPTIONAL. No label → mainnet. A label → that signer's network.
const prices = await getPrices();             // mainnet
const testPrices = await getPrices('tester'); // testnet

// Signed write — label is MANDATORY (it picks the wallet *and* the network).
// Omitting it throws, so you can never sign on the wrong network by accident.
const { orderId } = await createLimitOrder(
  { symbol: 'BTC', price: '50000', amount: '0.001', side: OrderSide.Bid },
  'tester',
);

// WebSocket: stream + signed actions. Pass the label at construction; reads default to mainnet.
const ws = new WsClient({ label: 'tester' });
await ws.connect();
ws.subscribePrices((data) => console.log(data));
await ws.createMarketOrder({ symbol: 'BTC', amount: '0.001', side: OrderSide.Bid, slippagePercent: '0.5' });
```

## Configuration

`init(options)` sets a single global config; every call inherits it.

| Option | Type | Default |
|---|---|---|
| `signers` | `Record<label, Signer>` | — (required for signed writes) |
| `fetch` | `FetchLike` | `globalThis.fetch` |
| `webSocket` | `WebSocketFactory` | `globalThis.WebSocket` |
| `restUrls` / `wsUrls` | `Record<Network, string>` | per network |

A `Signer` is self-contained and **carries its own network**:

```ts
type Signer = {
  secretKey: string;        // base58 Ed25519 key used to sign
  publicKey: string;        // the account address (used for reads & as the signed `account`)
  network: 'mainnet' | 'testnet';
  agentWallet?: string;     // optional, when signing with an API/agent key
};
```

Register signers under arbitrary **labels** (`trader`, `tester`, …), then pass the label per call:

- **Read methods** (don't touch funds): label is **optional**. No label → **mainnet** fallback; a
  label → that signer's network. An unknown label throws.
- **Write methods** (orders, transfers, leverage…): label is **mandatory**. Omitting it throws — the
  label is what selects both the wallet *and* the network, so there is no implicit default.

This makes mainnet and testnet usable simultaneously in one process. See [docs/signing](./doc/signing.md).

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

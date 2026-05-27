# @blackcube/pacifica-sdk — Documentation API

SDK TypeScript pour l'exchange [Pacifica](https://pacifica.fi) (perp DEX Solana).

Documentation construite ticket par ticket, au fil de l'implémentation.

## Modules

| Doc | Ticket | Contenu |
|---|---|---|
| [Core](./01-core.md) | #1 | Constantes, types, signature Ed25519 |
| [Markets & Spot](./02-markets-spot.md) | #21 | `init()`, données de marché et spot (GET publics) |
| [Account reading](./03-account-reading.md) | #22 | Compte, positions, ordres, historiques, TWAP (GET) |
| [Orders write](./04-orders-write.md) | #23 | Ordres signés : limit, market, cancel, edit, stop, batch |

## Installation

```bash
pnpm add @blackcube/pacifica-sdk
```

Compatible Node.js et navigateur. La signature hardware wallet (`signWithHardwareWallet`)
est **Node-only** (subprocess CLI `solana`).

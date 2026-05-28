# Deposit (on-chain)

Collateral deposit is **not an API route** — it's a **Solana transaction** straight to the
Pacifica program (what the UI / the Python SDK do). Uses the modern `@solana/kit` +
`@solana-program/token` (not the legacy `@solana/web3.js`).

## Function

```ts
deposit(params: DepositParams, signer?: Signer): Promise<string>   // transaction signature
```

```ts
interface DepositParams {
  amount: number;               // e.g. 10 = 10 USDC/USDP
  rpcUrl?: string;              // default: mainnet-beta
  rpcSubscriptionsUrl?: string; // default: derived from rpcUrl (https→wss)
  programId?: string;
  centralState?: string;
  collateralMint?: string;
  decimals?: number;            // default: 6
}
```

`buildDepositData(amount, decimals)` is exported to inspect/test the encoding without sending.

## Instruction layout

- Anchor discriminator `sha256("global:deposit")[:8]` (= `f223c68952e1f2b6`) + amount as `u64` LE (`amount × 10^decimals`).
- **Vault is derived**: ATA of `centralState` for the mint (no vault address to provide).
- 10 accounts: depositor (signer), depositor ATA, central_state, vault, token program, ATA program, mint, system program, event_authority (PDA `["__event_authority"]`), program.
- Sent via `sendAndConfirmTransactionFactory` from `@solana/kit`.

## ⚠️ The program differs per environment

| | Program | central_state | mint |
|---|---|---|---|
| **mainnet** (defaults) | `PCFA5iYg…` | `9Gdmhq…` | USDC `EPjFW…` |
| **testnet / devnet** | `peRPsYCcB1J9…` | `2zPRq…` | USDP `USDPqRbL…` |

Exported devnet constants: `DEVNET_RPC_URL`, `DEVNET_DEPOSIT_PROGRAM_ID`,
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

> Verified **end-to-end on devnet**: after the deposit, the Pacifica account balance
> (`getAccountInfo`) actually increases by the deposited amount. ⚠️ Using the mainnet program
> (`PCFA…`) on devnet produces a transaction that *confirms* but does **not credit** the account.

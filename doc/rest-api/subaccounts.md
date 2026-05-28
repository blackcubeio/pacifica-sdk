# REST API — Subaccounts

Subaccount creation and transfers (signed). `account?` except for `createSubaccount` (dual signature).

| Function | signature type | Endpoint | Returns |
|---|---|---|---|
| `createSubaccount({ main, sub })` | `subaccount_initiate` + `subaccount_confirm` | `POST /account/subaccount/create` | `void` |
| `listSubaccounts(account?)` | `list_subaccounts` | `POST /account/subaccount/list` | `Subaccount[]` |
| `transferSubaccountFund({ toAccount, amount }, account?)` | `transfer_funds` | `POST /account/subaccount/transfer` | `void` |
| `subaccountSpotTransfer({ toAccount, symbol, amount, idempotencyKey? }, account?)` | `subaccount_spot_transfer` | `POST /account/subaccount/spot_asset/transfer` | `void` |

## createSubaccount — dual signature

The `sub` signs the `main` public key (`subaccount_initiate`), then the `main` signs the sub's
signature (`subaccount_confirm`), **same timestamp**. `main` and `sub` are `Signer` objects.
The request sends `main_signature` + `sub_signature`.

```ts
createSubaccount({ main: { secretKey: MAIN_KEY }, sub: { secretKey: SUB_KEY } });
```

## ⚠️ transfer_funds vs subaccount_transfer

`transferSubaccountFund` uses the type **`transfer_funds`**, **not** `subaccount_transfer` as the
gitbook operation-types table claims. Verified empirically on testnet: `subaccount_transfer` →
*"Verification failed"* (signature rejected); `transfer_funds` → accepted (business error only).
The Python SDK is the correct source here. Minimum transfer amount is 10.

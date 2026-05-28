# REST API — Subaccounts

Subaccount creation and transfers (signed). Mandatory `label`, except `createSubaccount` which
takes raw `Signer` objects (dual signature) and posts on `main.network`.

| Function | Authority | signature type | Endpoint | Returns |
|---|---|---|---|---|
| `createSubaccount({ main, sub })` | ✍️ **Dual** (main + new sub) | `subaccount_initiate` + `subaccount_confirm` | `POST /account/subaccount/create` | `void` |
| `listSubaccounts(label)` | 🔑 Account key or API key | `list_subaccounts` | `POST /account/subaccount/list` | `Subaccount[]` |
| `transferSubaccountFund({ toAccount, amount }, label)` | 🔑 Account key or API key | `transfer_funds` | `POST /account/subaccount/transfer` | `void` |
| `subaccountSpotTransfer({ toAccount, symbol, amount, idempotencyKey? }, label)` | 🔑 Account key or API key | `subaccount_spot_transfer` | `POST /account/subaccount/spot_asset/transfer` | `void` |

## createSubaccount — dual signature

The `sub` signs the `main` public key (`subaccount_initiate`), then the `main` signs the sub's
signature (`subaccount_confirm`), **same timestamp**. `main` and `sub` are `Signer` objects (each
carries `publicKey` + `network`); the request is posted on `main.network` and sends
`main_signature` + `sub_signature`.

```ts
createSubaccount({
  main: { secretKey: MAIN_KEY, publicKey: MAIN_ADDR, network: 'testnet' },
  sub: { secretKey: SUB_KEY, publicKey: SUB_ADDR, network: 'testnet' },
});
```

## ⚠️ transfer_funds vs subaccount_transfer

`transferSubaccountFund` uses the type **`transfer_funds`**, **not** `subaccount_transfer` as the
gitbook operation-types table claims. Verified empirically on testnet: `subaccount_transfer` →
*"Verification failed"* (signature rejected); `transfer_funds` → accepted (business error only).
The Python SDK is the correct source here. Minimum transfer amount is 10.

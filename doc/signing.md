# Signing

Ed25519 request signing, the `Signer` object, operation types, hardware wallet, agent wallets
and API config keys.

## Mechanism

1. header `{ timestamp(ms), expiryWindow(default 30000), type }`
2. `{ ...header, data: payload }`
3. recursive key sort (`sortJsonKeys`)
4. compact `JSON.stringify` (no spaces)
5. Ed25519 signature (`@noble/curves`) → base58
6. REST request = `{ account, signature, timestamp, expiry_window, ...payload }`
7. WS message = `{ id, params: { "<operation_type>": request } }`

## Signer

```ts
interface Signer {
  secretKey: string;     // base58 private key used to sign
  account?: string;      // main wallet; defaults to the one derived from secretKey
  agentWallet?: string;  // agent key pubkey when signing via an agent wallet
}
```

Set in `init({ signer })`, overridable per call: `createMarketOrder(params, signer?)`.
Without a signer → `No signer available` error.

## Primitives (`utils`)

| Function | Purpose |
|---|---|
| `sortJsonKeys(value)` | recursive key sort (arrays preserved) |
| `prepareMessage(header, payload)` | sorted/compact wire message to sign |
| `signMessage(header, payload, secretKey)` | `{ message, signature }` (base58 signature) |
| `signWithHardwareWallet(header, payload, hardwareWalletPath)` | `{ message, signature: { type:'hardware', value } }` |
| `secretKeyFromBase58(secretKey)` / `publicKeyFromBase58(secretKey)` | key helpers |

`signature` is polymorphic: `string` (software) | `{ type: 'hardware', value }` (Ledger).

### Hardware wallet (Ledger)

`signWithHardwareWallet` calls the `solana sign-offchain-message` CLI (**Node-only**, subprocess);
requires the `solana` CLI installed + a connected Ledger.

## Operation types

`OperationType` (enum) covers every signing type: `create_order`, `create_market_order`,
`edit_order`, `cancel_order`, `cancel_all_orders`, `create_stop_order`, `cancel_stop_order`,
`set_position_tpsl`, `update_leverage`, `update_margin_mode`, `add_isolated_margin`,
`set_auto_lend_disabled`, `update_account_spot_settings`, `withdraw`, `withdraw_spot_asset`,
`subaccount_initiate`/`subaccount_confirm`, `list_subaccounts`, `transfer_funds`,
`subaccount_spot_transfer`, `*_lake` (vaults), agent (`bind_agent_wallet`, `list_agent_wallets`,
`revoke_agent_wallet`, `revoke_all_agent_wallets`, `list_agent_ip_whitelist`,
`add_agent_whitelisted_ip`, `remove_agent_whitelisted_ip`, `set_agent_ip_whitelist_enabled`),
API keys (`create_api_key`, `revoke_api_key`, `list_api_keys`).

## Agent wallets

Let you sign on behalf of the account without exposing the main key (`account` = main wallet,
signature with the agent key, `agent_wallet` field). Source: Python SDK (lightly documented on gitbook).

| Function | type | Endpoint | Returns |
|---|---|---|---|
| `bindAgentWallet({ agentWallet }, signer?)` | `bind_agent_wallet` | `POST /agent/bind` | `void` |
| `listAgentWallets(signer?)` | `list_agent_wallets` | `POST /agent/list` | `JsonValue` |
| `revokeAgentWallet({ agentWallet }, signer?)` | `revoke_agent_wallet` | `POST /agent/revoke` | `void` |
| `revokeAllAgentWallets(signer?)` | `revoke_all_agent_wallets` | `POST /agent/revoke_all` | `void` |
| `listAgentIpWhitelist({ agentWallet }, signer?)` | `list_agent_ip_whitelist` | `POST /agent/ip_whitelist/list` | `JsonValue` |
| `addAgentWhitelistedIp({ agentWallet, ipAddress }, signer?)` | `add_agent_whitelisted_ip` | `POST /agent/ip_whitelist/add` | `void` |
| `removeAgentWhitelistedIp({ agentWallet, ipAddress }, signer?)` | `remove_agent_whitelisted_ip` | `POST /agent/ip_whitelist/remove` | `void` |
| `setAgentIpWhitelistEnabled({ agentWallet, enabled }, signer?)` | `set_agent_ip_whitelist_enabled` | `POST /agent/ip_whitelist/toggle` | `void` |

Usage: `init({ signer: { secretKey: AGENT_SECRET, account: MAIN_PUBKEY, agentWallet: AGENT_PUBKEY } })`.
`listAgentIpWhitelist` sends `api_agent_key` (not `agent_wallet`) in the payload.

## API config keys (rate-limit)

| Function | type | Endpoint | Returns |
|---|---|---|---|
| `createApiConfigKey(signer?)` | `create_api_key` | `POST /account/api_keys/create` | `{ apiKey }` |
| `revokeApiConfigKey({ apiKey }, signer?)` | `revoke_api_key` | `POST /account/api_keys/revoke` | `void` |
| `listApiConfigKeys(signer?)` | `list_api_keys` | `POST /account/api_keys` | `JsonValue` |

> The `list*` responses (agent wallets, ip whitelist, api config keys) are undocumented →
> typed as `JsonValue` (no invented fields).

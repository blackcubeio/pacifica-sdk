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

## Signer registry & accounts

Signers are registered **per account address** in `init({ signers })`, then signed calls
reference an account by address:

```ts
interface Signer {
  secretKey: string;     // base58 private key used to sign
  agentWallet?: string;  // agent key pubkey when signing via an agent wallet
}

init({
  network: 'testnet',
  signers: {
    'FQaG…(account address)': { secretKey: AGENT_SECRET, agentWallet: AGENT_PUBKEY },
    'ENUW…(another account)': { secretKey: OTHER_SECRET },
  },
});

createMarketOrder(params, 'FQaG…');   // 2nd arg = the registry key (account address)
```

The **registry key is the account** (the wallet the action is for); the **value is the
signing material** (`secretKey` — which may be an agent key — and optional `agentWallet`).
With a single registered account, the `account` argument is optional. An unknown/missing
account throws `No signer registered for account …`.

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
| `bindAgentWallet({ agentWallet }, account?)` | `bind_agent_wallet` | `POST /agent/bind` | `void` |
| `listAgentWallets(account?)` | `list_agent_wallets` | `POST /agent/list` | `JsonValue` |
| `revokeAgentWallet({ agentWallet }, account?)` | `revoke_agent_wallet` | `POST /agent/revoke` | `void` |
| `revokeAllAgentWallets(account?)` | `revoke_all_agent_wallets` | `POST /agent/revoke_all` | `void` |
| `listAgentIpWhitelist({ agentWallet }, account?)` | `list_agent_ip_whitelist` | `POST /agent/ip_whitelist/list` | `JsonValue` |
| `addAgentWhitelistedIp({ agentWallet, ipAddress }, account?)` | `add_agent_whitelisted_ip` | `POST /agent/ip_whitelist/add` | `void` |
| `removeAgentWhitelistedIp({ agentWallet, ipAddress }, account?)` | `remove_agent_whitelisted_ip` | `POST /agent/ip_whitelist/remove` | `void` |
| `setAgentIpWhitelistEnabled({ agentWallet, enabled }, account?)` | `set_agent_ip_whitelist_enabled` | `POST /agent/ip_whitelist/toggle` | `void` |

Usage: `init({ signers: { [MAIN_PUBKEY]: { secretKey: AGENT_SECRET, agentWallet: AGENT_PUBKEY } } })`
then call with `account = MAIN_PUBKEY`.
`listAgentIpWhitelist` sends `api_agent_key` (not `agent_wallet`) in the payload.

## API config keys (rate-limit)

| Function | type | Endpoint | Returns |
|---|---|---|---|
| `createApiConfigKey(account?)` | `create_api_key` | `POST /account/api_keys/create` | `{ apiKey }` |
| `revokeApiConfigKey({ apiKey }, account?)` | `revoke_api_key` | `POST /account/api_keys/revoke` | `void` |
| `listApiConfigKeys(account?)` | `list_api_keys` | `POST /account/api_keys` | `JsonValue` |

> The `list*` responses (agent wallets, ip whitelist, api config keys) are undocumented →
> typed as `JsonValue` (no invented fields).

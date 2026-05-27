# Signing

Signature Ed25519 des requêtes, objet `Signer`, operation types, hardware wallet, agent
wallets et API config keys.

## Mécanisme

1. header `{ timestamp(ms), expiryWindow(défaut 30000), type }`
2. `{ ...header, data: payload }`
3. tri récursif des clés (`sortJsonKeys`)
4. `JSON.stringify` **compact** (sans espace)
5. signature Ed25519 (`@noble/curves`) → base58
6. requête REST = `{ account, signature, timestamp, expiry_window, ...payload }`
7. message WS = `{ id, params: { "<operation_type>": requête } }`

## Signer

```ts
interface Signer {
  secretKey: string;     // clé privée base58 qui signe
  account?: string;      // wallet principal ; défaut = dérivé de secretKey
  agentWallet?: string;  // pubkey de la clé agent si signature via agent wallet
}
```

Configuré dans `init({ signer })`, surchargeable par appel : `createMarketOrder(params, signer?)`.
Sans signer → erreur `No signer available`.

## Primitives (`utils`)

| Fonction | Rôle |
|---|---|
| `sortJsonKeys(value)` | tri récursif des clés (arrays préservés) |
| `prepareMessage(header, payload)` | message wire trié/compact à signer |
| `signMessage(header, payload, secretKey)` | `{ message, signature }` (signature base58) |
| `signWithHardwareWallet(header, payload, hardwareWalletPath)` | `{ message, signature: { type:'hardware', value } }` |
| `secretKeyFromBase58(secretKey)` / `publicKeyFromBase58(secretKey)` | helpers clé |

`signature` est polymorphe : `string` (logiciel) | `{ type: 'hardware', value }` (Ledger).

### Hardware wallet (Ledger)

`signWithHardwareWallet` appelle la CLI `solana sign-offchain-message` (**Node-only**,
subprocess) ; nécessite la CLI `solana` installée + Ledger connecté.

## Operation types

`OperationType` (enum) couvre tous les types de signature : `create_order`,
`create_market_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `create_stop_order`,
`cancel_stop_order`, `set_position_tpsl`, `update_leverage`, `update_margin_mode`,
`add_isolated_margin`, `set_auto_lend_disabled`, `update_account_spot_settings`, `withdraw`,
`withdraw_spot_asset`, `subaccount_initiate`/`subaccount_confirm`, `list_subaccounts`,
`transfer_funds`, `subaccount_spot_transfer`, `*_lake` (vaults), agent (`bind_agent_wallet`,
`list_agent_wallets`, `revoke_agent_wallet`, `revoke_all_agent_wallets`,
`list_agent_ip_whitelist`, `add_agent_whitelisted_ip`, `remove_agent_whitelisted_ip`,
`set_agent_ip_whitelist_enabled`), API keys (`create_api_key`, `revoke_api_key`, `list_api_keys`).

## Agent wallets

Permettent de signer pour le compte sans exposer la clé principale (`account` = wallet
principal, signature avec la clé agent, champ `agent_wallet`). Source : SDK Python (peu
documenté sur gitbook).

| Fonction | type | Endpoint | Retour |
|---|---|---|---|
| `bindAgentWallet({ agentWallet }, signer?)` | `bind_agent_wallet` | `POST /agent/bind` | `void` |
| `listAgentWallets(signer?)` | `list_agent_wallets` | `POST /agent/list` | `JsonValue` |
| `revokeAgentWallet({ agentWallet }, signer?)` | `revoke_agent_wallet` | `POST /agent/revoke` | `void` |
| `revokeAllAgentWallets(signer?)` | `revoke_all_agent_wallets` | `POST /agent/revoke_all` | `void` |
| `listAgentIpWhitelist({ agentWallet }, signer?)` | `list_agent_ip_whitelist` | `POST /agent/ip_whitelist/list` | `JsonValue` |
| `addAgentWhitelistedIp({ agentWallet, ipAddress }, signer?)` | `add_agent_whitelisted_ip` | `POST /agent/ip_whitelist/add` | `void` |
| `removeAgentWhitelistedIp({ agentWallet, ipAddress }, signer?)` | `remove_agent_whitelisted_ip` | `POST /agent/ip_whitelist/remove` | `void` |
| `setAgentIpWhitelistEnabled({ agentWallet, enabled }, signer?)` | `set_agent_ip_whitelist_enabled` | `POST /agent/ip_whitelist/toggle` | `void` |

Utilisation : `init({ signer: { secretKey: AGENT_SECRET, account: MAIN_PUBKEY, agentWallet: AGENT_PUBKEY } })`.
`listAgentIpWhitelist` envoie `api_agent_key` (et non `agent_wallet`) dans le payload.

## API config keys (rate-limit)

| Fonction | type | Endpoint | Retour |
|---|---|---|---|
| `createApiConfigKey(signer?)` | `create_api_key` | `POST /account/api_keys/create` | `{ apiKey }` |
| `revokeApiConfigKey({ apiKey }, signer?)` | `revoke_api_key` | `POST /account/api_keys/revoke` | `void` |
| `listApiConfigKeys(signer?)` | `list_api_keys` | `POST /account/api_keys` | `JsonValue` |

> Les réponses des `list*` (agent wallets, ip whitelist, api config keys) ne sont pas
> documentées → typées `JsonValue` (sans invention de champs).

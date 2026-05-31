# Signing

Ed25519 request signing, the `Signer` object, operation types, hardware wallet, agent wallets
and API config keys.

## Authority — who can sign what

Each function's required credential is annotated on its page with one of:

| Mark | Meaning |
|---|---|
| 🔓 **Public** | No signer — public read (any account address as a query param). |
| 🔑 **Account key or API key** | The account's own key **or** a bound API key for that account (registry signer). Trading, account writes, withdraw, vaults, positions… |
| 👤 **Account key only** | The account's **own** key; an **API key is rejected** (`"Verification failed"`). Agent-key & API-key management. |
| ✍️ **Dual** | Two keys: the main account **and** the new sub account (subaccount creation). |
| ◎ **Solana wallet** | The account's on-chain Solana keypair (deposit) — never an API key. |

**API keys are per account (incl. per subaccount)** — a key only works for the account it is
bound to ; passe un signer par label au constructeur `new Pacifica({ signers }, …)`. Verified on
testnet: an API key can trade / change leverage / withdraw for its account, but **cannot**
bind/revoke agent keys (those need the account's own key).

> La classe `Pacifica` signe pour toi : tu ne manipules jamais les primitives ci-dessous. Les
> fonctions de gestion (agents/API keys/vaults) sont exposées via les scopes natifs
> `dex.native.agents()` / `dex.native.apiKeys()` / `dex.native.vaults()`.

## Mechanism

1. header `{ timestamp(ms), expiryWindow(default 30000), type }`
2. `{ ...header, data: payload }`
3. recursive key sort (`sortJsonKeys`)
4. compact `JSON.stringify` (no spaces)
5. Ed25519 signature (`@noble/curves`) → base58
6. REST request = `{ account, signature, timestamp, expiry_window, ...payload }`
7. WS message = `{ id, params: { "<operation_type>": request } }`

## Signers, labels & networks

Tu passes les signers au **constructeur** `new Pacifica(signers, { default })` — un par **label**.
Chaque signer est autonome et **porte son propre réseau** : c'est ce qui permet à mainnet et
testnet de coexister dans le même process (plus de singleton global).

```ts
interface Signer {
  secretKey: string;               // base58 private key used to sign
  publicKey: string;               // the account address (the signed `account`, used for reads)
  network: 'mainnet' | 'testnet';  // the network this signer acts on
  agentWallet?: string;            // agent key pubkey when signing via an agent wallet
}

const dex = new Pacifica(
  {
    trader: { secretKey: TRADER_SECRET, publicKey: 'FQaG…', network: 'mainnet' },
    tester: { secretKey: TESTER_SECRET, publicKey: 'ENUW…', network: 'testnet' },
  },
  { default: 'trader' },
);

await dex.perp('tester').place(params);  // le label choisit le compte ET le réseau
await dex.perp().getCandles(query);            // lecture publique, signer par défaut
```

Règles lecture / écriture, internes à la façade :

- **Écritures** (`placeOrder`, `withdraw`, `updateLeverage`…) — un signer (label, ou défaut) est
  **obligatoire** ; le champ signé `account` = `publicKey` du signer, et le réseau route la requête.
- **Lectures** (marché, `getCandles`, subscriptions…) — pas de signer requis ; sans label →
  **mainnet**, un label → le réseau de ce signer.

## Primitives internes (`common/utils`)

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

## Agent wallets / API keys

API agent keys let a program trade **on behalf of an account** without its main key (`account` =
the account, signature with the agent key, `agent_wallet` field). They are **per account** —
each account (including each subaccount) holds its own API key (max 20 per account, self-custody),
and a key only works for the account it is bound to.

Authority: 👤 **Account key only** — every management function below must be signed with the
account's **own** key. An API key signing these is rejected (verified on testnet: `bindAgentWallet`
via an API key → `400 "Verification failed"`). An agent cannot create or revoke agents.

| Function | type | Endpoint | Returns |
|---|---|---|---|
| `bindAgentWallet({ agentWallet }, label)` | `bind_agent_wallet` | `POST /agent/bind` | `void` |
| `listAgentWallets(label)` | `list_agent_wallets` | `POST /agent/list` | `string[]` |
| `revokeAgentWallet({ agentWallet }, label)` | `revoke_agent_wallet` | `POST /agent/revoke` | `void` |
| `revokeAllAgentWallets(label)` | `revoke_all_agent_wallets` | `POST /agent/revoke_all` | `void` |
| `listAgentIpWhitelist({ agentWallet }, label)` | `list_agent_ip_whitelist` | `POST /agent/ip_whitelist/list` | `JsonValue` |
| `addAgentWhitelistedIp({ agentWallet, ipAddress }, label)` | `add_agent_whitelisted_ip` | `POST /agent/ip_whitelist/add` | `void` |
| `removeAgentWhitelistedIp({ agentWallet, ipAddress }, label)` | `remove_agent_whitelisted_ip` | `POST /agent/ip_whitelist/remove` | `void` |
| `setAgentIpWhitelistEnabled({ agentWallet, enabled }, label)` | `set_agent_ip_whitelist_enabled` | `POST /agent/ip_whitelist/toggle` | `void` |

### Using an API key per subaccount

1. **Bind** the key to its account, signed by the account owner:
   `bindAgentWallet({ agentWallet: API_PUBKEY }, 'owner')` (owner signer registered under `owner`).
2. **Register** the key as a labelled signer and trade with it — one label per subaccount. Set
   `publicKey` to the subaccount address and `secretKey` to its API key:

```ts
const dex = new Pacifica({
  sub01: { secretKey: API01_SECRET, publicKey: SUB01, agentWallet: API01_PUBKEY, network: 'testnet' },
  sub02: { secretKey: API02_SECRET, publicKey: SUB02, agentWallet: API02_PUBKEY, network: 'testnet' },
});
await dex.perp('sub01').place(params);   // signé par la clé API de SUB01, crédité à SUB01
```

`listAgentIpWhitelist` sends `api_agent_key` (not `agent_wallet`) in the payload.

## API config keys (rate-limit)

Authority: 👤 **Account key only** — same management class as agent keys; sign with the account's
own key (an API key cannot manage API keys).

| Function | type | Endpoint | Returns |
|---|---|---|---|
| `createApiConfigKey(label)` | `create_api_key` | `POST /account/api_keys/create` | `{ apiKey }` |
| `revokeApiConfigKey({ apiKey }, label)` | `revoke_api_key` | `POST /account/api_keys/revoke` | `void` |
| `listApiConfigKeys(label)` | `list_api_keys` | `POST /account/api_keys` | `JsonValue` |

> `listAgentWallets` returns `string[]` (agent wallet addresses, observed on testnet).
> `listAgentIpWhitelist` and `listApiConfigKeys` responses are undocumented → typed as
> `JsonValue` (no invented fields).

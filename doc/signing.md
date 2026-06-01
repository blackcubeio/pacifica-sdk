# Signatures

Signature Ed25519 des requêtes, l'objet `Signer`, les types d'opérations, le hardware wallet,
les agent wallets et les clés de config API.

## Autorité — qui peut signer quoi

Le credential requis de chaque fonction est annoté sur sa page avec l'un des marqueurs suivants :

| Marqueur | Sens |
|---|---|
| 🔓 **Public** | Aucun signer — lecture publique (n'importe quelle adresse de compte en paramètre de requête). |
| 🔑 **Clé de compte ou clé API** | La clé propre du compte **ou** une clé API liée à ce compte (signer du registre). Trading, écritures de compte, retrait, vaults, positions… |
| 👤 **Clé de compte uniquement** | La clé **propre** du compte ; une **clé API est refusée** (`"Verification failed"`). Gestion des agent keys et des clés API. |
| ✍️ **Double** | Deux clés : le compte principal **et** le nouveau sous-compte (création de sous-compte). |
| ◎ **Wallet Solana** | La keypair Solana on-chain du compte (dépôt) — jamais une clé API. |

**Les clés API sont par compte (y compris par sous-compte)** — une clé ne fonctionne que pour le
compte auquel elle est liée ; passe un signer par label au constructeur `new Pacifica({ signers }, …)`.
Vérifié sur testnet : une clé API peut trader / changer le levier / retirer pour son compte, mais
**ne peut pas** lier/révoquer des agent keys (cela requiert la clé propre du compte).

> La classe `Pacifica` signe pour toi : tu ne manipules jamais les primitives ci-dessous. Les
> fonctions de gestion (agents/clés API/vaults) sont exposées via les scopes natifs
> `dex.native.agents()` / `dex.native.apiKeys()` / `dex.native.vaults()`.

## Mécanisme

1. en-tête `{ timestamp(ms), expiryWindow(défaut 30000), type }`
2. `{ ...header, data: payload }`
3. tri récursif des clés (`sortJsonKeys`)
4. `JSON.stringify` compact (sans espaces)
5. signature Ed25519 (`@noble/curves`) → base58
6. requête REST = `{ account, signature, timestamp, expiry_window, ...payload }`
7. message WS = `{ id, params: { "<operation_type>": request } }`

## Signers, labels et réseaux

Tu passes les signers au **constructeur** `new Pacifica(signers, { default })` — un par **label**.
Chaque signer est autonome et **porte son propre réseau** : c'est ce qui permet à mainnet et
testnet de coexister dans le même process (plus de singleton global).

```ts
interface Signer {
  secretKey: string;               // clé privée base58 utilisée pour signer
  publicKey: string;               // l'adresse du compte (le champ signé `account`, lu pour les reads)
  network: 'mainnet' | 'testnet';  // le réseau sur lequel ce signer agit
  agentWallet?: string;            // pubkey de l'agent key si la signature passe par un agent wallet
}

const dex = new Pacifica(
  {
    trader: { secretKey: TRADER_SECRET, publicKey: 'FQaG…', network: 'mainnet' },
    tester: { secretKey: TESTER_SECRET, publicKey: 'ENUW…', network: 'testnet' },
  },
  { default: 'trader' },
);

await dex.perp('tester').place(params);  // le label choisit le compte ET le réseau
await dex.perp().getCandles(query);      // lecture publique, signer par défaut
```

Règles lecture / écriture, internes à la façade :

- **Écritures** (`placeOrder`, `withdraw`, `updateLeverage`…) — un signer (label, ou défaut) est
  **obligatoire** ; le champ signé `account` = `publicKey` du signer, et le réseau route la requête.
- **Lectures** (marché, `getCandles`, abonnements…) — pas de signer requis ; sans label →
  **mainnet**, un label → le réseau de ce signer.

## Primitives internes (`common/utils`)

Ces primitives sont **internes** : elles ne sont pas exportées par le paquet. La façade les utilise
pour toi. Elles ne sont listées ici que pour documenter le mécanisme de signature.

| Fonction | Rôle |
|---|---|
| `sortJsonKeys(value)` | tri récursif des clés (tableaux préservés) |
| `prepareMessage(header, payload)` | message filaire trié/compact à signer |
| `signMessage(header, payload, secretKey)` | `{ message, signature }` (signature base58) |
| `signWithHardwareWallet(header, payload, hardwareWalletPath)` | `{ message, signature: { type:'hardware', value } }` |
| `secretKeyFromBase58(secretKey)` / `publicKeyFromBase58(secretKey)` | helpers de clés |

`signature` est polymorphe : `string` (logiciel) | `{ type: 'hardware', value }` (Ledger).

### Hardware wallet (Ledger)

`signWithHardwareWallet` appelle la CLI `solana sign-offchain-message` (**Node uniquement**,
sous-processus) ; requiert la CLI `solana` installée + un Ledger connecté.

## Types d'opérations

`OperationType` (enum **interne**) couvre chaque type de signature : `create_order`,
`create_market_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `create_stop_order`,
`cancel_stop_order`, `set_position_tpsl`, `update_leverage`, `update_margin_mode`,
`add_isolated_margin`, `set_auto_lend_disabled`, `update_account_spot_settings`, `withdraw`,
`withdraw_spot_asset`, `subaccount_initiate`/`subaccount_confirm`, `list_subaccounts`,
`transfer_funds`, `subaccount_spot_transfer`, `*_lake` (vaults), agent (`bind_agent_wallet`,
`list_agent_wallets`, `revoke_agent_wallet`, `revoke_all_agent_wallets`,
`list_agent_ip_whitelist`, `add_agent_whitelisted_ip`, `remove_agent_whitelisted_ip`,
`set_agent_ip_whitelist_enabled`), clés API (`create_api_key`, `revoke_api_key`, `list_api_keys`).

## Agent wallets / clés API

Les agent keys API laissent un programme trader **pour le compte d'un account** sans sa clé
principale (`account` = le compte, signature avec l'agent key, champ `agent_wallet`). Elles sont
**par compte** — chaque compte (y compris chaque sous-compte) détient sa propre clé API (max 20
par compte, self-custody), et une clé ne fonctionne que pour le compte auquel elle est liée.

Autorité : 👤 **Clé de compte uniquement** — chaque fonction de gestion ci-dessous doit être signée
avec la clé **propre** du compte. Une clé API qui les signe est refusée (vérifié sur testnet :
`bindAgentWallet` via une clé API → `400 "Verification failed"`). Un agent ne peut ni créer ni
révoquer d'agents.

> Ces fonctions sont exposées via le scope natif `dex.native.agents()` (la façade signe et route
> pour toi). Le tableau ci-dessous décrit le mapping endpoint / type d'opération.

| Méthode (scope `native.agents()`) | type | Endpoint | Retour |
|---|---|---|---|
| `approve({ agentWallet })` | `bind_agent_wallet` | `POST /agent/bind` | `void` |
| `getAgents()` | `list_agent_wallets` | `POST /agent/list` | `string[]` |
| `revoke({ agentWallet })` | `revoke_agent_wallet` | `POST /agent/revoke` | `void` |
| `revokeAll()` | `revoke_all_agent_wallets` | `POST /agent/revoke_all` | `void` |
| `getIpWhitelist({ agentWallet })` | `list_agent_ip_whitelist` | `POST /agent/ip_whitelist/list` | `JsonValue` |
| `addIp({ agentWallet, ipAddress })` | `add_agent_whitelisted_ip` | `POST /agent/ip_whitelist/add` | `void` |
| `removeIp({ agentWallet, ipAddress })` | `remove_agent_whitelisted_ip` | `POST /agent/ip_whitelist/remove` | `void` |
| `setIpEnabled({ agentWallet, enabled })` | `set_agent_ip_whitelist_enabled` | `POST /agent/ip_whitelist/toggle` | `void` |

### Utiliser une clé API par sous-compte

1. **Lier** la clé à son compte, signé par le propriétaire :
   `dex.native.agents('owner').approve({ agentWallet: API_PUBKEY })` (signer `owner` enregistré).
2. **Enregistrer** la clé comme signer labellisé et trader avec — un label par sous-compte. Mets
   `publicKey` = adresse du sous-compte et `secretKey` = sa clé API :

```ts
const dex = new Pacifica({
  sub01: { secretKey: API01_SECRET, publicKey: SUB01, agentWallet: API01_PUBKEY, network: 'testnet' },
  sub02: { secretKey: API02_SECRET, publicKey: SUB02, agentWallet: API02_PUBKEY, network: 'testnet' },
});
await dex.perp('sub01').place(params);   // signé par la clé API de SUB01, crédité à SUB01
```

`getIpWhitelist` envoie `api_agent_key` (pas `agent_wallet`) dans le payload.

## Clés de config API (rate-limit)

Autorité : 👤 **Clé de compte uniquement** — même classe de gestion que les agent keys ; signe
avec la clé propre du compte (une clé API ne peut pas gérer les clés API).

| Méthode (scope `native.apiKeys()`) | type | Endpoint | Retour |
|---|---|---|---|
| `create()` | `create_api_key` | `POST /account/api_keys/create` | `{ apiKey }` |
| `revoke({ apiKey })` | `revoke_api_key` | `POST /account/api_keys/revoke` | `void` |
| `getApiKeys()` | `list_api_keys` | `POST /account/api_keys` | `JsonValue` |

> `getAgents` renvoie `string[]` (adresses des agent wallets, observé sur testnet).
> Les réponses de `getIpWhitelist` et `getApiKeys` ne sont pas documentées → typées en
> `JsonValue` (aucun champ inventé).

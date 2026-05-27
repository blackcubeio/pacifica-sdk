# Account write + Agent — écritures signées

Endpoints REST signés pour la gestion du compte, des subaccounts, des API config keys et
des agent wallets. Tous prennent un `signer?` optionnel (voir [Orders write](./04-orders-write.md)).

## Compte

| Fonction | type signature | Endpoint | Retour |
|---|---|---|---|
| `updateLeverage({ symbol, leverage })` | `update_leverage` | `POST /account/leverage` | `void` |
| `updateMarginMode({ symbol, isIsolated })` | `update_margin_mode` | `POST /account/margin` | `void` |
| `addIsolatedMargin({ symbol, amount })` | `add_isolated_margin` | `POST /positions/add_isolated_margin` | `void` |
| `toggleAutoLending({ disabled })` | `set_auto_lend_disabled` | `POST /account/settings/auto_lend_disabled` | `void` |
| `updateSpotSettings({ symbol, unifiedMarginExcluded })` | `update_account_spot_settings` | `POST /account/settings/spot` | `void` |
| `withdraw({ amount })` | `withdraw` | `POST /account/withdraw` | `void` |
| `withdrawSpotAsset({ symbol, amount, idempotencyKey? })` | `withdraw_spot_asset` | `POST /account/spot_asset/withdraw` | `WithdrawSpotResult` |

`toggleAutoLending` : `disabled` = `true` (désactive), `false` (active), `null` (défaut).

## Subaccounts

| Fonction | type signature | Endpoint | Retour |
|---|---|---|---|
| `createSubaccount({ main, sub })` | `subaccount_initiate` + `subaccount_confirm` | `POST /account/subaccount/create` | `void` |
| `listSubaccounts(signer?)` | `list_subaccounts` | `POST /account/subaccount/list` | `Subaccount[]` |
| `transferSubaccountFund({ toAccount, amount })` | `transfer_funds` | `POST /account/subaccount/transfer` | `void` |
| `subaccountSpotTransfer({ toAccount, symbol, amount, idempotencyKey? })` | `subaccount_spot_transfer` | `POST /account/subaccount/spot_asset/transfer` | `void` |

**`createSubaccount`** = double signature (même timestamp) : le `sub` signe la clé publique du
`main` (`subaccount_initiate`), puis le `main` signe la signature du sub (`subaccount_confirm`).
`main` et `sub` sont des objets `Signer`. La requête envoie `main_signature` + `sub_signature`.

> ⚠️ **`transferSubaccountFund` utilise `transfer_funds`**, **pas** `subaccount_transfer` comme
> l'annonce la table operation-types du gitbook. Vérifié empiriquement sur testnet :
> `subaccount_transfer` → *"Verification failed"* (signature refusée) ; `transfer_funds` →
> erreur métier (signature acceptée). Le SDK Python est la source correcte ici.

## API config keys (rate-limit)

| Fonction | type signature | Endpoint | Retour |
|---|---|---|---|
| `createApiConfigKey(signer?)` | `create_api_key` | `POST /account/api_keys/create` | `ApiConfigKeyResult` (`{ apiKey }`) |
| `revokeApiConfigKey({ apiKey })` | `revoke_api_key` | `POST /account/api_keys/revoke` | `void` |
| `listApiConfigKeys(signer?)` | `list_api_keys` | `POST /account/api_keys` | `JsonValue` * |

## Agent wallets

| Fonction | type signature | Endpoint | Retour |
|---|---|---|---|
| `bindAgentWallet({ agentWallet })` | `bind_agent_wallet` | `POST /agent/bind` | `void` |
| `listAgentWallets(signer?)` | `list_agent_wallets` | `POST /agent/list` | `JsonValue` * |
| `revokeAgentWallet({ agentWallet })` | `revoke_agent_wallet` | `POST /agent/revoke` | `void` |
| `revokeAllAgentWallets(signer?)` | `revoke_all_agent_wallets` | `POST /agent/revoke_all` | `void` |
| `listAgentIpWhitelist({ agentWallet })` | `list_agent_ip_whitelist` | `POST /agent/ip_whitelist/list` | `JsonValue` * |
| `addAgentWhitelistedIp({ agentWallet, ipAddress })` | `add_agent_whitelisted_ip` | `POST /agent/ip_whitelist/add` | `void` |
| `removeAgentWhitelistedIp({ agentWallet, ipAddress })` | `remove_agent_whitelisted_ip` | `POST /agent/ip_whitelist/remove` | `void` |
| `setAgentIpWhitelistEnabled({ agentWallet, enabled })` | `set_agent_ip_whitelist_enabled` | `POST /agent/ip_whitelist/toggle` | `void` |

Source des endpoints/agent + config keys + subaccounts : **SDK Python** (non documentés sur gitbook).

`listAgentIpWhitelist` envoie le champ `api_agent_key` (et non `agent_wallet`) dans le payload signé.

> \* Les réponses des `list*` (api config keys, agent wallets, ip whitelist) ne sont pas
> documentées et leur forme n'a pas été observée précisément → typées `JsonValue` (sans
> invention). À typer finement quand la forme réelle sera connue.

## Agent wallet : utilisation

Une fois un agent wallet bindé, on signe avec sa clé privée tout en gardant le compte
principal : `init({ signer: { secretKey: AGENT_SECRET, account: MAIN_PUBKEY, agentWallet: AGENT_PUBKEY } })`.
Le SDK ajoute alors `agent_wallet` aux requêtes signées.

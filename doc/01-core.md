# Core — constantes, types, signature

Module fondamental : URLs de l'API, types partagés et primitives de signature Ed25519
utilisées par tous les endpoints signés (REST et WebSocket).

## Constantes

```ts
import { REST_URL, WS_URL, TESTNET_REST_URL, TESTNET_WS_URL,
         DEFAULT_EXPIRY_WINDOW, WS_HEARTBEAT_INTERVAL } from '@blackcube/pacifica-sdk';
```

| Constante | Valeur |
|---|---|
| `REST_URL` | `https://api.pacifica.fi/api/v1` |
| `WS_URL` | `wss://ws.pacifica.fi/ws` |
| `TESTNET_REST_URL` | `https://test-api.pacifica.fi/api/v1` |
| `TESTNET_WS_URL` | `wss://test-ws.pacifica.fi/ws` |
| `DEFAULT_EXPIRY_WINDOW` | `30000` (ms) |
| `WS_HEARTBEAT_INTERVAL` | `30000` (ms) |

## Types

### Enums

- `OperationType` — type d'opération de signature (`create_order`, `create_market_order`,
  `edit_order`, `cancel_order`, `update_leverage`, `set_position_tpsl`, `withdraw`,
  `add_isolated_margin`, `set_auto_lend_disabled`, `update_account_spot_settings`,
  `withdraw_spot_asset`, `subaccount_*`, `bind_agent_wallet`, `*_lake`, …). Valeurs alignées
  1:1 sur la doc Pacifica.
- `OrderSide` — `Bid = 'bid'`, `Ask = 'ask'`.
- `TimeInForce` — `Gtc`, `Ioc`, `Fok`, `Alo`, `Tob`.
- `TriggerPriceType` — `MarkPrice = 'mark_price'`, `LastTradePrice`, `MidPrice`.

### JSON

```ts
type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
interface JsonObject { [key: string]: JsonValue; }
```

### Signature

```ts
interface SignatureHeader {
  timestamp: number;     // ms
  expiryWindow: number;  // ms (défaut conseillé : DEFAULT_EXPIRY_WINDOW)
  type: OperationType;
}

interface HardwareSignature { type: 'hardware'; value: string; }
type Signature = string | HardwareSignature;  // string = signature logicielle base58

interface SignedRequestHeader {
  account: string;       // clé publique du wallet principal
  signature: Signature;
  timestamp: number;
  expiryWindow: number;
  agentWallet?: string;  // optionnel : signé par une clé agent
}

type SignedRequest<TPayload> = SignedRequestHeader & TPayload;
interface SignedMessage<TSignature extends Signature = string> {
  message: string;       // JSON signé (trié, compact)
  signature: TSignature;
}
```

> **Note camelCase** : l'API publique du SDK est en camelCase (`expiryWindow`). Le message
> effectivement signé est converti en snake_case wire (`expiry_window`) par `prepareMessage`.

## Signature — utilitaires

### `prepareMessage(header, payload): string`

Construit le message exact à signer : `{ type, timestamp, expiry_window, data: payload }`,
clés triées récursivement, sérialisé compact (sans espaces). C'est la représentation que
le backend Pacifica attend.

```ts
prepareMessage(
  { type: OperationType.CreateOrder, timestamp: 1700000000000, expiryWindow: 30000 },
  { symbol: 'BTC', side: 'bid' },
);
// → '{"data":{"side":"bid","symbol":"BTC"},"expiry_window":30000,"timestamp":1700000000000,"type":"create_order"}'
```

### `sortJsonKeys(value): JsonValue`

Tri récursif des clés d'objet (l'ordre des tableaux est préservé). Les valeurs `undefined`
sont omises, comme `JSON.stringify`.

### `signMessage(header, payload, secretKey): SignedMessage<string>`

Signe le message avec une clé privée **base58** (format `.env` / `solders`). Retourne le
message signé et la signature base58. Utilise `@noble/curves` (Ed25519) — pas de dépendance
Solana, fonctionne en navigateur.

```ts
const signed = signMessage(header, payload, privateKeyBase58);
// signed.signature → base58 string, à placer dans le champ `signature` de la requête
```

### `signWithHardwareWallet(header, payload, hardwareWalletPath): SignedMessage<HardwareSignature>`

Signe via Ledger en appelant la CLI `solana sign-offchain-message`. Retourne
`signature = { type: 'hardware', value }`.

**Prérequis / cas limites** :
- **Node-only** : utilise un subprocess (`node:child_process`), indisponible en navigateur.
- La CLI `solana` doit être installée et le Ledger connecté/déverrouillé.
- Lève une erreur si la CLI renvoie un code non nul ou aucune signature.

### `secretKeyFromBase58(secretKey): Uint8Array` / `publicKeyFromBase58(secretKey): string`

Helpers : décodage base58 + extraction du seed 32 octets, et dérivation de la clé publique
(account) à partir de la clé privée. `publicKeyFromBase58(priv)` renvoie l'adresse du wallet.

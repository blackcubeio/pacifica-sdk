# Orders write — écritures signées

Endpoints REST signés de la famille Orders. Signature Ed25519 (voir [Core](./01-core.md)).

## Signer

Les écritures ont besoin d'un `Signer` :

```ts
interface Signer {
  secretKey: string;     // clé privée base58 qui signe
  account?: string;      // wallet principal ; défaut = dérivé de secretKey
  agentWallet?: string;  // pubkey de la clé agent si on signe via un agent wallet
}
```

Configuré une fois dans `init()`, surchargeable par appel :

```ts
init({ network: 'testnet', signer: { secretKey: PRIVATE_KEY } });

createMarketOrder({ symbol: 'BTC', amount: '0.01', side: OrderSide.Bid, slippagePercent: '0.5' });
// ou avec un autre signer ponctuel :
createMarketOrder(params, otherSigner);
```

Sans signer (ni dans `init()`, ni en argument) → erreur `No signer available`.

## Fonctions

| Fonction | type signature | Endpoint | Retour |
|---|---|---|---|
| `createLimitOrder(params, signer?)` | `create_order` | `POST /orders/create` | `CreateOrderResult` |
| `createMarketOrder(params, signer?)` | `create_market_order` | `POST /orders/create_market` | `CreateOrderResult` |
| `cancelOrder(params, signer?)` | `cancel_order` | `POST /orders/cancel` | `void` |
| `cancelAllOrders(params, signer?)` | `cancel_all_orders` | `POST /orders/cancel_all` | `CancelAllResult` |
| `editOrder(params, signer?)` | `edit_order` | `POST /orders/edit` | `CreateOrderResult` |
| `createStopOrder(params, signer?)` | `create_stop_order` | `POST /orders/stop/create` | `CreateOrderResult` |
| `cancelStopOrder(params, signer?)` | `cancel_stop_order` | `POST /orders/stop/cancel` | `void` |
| `batchOrders(actions, signer?)` | *(par action)* | `POST /orders/batch` | `BatchResult` |

## Params

- **Montants et prix = strings.** `clientOrderId` auto-généré (UUID v4) si absent.
- `createLimitOrder` : `{ symbol, price, amount, side, tif?, reduceOnly?, clientOrderId?, takeProfit?, stopLoss?, builderCode? }`. `tif` défaut `GTC`, `reduceOnly` défaut `false`.
- `createMarketOrder` : `{ symbol, amount, side, slippagePercent, reduceOnly?, clientOrderId?, takeProfit?, stopLoss?, builderCode? }`.
- `cancelOrder` / `cancelStopOrder` : `{ symbol, orderId? | clientOrderId? }` (l'un des deux requis).
- `cancelAllOrders` : `{ allSymbols, excludeReduceOnly, symbol? }` (`symbol` requis si `allSymbols=false`).
- `editOrder` : `{ symbol, price, amount, orderId? | clientOrderId? }`. Annule l'ordre et en recrée un (TIF=ALO).
- `createStopOrder` : `{ symbol, side, reduceOnly, stopOrder: { stopPrice, limitPrice?, clientOrderId?, triggerPriceType?, amount? }, builderCode? }`.

### TP/SL attachés (`StopConfig`)

`takeProfit` / `stopLoss` : `{ stopPrice, limitPrice?, clientOrderId?, triggerPriceType? }`.
`triggerPriceType` : `mark_price` (défaut), `last_trade_price`, `mid_price`.

## Batch

```ts
batchOrders([
  { type: BatchActionType.Create, params: { symbol: 'BTC', price: '50000', amount: '0.001', side: OrderSide.Bid } },
  { type: BatchActionType.Cancel, params: { symbol: 'ETH', orderId: 123 } },
]);
```

- Chaque action est **signée individuellement** (pas de signature globale du batch).
- Max 10 actions, exécution atomique dans l'ordre. Types supportés : `Create`, `CreateMarket`,
  `Cancel`, `Edit`, `CancelStopOrder`. (`SetPositionTpsl` arrivera avec le ticket #25.)
- Retour : `BatchResult { results: BatchActionResult[] }`, un résultat par action (`success`,
  `orderId?`, `error`).

## Cas limites

- `editOrder` recrée un ordre en Post-Only (TIF=ALO) avec un nouveau `order_id`.
- `cancelOrder` / `cancelStopOrder` résolvent sans valeur (`void`) en cas de succès ; lèvent
  `PacificaApiError` sinon.

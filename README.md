# @blackcube/pacifica-sdk

TypeScript SDK pour l'exchange [Pacifica](https://pacifica.fi) — DEX **perpetuals** sur Solana.
Même surface que `@blackcube/aster-sdk` et `@blackcube/hyperliquid-sdk`.

> **SDK communautaire / non officiel.** Non affilié à Pacifica. Usage à vos risques.

## Installation

```bash
pnpm add @blackcube/pacifica-sdk
```

Node.js (≥ 22) et navigateur (crypto via `@noble`).

## Tout passe par la classe `Pacifica`

Tu n'appelles jamais un endpoint REST ni un client WebSocket directement. Une seule classe
gère la connexion, la signature (Ed25519 / Solana), le réseau (mainnet/testnet) et la
conversion vers les types unifiés Blackcube.

```ts
import { Pacifica } from '@blackcube/pacifica-sdk';

const dex = new Pacifica(
  { deskA: { secretKey: '<base58>', publicKey: '<base58>', network: 'testnet' } },
  { default: 'deskA' },
);

// REST : requête → réponse
const candles = await dex.perp().getCandles({ name: 'BTC', interval: '1m', startTime: Date.now() - 3.6e6 });
const order = await dex.perp().place({
  name: 'BTC', side: 'buy', type: 'limit', size: '0.001', price: '20000',
});

// WebSocket : abonnement → flux
const off = dex.ws().subscribeCandles({ name: 'BTC', interval: '1m' }, (candle) => {
  console.log(candle.c);
});
off(); // se désabonne (ferme le socket s'il n'y a plus d'abonné)
```

## REST vs WebSocket — la seule distinction à connaître

- **REST** (`perp()`, `account()` + scopes spécifiques) : **requête → réponse**. Tu `await` un
  appel, tu reçois une valeur, terminé.
- **WebSocket** (`ws()`) : **abonnement → flux**. Tu passes un *handler* rappelé **à chaque**
  mise à jour, tant que tu n'as pas appelé la fonction de désabonnement renvoyée. Pas de
  `connect()`/`disconnect()` : le socket s'ouvre au premier `subscribe` et se ferme seul quand
  le dernier abonnement est retiré.

Tous les retours (REST comme WS) sont au **format unifié** (`Candle`, `Order`, `OrderBook`,
`Position`, `Trade`, `UserTrade`, `Price`, `Balance`…), identique entre les SDK Blackcube.

## Construction

```ts
new Pacifica(signers?, options?)
```

- **`signers`** : `Record<label, Signer>`. Un `Signer` Pacifica =
  `{ secretKey, publicKey, network, agentWallet? }` — clé **Solana** base58. `secretKey` signe
  (Ed25519), `publicKey` est l'adresse du compte lue par l'API. Sans signer, seules les lectures
  publiques fonctionnent.
- **`options.default`** : label utilisé quand tu n'en précises pas (sinon le premier signer).
- Autres `options` (rarement utiles) : `fetch`, `webSocket`, `restUrls`, `wsUrls`.

Chaque scope accepte un `label` optionnel pour choisir le compte : `dex.perp('deskB')`,
`dex.account('deskB')`… Sans argument → signer par défaut. **Plusieurs instances `Pacifica`
(comptes/réseaux différents) coexistent** sans interférence — chacune a sa propre config (pas de
singleton global).

## Un seul produit : perp

Pacifica est un DEX **perpetuals uniquement** : il n'y a **pas de scope `spot()`**. Le `kind` des
retours unifiés est toujours `perp`.

### `dex.perp(label?)` — marché + trading + compte

| Catégorie | Méthodes |
|---|---|
| Marché (public) | `getPairs()`, `getCandles(q)`, `getOrderBook(q)`, `getPrices()`, `getFundingHistory(q)`, `getTrades(q)`, `getExchangeInfo()` |
| Compte (signé) | `getPositions(q?)`, `getOpens(q?)`, `getUserTrades(q?)`, `getHistory(q?)`, `getAccountInfo()` |
| Trading (signé) | `place(i)`, `cancel(i)`, `cancelAll(i)`, `edit(i)`, `updateLeverage(i)`, `setMarginMode(i)`, `addIsolatedMargin(i)` |

> **Spécificités Pacifica** : pas de **retrait de marge isolée** (`removeIsolatedMargin`) ;
> `placeOrder` accepte `limit` / `market` (le `market` accepte un `slippagePercent`, défaut `1` %).

### `dex.account(label?)` — compte transverse

`getBalances()` (soldes spot), `getSubAccounts()`, `withdraw(i)`.

> Pacifica n'a ni `ping` ni horloge serveur publics : **pas de scope `system()`** (capacité
> `ISystem` non implémentée).

### `dex.helpers()` — crypto (Solana)

`keyTypeOf(pk)`, `solanaAddress(pk)`, `signEd25519(msg, pk)`. *(Pacifica est Solana-only : pas
d'helpers EVM.)*

### `dex.ws(label?)` — temps réel (perp)

Chaque `subscribeX` renvoie une fonction de désabonnement (`Unsubscribe`). Les flux user-data
résolvent le compte depuis le signer.

| Catégorie | Méthodes |
|---|---|
| Public | `subscribeCandles(q, cb)`, `subscribeOrderBook(q, cb)`, `subscribeTrades(q, cb)`, `subscribeBbo(q, cb)` (→ `OrderBook` 1 niveau), `subscribePrices(cb)` (→ `Price[]`) |
| Compte (signé) | `subscribeOrders(cb)`, `subscribeUserTrades(cb)`, `subscribePositions(cb)` |

### `dex.transfers(label?)` — transferts de fonds (commun)

`transfer({ to, asset?, amount })` — **narrowé** : `to` = `{ subAccount: string }` uniquement
(le compilateur refuse toute autre route). Sans `asset` → USDC perp (`transferSubaccountFund`) ;
avec `asset` → token spot (`subaccountSpotTransfer`).

### Surface `native` — spécifique Pacifica (`dex.native.<cap>()`)

Le namespace `native` **miroite** le commun ; détail dans [`doc/native.md`](doc/native.md).

| Scope | Contenu |
|---|---|
| `dex.native.perp()` | miroir natif de `perp()` : reads marché (`getFeeLevels`, `getMarkPriceCandles`) **+** ordres avancés (`placeStop`, `cancelStop`, `placeTpsl`, `placeBatch`, `getById`, `getTwaps`, `getTwapHistory`, `getTwapHistoryById`) |
| `dex.native.account()` | miroir natif de `account()` (ex-`portfolio`) : `getPortfolio`, `getSettings`, `updateSettings`, `getBalanceHistory`, `getTradeHistory`, `getFunding` |
| `dex.native.vaults()` | vaults Lake : `getVaults`, `create`, `deposit`, `withdraw`, white/blacklist, max-leverage, deposit-cap, claims |
| `dex.native.agents()` | `getAgents`, `approve`, `revoke`, `revokeAll`, IP whitelist (`addIp`/`removeIp`/`getIpWhitelist`/`setIpEnabled`) |
| `dex.native.apiKeys()` | `create`, `getApiKeys`, `revoke` |
| `dex.native.wallet()` | actifs spot, bridge, retraits, historiques : `getAssets`, `getBridge`, `getBridgeParams`, `withdraw`, `getDepositHistory`/`getWithdrawalHistory`/`getBalanceHistory`, `getPendingWithdrawals` |
| `dex.native.lending()` | `toggleAutoLending`, `getAccountLoan`, `getLoanPool` |
| `dex.native.subAccounts()` | `create` (transferts via `transfers()`) |
| `dex.native.ws()` | temps réel natif : flux compte bruts + trading via WS |

> Pacifica **n'a pas** de dead-man's switch serveur : pas de `armCancelAll`/`disarm`.

## Exemples

```ts
// Lecture publique sans signer
const pub = new Pacifica();
const book = await pub.perp().getOrderBook({ name: 'BTC' });

// Cycle d'ordre (testnet)
const created = await dex.perp().place({
  name: 'BTC', side: 'buy', type: 'limit', tif: 'gtc', size: '0.001', price: '20000',
});
await dex.perp().cancel({ name: 'BTC', clientId: created.clientId ?? undefined });

// Compte transverse
const balances = await dex.account().getBalances();

// Temps réel : suivre ses propres fills
const off = dex.ws().subscribeUserTrades((fill) => console.log(fill.price, fill.size));
```

## Erreurs

Les appels rejettent un `PacificaApiError` (`status`, `code`, `message`).

## Documentation

- Signatures (Ed25519, signers par label) : [`doc/signing.md`](doc/signing.md).
- Dépôt on-chain (devnet/Solana) : [`doc/deposit.md`](doc/deposit.md).

## License

BSD-3-Clause © Blackcube

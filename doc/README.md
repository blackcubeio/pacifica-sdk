# @blackcube/pacifica-sdk — Documentation

SDK TypeScript pour l'exchange [Pacifica](https://pacifica.fi) (DEX perpetuals sur Solana).
Tout passe par la classe **`Pacifica`** — voir le [README](../README.md) pour la surface complète
(scopes `perp`/`account`/`transfers`/`helpers`/`ws` + namespace `native`, REST vs WebSocket,
exemples). Pacifica n'a **pas** de scope `system()`.

## Sommaire

- [README](../README.md) — la classe `Pacifica`, les scopes, REST vs WebSocket, exemples.
- [Surface commune](./common.md) — le **contrat unifié** (identique sur les 4 SDK Blackcube).
- [Surface native](./native.md) — les capacités **spécifiques à Pacifica** (`dex.native.<cap>()`).
- [Signing](./signing.md) — Ed25519, signers par label, réseau par signer, agent wallets / API
  keys, types d'opérations.
- [Deposit](./deposit.md) — dépôt on-chain (instruction Solana / devnet).

## Rappel : REST vs WebSocket

- **REST** (`perp()`, `account()`, `transfers()` + scopes `native`) — **requête → réponse** : tu
  `await`, tu reçois une valeur.
- **WebSocket** (`ws()`) — **abonnement → flux** : un handler rappelé à chaque mise à jour,
  jusqu'au désabonnement. Socket ouvert au 1er `subscribe`, fermé au dernier `unsubscribe`.

Pacifica est **perp-only** (pas de `spot()`). Tous les retours sont au **format unifié Blackcube**,
identique entre les SDK Aster / Hyperliquid / Pacifica.

# @blackcube/pacifica-sdk — Documentation

SDK TypeScript pour l'exchange [Pacifica](https://pacifica.fi) (DEX perpetuals sur Solana).
Tout passe par la classe **`Pacifica`** — voir le [README](../README.md) pour la surface complète
(scopes `perp`/`account`/`system`/`helpers`/`ws` + `vaults`/`agent`, REST vs WebSocket, exemples).

## Sommaire

- [README](../README.md) — la classe `Pacifica`, les scopes, REST vs WebSocket, exemples.
- [Signing](./signing.md) — Ed25519, signers par label, réseau par signer, agent wallets / API
  keys, types d'opérations.
- [Deposit](./deposit.md) — dépôt on-chain (instruction Solana / devnet).

## Rappel : REST vs WebSocket

- **REST** (`perp()`, `account()`, `system()`) — **requête → réponse** : tu `await`, tu reçois
  une valeur.
- **WebSocket** (`ws()`) — **abonnement → flux** : un handler rappelé à chaque mise à jour,
  jusqu'au désabonnement. Socket ouvert au 1er `subscribe`, fermé au dernier `unsubscribe`.

Pacifica est **perp-only** (pas de `spot()`). Tous les retours sont au **format unifié Blackcube**,
identique entre les SDK Aster / Hyperliquid / Pacifica.

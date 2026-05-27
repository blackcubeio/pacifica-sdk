# REST API — Subaccounts

Création et transferts de sous-comptes (signés). `signer?` sauf `createSubaccount` (double signature).

| Fonction | type signature | Endpoint | Retour |
|---|---|---|---|
| `createSubaccount({ main, sub })` | `subaccount_initiate` + `subaccount_confirm` | `POST /account/subaccount/create` | `void` |
| `listSubaccounts(signer?)` | `list_subaccounts` | `POST /account/subaccount/list` | `Subaccount[]` |
| `transferSubaccountFund({ toAccount, amount }, signer?)` | `transfer_funds` | `POST /account/subaccount/transfer` | `void` |
| `subaccountSpotTransfer({ toAccount, symbol, amount, idempotencyKey? }, signer?)` | `subaccount_spot_transfer` | `POST /account/subaccount/spot_asset/transfer` | `void` |

## createSubaccount — double signature

Le `sub` signe la clé publique du `main` (`subaccount_initiate`), puis le `main` signe la
signature du sub (`subaccount_confirm`), **même timestamp**. `main` et `sub` sont des objets
`Signer`. La requête envoie `main_signature` + `sub_signature`.

```ts
createSubaccount({ main: { secretKey: MAIN_KEY }, sub: { secretKey: SUB_KEY } });
```

## ⚠️ transfer_funds vs subaccount_transfer

`transferSubaccountFund` utilise le type **`transfer_funds`**, **pas** `subaccount_transfer`
comme l'annonce la table operation-types du gitbook. Vérifié empiriquement sur testnet :
`subaccount_transfer` → *"Verification failed"* (signature refusée) ; `transfer_funds` →
acceptée (erreur métier seulement). Le SDK Python est la source correcte ici.

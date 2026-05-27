# REST API — Spot

Actifs spot et bridge (GET publics). Réponses mappées camelCase.

| Fonction | Endpoint | Retour |
|---|---|---|
| `getSpotAssets({ includeInactive?, collateralEnabledOnly? })` | `GET /spot_assets` | `SpotAsset[]` |
| `getBridgeInfo()` | `GET /spot_assets/bridge/info` | `BridgeAsset[]` |
| `getBridgeParams({ symbol })` | `GET /spot_assets/bridge/parameters/{symbol}` | `BridgeAsset` |

```ts
const assets = await getSpotAssets();
const sol = getBridgeParams({ symbol: 'SOL' });
```

## Notes

- `getBridgeParams` utilise un **path param** `{symbol}` (pas un query param).
- `BridgeAsset.mint` est `null` pour le SOL natif.
- `getSpotAssets` accepte les filtres `includeInactive` / `collateralEnabledOnly`.

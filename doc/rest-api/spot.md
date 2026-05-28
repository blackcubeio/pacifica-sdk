# REST API — Spot

Spot assets and bridge (public GET). Responses mapped to camelCase.

| Function | Endpoint | Returns |
|---|---|---|
| `getSpotAssets({ includeInactive?, collateralEnabledOnly? })` | `GET /spot_assets` | `SpotAsset[]` |
| `getBridgeInfo()` | `GET /spot_assets/bridge/info` | `BridgeAsset[]` |
| `getBridgeParams({ symbol })` | `GET /spot_assets/bridge/parameters/{symbol}` | `BridgeAsset` |

```ts
const assets = await getSpotAssets();
const sol = getBridgeParams({ symbol: 'SOL' });
```

## Notes

- `getBridgeParams` uses a **path param** `{symbol}` (not a query param).
- `BridgeAsset.mint` is `null` for native SOL.
- `getSpotAssets` accepts the `includeInactive` / `collateralEnabledOnly` filters.

# REST API — Spot

Spot assets and bridge (public GET). Responses mapped to camelCase.

Authority: 🔓 **Public** — no signer for any function on this page. Each takes a trailing optional
`label?` that selects the network (no label → mainnet; a label → its signer's network).

| Function | Endpoint | Returns |
|---|---|---|
| `getSpotAssets({ includeInactive?, collateralEnabledOnly? }, label?)` | `GET /spot_assets` | `SpotAsset[]` |
| `getBridgeInfo(label?)` | `GET /spot_assets/bridge/info` | `BridgeAsset[]` |
| `getBridgeParams({ symbol }, label?)` | `GET /spot_assets/bridge/parameters/{symbol}` | `BridgeAsset` |

```ts
const assets = await getSpotAssets();
const sol = getBridgeParams({ symbol: 'SOL' });
```

## Notes

- `getBridgeParams` uses a **path param** `{symbol}` (not a query param).
- `BridgeAsset.mint` is `null` for native SOL.
- `getSpotAssets` accepts the `includeInactive` / `collateralEnabledOnly` filters.

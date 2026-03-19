# Google 3D Tiles Nagoya

Google 3D Tiles で再現された名古屋・鶴舞駅周辺の街並みを歩き回れる XRift ワールドです。

## セットアップ

```bash
npm install
```

`.env.example` をコピーして `.env` を作成し、API トークンや表示座標を設定してください。

```bash
cp .env.example .env
```

| 変数 | 説明 | デフォルト |
|------|------|-----------|
| `VITE_GOOGLE_API_TOKEN` | Google Maps Platform の API トークン | — |
| `VITE_TILES_LAT` | 緯度 | `35.1572`（鶴舞駅） |
| `VITE_TILES_LON` | 経度 | `136.9215`（鶴舞駅） |
| `VITE_FLOOR_HEIGHT` | 透明な床の高さ | `109.99` |

> API トークンは [Google Cloud Console](https://console.cloud.google.com/) の「Map Tiles API」を有効化して取得できます。

## 開発

```bash
npm run dev
```

http://localhost:5173 を開くと、一人称視点でワールドを確認できます。

| 操作 | キー |
|------|------|
| 視点操作 | 画面クリックでマウスロック → マウス移動 |
| 移動 | W / A / S / D |
| 上昇 / 下降 | E・Space / Q |
| インタラクト | 照準を合わせてクリック |
| マウスロック解除 | ESC |

## ビルド・デプロイ

```bash
npm run build          # プロダクションビルド
npm run typecheck      # 型チェック
xrift upload world     # XRift にアップロード
```

## 技術スタック

- [React Three Fiber](https://r3f.docs.pmnd.rs/) + [Rapier 物理エンジン](https://rapier.rs/)
- [3d-tiles-renderer](https://github.com/NASA-AMMOS/3DTilesRendererJS) — Google 3D Tiles の描画
- [XRift](https://xrift.net) — Module Federation による動的ワールドロード

## ライセンス

MIT

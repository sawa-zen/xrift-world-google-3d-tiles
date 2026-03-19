# Google 3D Tiles Nagoya

Google 3D Tiles で再現された名古屋・鶴舞駅周辺の街並みを歩き回れる XRift ワールドです。

## セットアップ

```bash
npm install
cp .env.example .env
```

`.env` を開いて Google Maps Platform の API トークンを設定してください。

```
VITE_GOOGLE_API_TOKEN=your_google_api_token_here
```

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

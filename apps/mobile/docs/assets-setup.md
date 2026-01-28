# アプリアイコンとスプラッシュスクリーン設定

## 概要

M4マイルストーンの一環として、アプリアイコンとスプラッシュスクリーンを設定しました。

## 設定内容

### 配置したファイル

```
apps/mobile/assets/
├── icon.png           # アプリアイコン (1024x1024)
├── adaptive-icon.png  # Androidアダプティブアイコン (1024x1024)
├── splash.png         # スプラッシュスクリーン (2048x2048)
└── favicon.png        # Webファビコン
```

### app.json設定

```json
{
  "expo": {
    "name": "Left",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a2e"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## 現在の画像（仮版）

現在配置されている画像は開発用の仮バージョンです：
- **アプリ名**: Left
- **デザイン**: 砂時計モチーフ
- **カラー**: 
  - アイコン: 青〜紫のグラデーション
  - スプラッシュ: ダークネイビー背景（#1a1a2e）に白〜ライトブルーの砂時計
- **スタイル**: ミニマル、モダン、高コントラスト

## 本番用画像の準備

別AIでアイコンを作成する場合、以下の仕様を守ってください：

### 1. アプリアイコン (icon.png)
- **サイズ**: 1024×1024ピクセル（必須）
- **形式**: PNG
- **背景**: 透過または塗りつぶし（どちらでも可）
- **デザイン**: シンプルで視認性の高いもの
- **配置場所**: `apps/mobile/assets/icon.png`

### 2. スプラッシュスクリーン (splash.png)
- **サイズ**: 2048×2048ピクセル以上（推奨）
- **形式**: PNG
- **デザイン**: 中央配置、周囲に余白
- **背景**: `app.json`の`backgroundColor`で指定（現在はダークネイビー #1a1a2e）
- **コントラスト**: 背景色に対して明るい色のアイコンを使用（視認性重視）
- **resizeMode**: `contain`（画像を切らずに表示）
- **配置場所**: `apps/mobile/assets/splash.png`

### 3. Androidアダプティブアイコン (adaptive-icon.png)
- **サイズ**: 1024×1024ピクセル（必須）
- **形式**: PNG（透過背景推奨）
- **セーフゾーン**: 中央864×864ピクセル内に主要部分を配置
- **背景色**: `app.json`の`backgroundColor`で指定（現在は白）
- **配置場所**: `apps/mobile/assets/adaptive-icon.png`

### 4. Webファビコン (favicon.png)
- **サイズ**: アイコンと同じでOK（自動リサイズされる）
- **配置場所**: `apps/mobile/assets/favicon.png`

## アイコン作成のヒント

### テーマ
アプリのコンセプトに合ったモチーフ：
- ⏰ 時計、砂時計
- 📊 進捗バー、グラフ
- ⏳ 時間の流れ
- 💙 人生、活動

### カラースキーム
- 現在の仮版: 青〜紫グラデーション
- 推奨: 落ち着いた色（青、紫、グレー系）
- 避ける: 派手すぎる色、視認性の低い組み合わせ

### デザイン原則
- シンプル: 小さいサイズでも認識できる
- 独自性: 他のアプリと区別できる
- スケーラブル: 様々なサイズで美しく見える

## 画像の差し替え方法

1. 新しい画像を用意
2. ファイル名を同じにして上書き（または置き換え）
3. Expoの開発サーバーを再起動

```bash
cd apps/mobile
rm -rf .expo  # キャッシュをクリア（オプション）
npm start
```

## 動作確認

### iOS/Android
- Expo Goアプリで確認
- アプリ起動時にスプラッシュ画面が表示される
- ホーム画面にアイコンが表示される

### Web
- ブラウザタブにファビコンが表示される

## 参考リンク

- [Expo App Icons Documentation](https://docs.expo.dev/develop/user-interface/app-icons/)
- [Expo Splash Screens Documentation](https://docs.expo.dev/develop/user-interface/splash-screen/)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)

## 次のステップ

- [ ] 別AIで本番用アイコンを作成
- [ ] 画像を差し替え
- [ ] 実機で動作確認
- [ ] ストア向け文言整備（M4完了）

# Left - モバイルアプリ

「時間を大切にする」きっかけを作るアプリです。統計上の目安（平均寿命/設定寿命）までの残り時間を、複数の単位・ビジュアルでいつでも確認できます。

## 特徴

- 📊 残り時間を複数の単位で表示（秒、日、週、月、年、YYYYMMDDHHMMSS形式）
- 📈 人生の進捗バー
- ⏰ 今日の活動時間の残り時間
- 📝 今日/今週の1行メモ
- 💾 ローカルストレージのみ（オフライン対応）

## 技術スタック

- **フレームワーク**: Expo SDK 54 (React Native 0.81)
- **React**: 19.1.0
- **ルーティング**: Expo Router 6.0
- **状態管理**: React Context + useReducer
- **ストレージ**: AsyncStorage
- **言語**: TypeScript 5.9

## プロジェクト構造

```
apps/mobile/
├── app/                    # 画面（Expo Router）
│   ├── _layout.tsx        # ルートレイアウト
│   ├── index.tsx          # ホーム画面
│   └── settings.tsx       # 設定画面
├── src/
│   ├── components/        # 再利用可能なコンポーネント
│   │   ├── FocusBar.tsx   # 1行メモコンポーネント
│   │   ├── LifeBar.tsx    # 人生進捗バー
│   │   ├── TimeValue.tsx  # 時間表示コンポーネント
│   │   └── UnitToggle.tsx # 単位切替コンポーネント
│   ├── core/
│   │   ├── model/         # 型定義
│   │   ├── storage/       # ストレージユーティリティ
│   │   └── time/          # 時間計算・フォーマット
│   └── features/          # 機能別モジュール
│       ├── focus/         # 1行メモ機能
│       └── profile/       # プロフィール機能
└── docs/                  # ドキュメント
    ├── spec.md           # 仕様書
    ├── milestones.md     # マイルストーン
    ├── decisions.md      # 技術決定ログ
    ├── future-features.md # 将来的な拡張機能
    ├── assets-setup.md   # アイコン/スプラッシュ設定
    ├── ui-improvements.md # UI改善ログ
    ├── m2-summary.md     # M2完了レポート
    ├── picker-implementation.md # ピッカー実装ガイド
    └── modal-picker-design.md # モーダルピッカーデザイン

## セットアップ

### 前提条件

- Node.js 18+
- npm または yarn

### インストール

```bash
cd apps/mobile
npm install
```

### 開発サーバーの起動

```bash
npm start
```

または特定のポートで起動:

```bash
npx expo start --port 8082
```

### プラットフォーム別の起動

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 開発

### TypeScript型チェック

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

## アーキテクチャ原則

- **Pure Functions**: `core` モジュールは純関数中心（UIに依存しない）
- **State Management**: 画面はstateを直接変更せず、store経由で操作
- **Documentation**: 変更時は `docs/decisions.md` を必ず更新

## マイルストーン

### M1（MVP）✅
- ✅ Onboarding（初回設定）
- ✅ Home画面（残り時間表示）
- ✅ 人生バー
- ✅ 活動時間の残り
- ✅ 1行メモ（Today/Week切替）

### M2（品質）✅
- ✅ フォーマット改善
- ✅ 設定画面UI改善
- ⏸️ ユニットテスト追加（後続で対応）

### M3（可視化強化）
- Weekグリッド表示
- アニメーション追加

### M4（配布）
- ✅ アイコン/スプラッシュ画像（仮版完了）
- ✅ アプリ名を「Left」に変更
- ストア向け文言整備

### 将来的な拡張（M5以降）
- イベント機能：任意のイベントまでのカウントダウン
- 通知機能：残り時間が少なくなったらアラート
- 詳細は `docs/future-features.md` を参照

## 注意事項

本アプリは統計上の目安です。寿命を予測するものではありません。

## ライセンス

Private

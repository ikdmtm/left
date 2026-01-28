# Time to Avg Life

「時間を大切にする」きっかけを作るアプリのモノレポジトリです。

## プロジェクト構成

```
.
├── apps/
│   └── mobile/           # React Native (Expo) モバイルアプリ
├── .github/
│   └── workflows/
│       └── ci.yml        # CI/CD設定
└── README.md
```

## アプリケーション

### モバイルアプリ (`apps/mobile`)

統計上の目安（平均寿命/設定寿命）までの残り時間を可視化するモバイルアプリケーションです。

**主な機能:**
- 残り時間を複数の単位で表示（秒、日、週、月、年、YYYYMMDDHHMMSS形式）
- 人生の進捗バー
- 今日の活動時間の残り時間
- 今日/今週の1行メモ

**技術スタック:**
- Expo (React Native)
- TypeScript
- AsyncStorage

詳細は [`apps/mobile/README.md`](./apps/mobile/README.md) を参照してください。

## 開発開始

### モバイルアプリの起動

```bash
cd apps/mobile
npm install
npm start
```

## プロジェクトの原則

### North Star
- ユーザーが「時間を大切にする」きっかけになる
- 表現は断定しない（統計の目安）
- 脅し文句や過度な煽りは禁止

### Scope
- MVPは Expo（React Native）+ ローカル保存のみ（AsyncStorage）
- バックエンド無し
- メンタル配慮モードは作らない

### Engineering Principles
- core は純関数中心（calc/format は UI に依存しない）
- 画面は state を直接いじらず store 経由
- 変更時は docs/decisions.md を必ず更新

## CI/CD

GitHub Actions を使用して以下を自動化しています:
- TypeScript 型チェック
- Lint チェック
- テスト実行（該当する場合）

## ライセンス

Private

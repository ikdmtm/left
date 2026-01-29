# TestFlightへのデプロイ手順

## 概要

アプリに修正を加えた後、TestFlightで確認するまでの手順をまとめています。

## 手順

### 1. コードを修正してGitHubにプッシュ

```bash
# 修正を加える
# ...

# 変更をコミット
git add -A
git commit -m "fix: 修正内容の説明"

# GitHubにプッシュ
git push origin main
```

✅ **完了**: コードがGitHubリポジトリに反映されました

---

### 2. EASでiOSビルドを実行

```bash
cd apps/mobile

# キャッシュをクリアしてビルド（推奨）
eas build --platform ios --profile production --clear-cache

# または、キャッシュを使用してビルド（高速）
eas build --platform ios --profile production
```

**ビルドオプション**:
- `--clear-cache`: キャッシュをクリアして確実にビルド（依存関係更新時は必須）
- `--profile production`: 本番用プロファイル（ビルド番号が自動インクリメント）

**ビルド時の対話**:
1. Apple Developerアカウントへのログインを求められる場合があります
2. 証明書やプロビジョニングプロファイルの確認があります
3. ビルドが開始されると、EASサーバーでビルドが実行されます

**ビルド時間**: 通常10〜20分程度

---

### 3. ビルドの完了を確認

**方法1: ターミナルで確認**
- ビルドコマンドを実行したターミナルでログを確認
- 完了すると、ビルドURLが表示されます

**方法2: EAS Webダッシュボードで確認**
1. https://expo.dev/ にアクセス
2. プロジェクト「Left」を選択
3. 「Builds」タブでビルド状況を確認
4. ✅ マークが表示されたら完了

**方法3: メール通知**
- ビルド完了時にメールが届きます

---

### 4. TestFlightへの自動送信

EASでビルドが成功すると、**自動的にApp Store ConnectとTestFlightに送信されます**。

**処理時間**: 
- ビルド完了後、5〜15分程度でTestFlightに反映されます
- Appleの自動処理が完了するまで待つ必要があります

---

### 5. TestFlightでビルドを確認

1. **App Store Connectにログイン**
   - https://appstoreconnect.apple.com/
   
2. **「マイApp」→「Left」を選択**

3. **「TestFlight」タブに移動**

4. **新しいビルドが表示されるのを待つ**
   - 「処理中」と表示される場合は、Appleの自動処理中です
   - 「テストの準備完了」と表示されたら、テスト可能です

5. **内部テスター/外部テスターに配信**
   - 内部テスター: 自動的に通知されます
   - 外部テスター: 手動で新しいビルドを追加する必要があります

---

### 6. デバイスでTestFlightアプリから更新

1. **TestFlightアプリを開く**

2. **「Left」アプリを選択**

3. **新しいビルドが表示されたら「インストール」または「更新」をタップ**

4. **アプリが更新されます**

5. **修正内容を確認**

---

## ビルド番号について

`eas.json`の設定により、`production`プロファイルでは**ビルド番号が自動的にインクリメント**されます。

```json
"production": {
  "autoIncrement": true
}
```

- ビルド1 → ビルド2 → ビルド3 ... と自動的に増加
- TestFlightでは常に最新のビルド番号が表示されます

---

## トラブルシューティング

### ビルドが失敗する

**原因1: 依存関係の問題**
```bash
# package-lock.jsonを更新
cd apps/mobile
npm install

# 変更をコミット
git add package-lock.json
git commit -m "fix: update package-lock.json"
git push origin main

# キャッシュをクリアして再ビルド
eas build --platform ios --profile production --clear-cache
```

**原因2: 証明書の問題**
```bash
# 証明書を再生成
eas credentials
```

**原因3: app.jsonの設定ミス**
- bundleIdentifier、versionなどを確認

### TestFlightに表示されない

**確認ポイント**:
1. ビルドが正常に完了したか（EASダッシュボードで確認）
2. App Store Connectで「処理中」になっていないか
3. Appleアカウントの権限があるか

**待ち時間**:
- ビルド完了後、最大30分程度かかる場合があります
- 「処理中」の場合は、Appleのサーバー側の処理を待ちます

### 更新が反映されない

1. **キャッシュをクリアしてビルド**
   ```bash
   eas build --platform ios --profile production --clear-cache
   ```

2. **デバイスでアプリを完全に削除して再インストール**

3. **ビルド番号が増えているか確認**
   - app.jsonのversionやbuildNumberを確認

---

## 高速化のヒント

### 開発中の高速イテレーション

**方法1: Expo Go（開発用）**
```bash
cd apps/mobile
npm start
```
- コード変更が即座に反映
- ビルド不要
- ただし、ネイティブコードの変更は反映されない

**方法2: development build**
```bash
eas build --platform ios --profile development
```
- カスタムネイティブコードも含む
- Expo Goより柔軟

**方法3: キャッシュを使用したビルド**
```bash
eas build --platform ios --profile production
# --clear-cache を付けない
```
- 依存関係が変わっていない場合は高速

---

## まとめ

### 標準的なフロー（今回の修正）

```bash
# 1. コード修正
vim apps/mobile/app/settings.tsx

# 2. コミット&プッシュ
git add -A
git commit -m "fix: 活動終了時刻を23時以降も選択可能に"
git push origin main

# 3. EASビルド
cd apps/mobile
eas build --platform ios --profile production --clear-cache

# 4. 待つ（10〜20分）
# EASビルド → TestFlight自動送信 → Apple処理

# 5. TestFlightで確認
# TestFlightアプリから更新して確認
```

### 所要時間の目安

- コード修正: 数分〜数時間
- Git操作: 1分未満
- EASビルド: 10〜20分
- TestFlight反映: 5〜15分
- **合計: 約20〜40分**

---

## 参考リンク

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Expo Dashboard](https://expo.dev/)

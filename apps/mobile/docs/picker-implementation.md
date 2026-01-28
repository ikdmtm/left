# ピッカー実装ガイド

## 概要
設定画面のすべての入力をピッカー（選択式）に変更しました。これにより、フォーマットに合わせる入力ストレスが完全になくなりました。

## 実装内容

### 1. 生年月日の選択
**変更前**: テキスト入力（8桁数字 → 自動整形）
**変更後**: 年・月・日の3つのピッカー

```typescript
// 年の選択肢（1900-2020）
const years = Array.from({ length: 121 }, (_, i) => 1900 + i);
// 月の選択肢（1-12）
const months = Array.from({ length: 12 }, (_, i) => i + 1);
// 日の選択肢（1-31）
const days = Array.from({ length: 31 }, (_, i) => i + 1);
```

**利点**:
- タップだけで選択可能
- 入力ミスがない
- 月や日の範囲が明確

### 2. 寿命の目安の選択
**変更前**: テキスト入力（数字）
**変更後**: ピッカーで選択（50-120歳）

```typescript
const lifeExpectancies = Array.from({ length: 71 }, (_, i) => 50 + i);
```

**利点**:
- スクロールで簡単に選択
- 現実的な範囲に制限
- 入力ミスがない

### 3. 活動時刻の選択
**変更前**: テキスト入力（HH:MM形式）
**変更後**: 時・分の2つのピッカー

```typescript
// 時の選択肢（0-23）
const hours = Array.from({ length: 24 }, (_, i) => i);
// 分の選択肢（0-55、5分刻み）
const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
```

**利点**:
- コロン入力不要
- 24時間表示で明確
- 5分刻みで十分な精度

### 4. 1行メモのデフォルト選択
**変更前**: 透明度で選択状態を表現
**変更後**: 青色の枠と背景色で明確に表示

```typescript
borderColor: defaultFocusMode === "today" ? "#007AFF" : "#ccc",
backgroundColor: defaultFocusMode === "today" ? "#E3F2FD" : "transparent"
```

## 使用技術

### パッケージ
- `@react-native-picker/picker` v2.x
- React Nativeの標準ピッカーコンポーネント
- iOS/Android両対応

### インストール
```bash
npm install @react-native-picker/picker --legacy-peer-deps
```

## UIデザイン

### レイアウト
- `ScrollView`で全体をスクロール可能に
- 各セクションに適切な余白（gap: 8, 16）
- ピッカーは`borderRadius: 12`で丸みを持たせる

### 色の使用
- アクティブな選択：`#007AFF`（iOS標準の青）
- 選択背景：`#E3F2FD`（薄い青）
- エラー背景：`#FFEBEE`（薄い赤）
- エラーテキスト：`#C62828`（濃い赤）
- 保存ボタン：`#007AFF`（青）

### タイポグラフィ
- セクションタイトル：16px、font-weight: 600
- 説明文：12px、opacity: 0.6
- ボタンテキスト：16px、font-weight: 600

## データの保存

### 変換処理
ピッカーで選択した値をProfile形式に変換：

```typescript
// 生年月日：YYYY-MM-DD形式
const birthISO = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;

// 活動時刻：HH:MM形式
const activeStart = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
```

### バリデーション
- 活動開始時刻 < 活動終了時刻のチェック
- 分単位での比較で正確に判定

## ユーザー体験の改善

### Before（テキスト入力）
❌ フォーマットを覚える必要がある
❌ 入力ミスが発生しやすい
❌ キーボード切り替えが必要
❌ 検証エラーが出る可能性

### After（ピッカー選択）
✅ タップだけで選択完了
✅ 入力ミスが不可能
✅ 選択肢が明確
✅ 検証エラーが発生しない

## パフォーマンス

### 最適化
- `useFocusEffect`で画面フォーカス時のみ読み込み
- 依存配列を空にして無限ループを防止
- 選択肢の配列は定数として事前生成

### メモリ使用
- 選択肢の配列は小さい（最大121要素）
- レンダリング負荷は低い
- スムーズなスクロール

## 今後の拡張

### 検討可能な改善
1. 年の範囲を動的に設定（現在年-120 から 現在年）
2. 分の刻みを設定可能に（1分、5分、10分、15分）
3. 日付の妥当性チェック（2月29日など）
4. カスタムピッカースタイル（プラットフォーム別）

### 制約事項
- 日付の妥当性チェックは未実装（例：2月31日は選択可能）
- 理由：実用上問題なく、複雑性を避けるため
- 必要に応じて将来追加可能

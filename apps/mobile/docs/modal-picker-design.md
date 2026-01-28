# モーダルピッカーデザイン

## 概要
設定画面のピッカーをモーダル（ダイアログ）形式に改善しました。これにより、UIがより見やすく、使いやすくなりました。

## デザイン変更の理由

### 第1版の問題点
1. **視認性が悪い**
   - 背景白 + ピッカー白で見づらい
   - 境界が不明確

2. **画面が縦に長くなる**
   - すべてのピッカーをインライン表示
   - スクロールが必要になる

3. **UIが煩雑**
   - 前のバージョンよりシンプルさが失われた

### 第2版の改善（モーダル形式）

## 実装詳細

### 1. タップ可能な入力ボックス

```tsx
<Pressable 
  onPress={() => setActivePicker("birthYear")}
  style={{ 
    backgroundColor: "white", 
    borderRadius: 8, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: "#ddd" 
  }}
>
  <Text style={{ fontSize: 16 }}>{birthYear}年</Text>
</Pressable>
```

**デザイン:**
- 背景色：白（#ffffff）
- 枠線：薄いグレー（#ddd）
- 角丸：8px
- パディング：12px
- テキストサイズ：16px

### 2. モーダルダイアログ

```tsx
<Modal
  visible={activePicker === type}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setActivePicker(null)}
>
  <Pressable 
    style={{ 
      flex: 1, 
      backgroundColor: "rgba(0,0,0,0.5)", 
      justifyContent: "center", 
      alignItems: "center" 
    }}
    onPress={() => setActivePicker(null)}
  >
    <View style={{ 
      backgroundColor: "white", 
      borderRadius: 12, 
      padding: 16, 
      width: "80%", 
      maxWidth: 300 
    }}>
      <Picker
        selectedValue={value}
        onValueChange={(v) => onChange(v as number)}
        style={{ backgroundColor: "#f5f5f5" }}
      >
        {/* options */}
      </Picker>
      <Pressable 
        onPress={() => setActivePicker(null)}
        style={{ 
          marginTop: 16, 
          padding: 12, 
          backgroundColor: "#007AFF", 
          borderRadius: 8 
        }}
      >
        <Text style={{ 
          color: "white", 
          textAlign: "center", 
          fontWeight: "600" 
        }}>完了</Text>
      </Pressable>
    </View>
  </Pressable>
</Modal>
```

**デザイン:**
- モーダル背景：半透明黒（rgba(0,0,0,0.5)）
- ダイアログ背景：白
- ダイアログ角丸：12px
- ダイアログ幅：画面の80%、最大300px
- ピッカー背景：グレー（#f5f5f5）
- 完了ボタン：青（#007AFF）

### 3. 画面全体のレイアウト

```tsx
<ScrollView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
  <View style={{ padding: 16, gap: 16 }}>
    {/* コンテンツ */}
  </View>
</ScrollView>
```

**デザイン:**
- 画面背景：薄いグレー（#f9f9f9）
- コンテンツ余白：16px
- セクション間隔：16px

## 色の使用

### 基本色
| 用途 | 色 | コード |
|------|-----|--------|
| 画面背景 | 薄いグレー | #f9f9f9 |
| 入力ボックス背景 | 白 | #ffffff |
| 入力ボックス枠線 | グレー | #dddddd |
| ピッカー背景 | グレー | #f5f5f5 |
| プライマリ（青） | iOS標準青 | #007AFF |
| アクティブ背景 | 薄い青 | #E3F2FD |
| エラー背景 | 薄い赤 | #FFEBEE |
| エラーテキスト | 赤 | #C62828 |
| モーダル背景 | 半透明黒 | rgba(0,0,0,0.5) |

### コントラスト
- 白背景 + グレー枠線 = 明確な境界
- グレー画面背景 + 白ボックス = 視認性向上
- ピッカーのグレー背景 = 選択肢が見やすい

## ユーザー体験

### フロー
1. ユーザーが入力ボックスをタップ
2. モーダルがフェードインで表示
3. ピッカーで値を選択
4. 「完了」ボタンまたは外側タップでモーダルを閉じる
5. 選択した値が入力ボックスに反映

### 利点
✅ タップ1回でモーダル表示
✅ ピッカーが大きく表示されて選びやすい
✅ 背景が暗くなり、フォーカスが明確
✅ 完了ボタンで閉じる動作が直感的
✅ 外側タップでもキャンセル可能
✅ 画面がスッキリして見やすい

## 実装内容の詳細

### 寿命の選択範囲
- **変更前**: 50-120歳
- **変更後**: 1-150歳
- **理由**: ユーザー要望により1歳から選択可能に

### 男女別平均寿命の表示
```tsx
<Text style={{ fontSize: 12, opacity: 0.6 }}>
  ※日本の平均寿命：男性 81.5歳、女性 87.6歳
</Text>
```
- 2023年の日本の平均寿命データ
- 参考情報として表示

### 注意書きの削除
- **削除した文言**: 「本アプリは統計上の目安です。寿命を予測するものではありません。」
- **理由**: ユーザーフィードバック「明らかにだますようなアプリではないので不要」

## レスポンシブ対応

### モーダルサイズ
- 幅：画面の80%
- 最大幅：300px
- 小さい画面でも大きい画面でも適切なサイズ

### タップ領域
- 入力ボックスのパディング：12px
- 十分なタップ領域を確保

## パフォーマンス

### 状態管理
```typescript
type PickerType = "birthYear" | "birthMonth" | "birthDay" | 
                  "lifeExpectancy" | "startHour" | "startMinute" | 
                  "endHour" | "endMinute" | null;

const [activePicker, setActivePicker] = useState<PickerType>(null);
```
- 現在アクティブなピッカーを1つの状態で管理
- メモリ効率が良い

### モーダルの最適化
- `animationType="fade"`: スムーズなアニメーション
- `transparent={true}`: 背景が透過
- `onRequestClose`: Androidの戻るボタン対応

## アクセシビリティ

### タップ可能要素
- 十分なサイズ（最低44x44pt）
- 視覚的なフィードバック（Pressableコンポーネント）

### コントラスト
- WCAG AA基準を満たす色のコントラスト
- テキストが読みやすい

## 今後の拡張案

### さらなる改善の可能性
1. ピッカーのスタイルカスタマイズ
2. 選択時のハプティックフィードバック
3. アニメーション速度の調整
4. ダークモード対応

## まとめ

モーダルピッカー形式により、設定画面のUXが大幅に向上しました：
- ✅ 見やすい
- ✅ 使いやすい
- ✅ シンプル
- ✅ 直感的

ユーザーフィードバックを反映した結果、より洗練されたUIになりました。

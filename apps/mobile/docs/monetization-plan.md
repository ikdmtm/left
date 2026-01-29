# 広告実装プラン

## 概要

Leftアプリに広告を導入し、収益化を図ります。ただし、**UXを最優先**とし、ユーザー体験を損なわない形で実装します。

## 広告プラットフォーム：Google AdMob

### 選定理由
- ✅ Expoとの互換性が高い（expo-ads-admob）
- ✅ 業界標準で信頼性が高い
- ✅ 充実したドキュメント
- ✅ 多様な広告フォーマット
- ✅ 高いフィルレート（広告表示率）

### 代替案
- Facebook Audience Network（より高い収益性だが、プライバシー懸念）
- Unity Ads（ゲーム向け）
- 複数プラットフォーム併用（メディエーション）

## 必要な登録・準備

### 1. Google AdMobアカウント作成
- **URL**: https://admob.google.com/
- **要件**: Googleアカウント
- **手順**:
  1. AdMobにサインイン
  2. アプリを登録
  3. アプリIDを取得
  4. 広告ユニットを作成

### 2. アプリID取得
- **iOS用アプリID**: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`
- **Android用アプリID**: `ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ`

### 3. 広告ユニットID作成
各広告タイプごとにユニットIDを作成：
- バナー広告用
- インタースティシャル広告用
- リワード広告用

### 4. プライバシーポリシー作成 ✅
- **ステータス**: 作成済み
- **URL**: https://ikdmtm.github.io/left-privacy/
- **内容**: データ収集なし、ローカルストレージのみ使用
- **設置場所**: 
  - ✅ アプリ内の設定画面にリンク
  - ✅ app.jsonに登録済み

### 5. iOS App Tracking Transparency (ATT)
- iOS 14.5以降では追跡許可の要求が必須
- `expo-tracking-transparency`を使用

## UXを損なわない広告配置戦略

### 推奨する広告配置

#### 1. 控えめなバナー広告（最優先）
**配置場所**: 設定画面の最下部
- ✅ メインコンテンツ（残り時間表示）に影響しない
- ✅ ユーザーの視線に入りにくい場所
- ✅ 常時表示でも邪魔にならない
- サイズ: 320x50 (Standard Banner)

**実装例**:
```typescript
// settings.tsx の最下部
<ScrollView>
  {/* 設定内容 */}
  <View style={styles.adContainer}>
    <AdMobBanner
      adUnitID="ca-app-pub-xxxxx/yyyyy"
      servePersonalizedAds={false} // GDPR対応
    />
  </View>
</ScrollView>
```

#### 2. リワード広告（最もUXフレンドリー）
**使用場面**: ユーザーが選択できる形で
- ✅ 完全にオプション
- ✅ 見返りを提供（例：テーマ解放、機能追加）
- ✅ ユーザーが能動的に選択

**実装例**:
```typescript
// 設定画面に「広告を見てテーマを解放」ボタン
<Button 
  title="広告を見て新しいテーマを解放する（任意）"
  onPress={showRewardedAd}
/>
```

**報酬の例**:
- カスタムテーマの解放
- 追加の統計機能
- 広告非表示期間（1日、1週間など）

#### 3. インタースティシャル広告（慎重に使用）
**使用場面**: 限定的なタイミングのみ
- ⚠️ アプリ起動時は絶対に避ける
- ✅ 設定保存後（1日1回まで）
- ✅ 履歴画面から戻る時（週1回まで）

**頻度制限**:
```typescript
// 最後の表示から24時間経過後のみ表示
const MIN_INTERVAL = 24 * 60 * 60 * 1000; // 24時間
if (Date.now() - lastAdShown > MIN_INTERVAL) {
  showInterstitial();
}
```

### 絶対に避けるべき配置
- ❌ ホーム画面（メインの残り時間表示）
- ❌ アプリ起動直後
- ❌ 1行メモ編集中
- ❌ 頻繁に表示されるインタースティシャル
- ❌ 人生バーの近く（視覚的に重要）

## 技術実装

### 1. 依存関係のインストール

```bash
cd apps/mobile

# AdMob（Expo SDK 50以降の推奨方法）
npx expo install expo-ads-admob

# iOS ATT対応
npx expo install expo-tracking-transparency

# 設定情報の保存用（広告表示タイミング管理）
# 既にインストール済み: @react-native-async-storage/async-storage
```

**注意**: Expo SDK 54の場合、`expo-ads-admob`は非推奨になっている可能性があります。
代替案：
- `react-native-google-mobile-ads`（推奨）
- カスタムネイティブモジュール

### 2. app.json設定

```json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "userTrackingPermission": "このアプリは広告のパーソナライズのために利用状況を使用します。"
        }
      ]
    ],
    "ios": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
      }
    },
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
      }
    }
  }
}
```

### 3. コンポーネント実装例

#### AdBanner.tsx（再利用可能なバナー広告）
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AdMobBanner } from 'expo-ads-admob';

interface AdBannerProps {
  adUnitID: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ adUnitID }) => {
  return (
    <View style={styles.container}>
      <AdMobBanner
        bannerSize="banner"
        adUnitID={adUnitID}
        servePersonalizedAds={false} // GDPR対応
        onDidFailToReceiveAdWithError={(error) => {
          console.log('Ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
});
```

#### useRewardedAd.ts（リワード広告フック）
```typescript
import { useState, useCallback } from 'react';
import { AdMobRewarded } from 'expo-ads-admob';

export const useRewardedAd = (adUnitID: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const showAd = useCallback(async (onReward: () => void) => {
    setIsLoading(true);
    try {
      await AdMobRewarded.setAdUnitID(adUnitID);
      await AdMobRewarded.requestAdAsync();
      await AdMobRewarded.showAdAsync();
      
      // 報酬を付与
      onReward();
    } catch (error) {
      console.log('Rewarded ad error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [adUnitID]);

  return { showAd, isLoading };
};
```

#### useAdFrequency.ts（広告表示頻度管理）
```typescript
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AD_LAST_SHOWN_KEY = '@ad_last_shown';
const MIN_INTERVAL = 24 * 60 * 60 * 1000; // 24時間

export const useAdFrequency = () => {
  const [canShowAd, setCanShowAd] = useState(false);

  useEffect(() => {
    checkAdFrequency();
  }, []);

  const checkAdFrequency = async () => {
    try {
      const lastShownStr = await AsyncStorage.getItem(AD_LAST_SHOWN_KEY);
      if (!lastShownStr) {
        setCanShowAd(true);
        return;
      }

      const lastShown = parseInt(lastShownStr, 10);
      const timeSince = Date.now() - lastShown;
      setCanShowAd(timeSince > MIN_INTERVAL);
    } catch (error) {
      console.error('Error checking ad frequency:', error);
      setCanShowAd(true);
    }
  };

  const markAdShown = async () => {
    try {
      await AsyncStorage.setItem(AD_LAST_SHOWN_KEY, Date.now().toString());
      setCanShowAd(false);
    } catch (error) {
      console.error('Error marking ad shown:', error);
    }
  };

  return { canShowAd, markAdShown };
};
```

### 4. 設定画面への統合

```typescript
// settings.tsx
import { AdBanner } from '../components/AdBanner';

export default function SettingsScreen() {
  return (
    <ScrollView>
      {/* 既存の設定内容 */}
      
      {/* 最下部に広告 */}
      <AdBanner adUnitID="ca-app-pub-xxxxx/yyyyy" />
    </ScrollView>
  );
}
```

## テスト方法

### 開発時のテスト用広告ID

**重要**: 開発時は必ずテスト用IDを使用してください。本番IDでのテストはアカウント停止のリスクがあります。

```typescript
// constants/ads.ts
export const AD_UNIT_IDS = {
  banner: {
    ios: __DEV__ 
      ? 'ca-app-pub-3940256099942544/2934735716' // テスト用
      : 'ca-app-pub-xxxxx/your-ios-banner-id',
    android: __DEV__
      ? 'ca-app-pub-3940256099942544/6300978111' // テスト用
      : 'ca-app-pub-xxxxx/your-android-banner-id',
  },
  rewarded: {
    ios: __DEV__
      ? 'ca-app-pub-3940256099942544/1712485313' // テスト用
      : 'ca-app-pub-xxxxx/your-ios-rewarded-id',
    android: __DEV__
      ? 'ca-app-pub-3940256099942544/5224354917' // テスト用
      : 'ca-app-pub-xxxxx/your-android-rewarded-id',
  },
};
```

## プライバシーとコンプライアンス

### 1. プライバシーポリシー

必須項目：
- Google AdMobを使用していること
- 広告配信のためにデータが収集されること
- ユーザーがパーソナライズ広告をオプトアウトできること
- Cookie/広告IDの使用について

テンプレート：
```markdown
## 広告について

本アプリでは、Google AdMobを使用して広告を配信しています。
AdMobは、広告配信のためにユーザーの利用状況に関する情報を収集する場合があります。

詳細については、以下をご確認ください：
- Googleのプライバシーポリシー: https://policies.google.com/privacy
- AdMobのヘルプ: https://support.google.com/admob/answer/6128543

パーソナライズ広告を無効にしたい場合は、
デバイスの設定からオプトアウトすることができます。
```

### 2. GDPR対応（EU）

```typescript
// ユーザーに同意を求める
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const requestAdConsent = async () => {
  const { status } = await requestTrackingPermissionsAsync();
  if (status === 'granted') {
    // パーソナライズ広告を表示
    return true;
  } else {
    // 非パーソナライズ広告を表示
    return false;
  }
};
```

### 3. COPPA対応（子供向け）

Leftアプリは一般ユーザー向けですが、念のため：

```typescript
// 13歳未満のユーザーには広告を表示しない
// または、子供向けとしてタグ付け
AdMobBanner.tagForChildDirectedTreatment(true);
```

## 収益化戦略

### フェーズ1: ミニマル広告（MVP）
- 設定画面下部のバナー広告のみ
- 控えめで非侵襲的
- ユーザーフィードバックを収集

### フェーズ2: リワード広告導入
- 新しいテーマやカラースキームの解放
- 追加の統計機能
- ユーザーが価値を感じる報酬を提供

### フェーズ3: プレミアム版検討
- 広告なし版（買い切りまたはサブスク）
- 追加機能（イベント機能など）
- 収益の多角化

## 実装チェックリスト

### 事前準備
- [ ] Google AdMobアカウント作成
- [ ] アプリをAdMobに登録
- [ ] iOS/Android用アプリIDを取得
- [ ] 広告ユニットID作成（バナー、リワード）
- [x] プライバシーポリシー作成 ✅
- [x] プライバシーポリシーをWebに公開 ✅
- [x] アプリ内にプライバシーポリシーへのリンク追加 ✅

### 開発
- [ ] expo-ads-admobまたは代替ライブラリをインストール
- [ ] expo-tracking-transparencyをインストール
- [ ] app.jsonに広告設定を追加
- [ ] AdBannerコンポーネント作成
- [ ] 設定画面に広告を配置
- [ ] テスト用IDで動作確認
- [ ] 広告表示頻度管理の実装
- [ ] GDPR/ATT対応実装

### テスト
- [ ] iOS実機でテスト広告が表示されるか確認
- [ ] Android実機でテスト広告が表示されるか確認
- [ ] 広告非表示時の動作確認
- [ ] 広告読み込み失敗時のUI確認
- [ ] 頻度制限が正しく動作するか確認

### リリース前
- [ ] テスト用IDを本番IDに置き換え
- [ ] プライバシーポリシーへのリンクを設定画面に追加
- [ ] App StoreのプライバシーQuestionnaire記入
- [ ] Google Play Storeのデータ安全セクション記入
- [ ] ユーザーにオプトアウト方法を提供

### リリース後
- [ ] AdMobコンソールで収益を確認
- [ ] ユーザーフィードバックを収集
- [ ] 広告のパフォーマンスを分析
- [ ] UXへの影響を評価

## パフォーマンス考慮事項

- **初期読み込み**: 広告はバックグラウンドで非同期に読み込む
- **メモリ使用**: 広告キャッシュを適切に管理
- **ネットワーク**: オフライン時の広告非表示対応
- **バッテリー**: 広告更新頻度を最適化

## 代替収益化オプション

### プレミアム機能（IAP）
- 広告非表示
- カスタムテーマ
- イベント機能の早期アクセス
- データエクスポート機能

### サブスクリプション
- 月額/年額で広告非表示 + 全機能
- 継続的な収益源

### スポンサーシップ
- 時間管理ツール企業とのパートナーシップ
- 非侵襲的なブランド表示

## 参考リンク

- [Google AdMob公式サイト](https://admob.google.com/)
- [Expo広告ドキュメント](https://docs.expo.dev/versions/latest/sdk/admob/)
- [react-native-google-mobile-ads](https://github.com/invertase/react-native-google-mobile-ads)
- [AdMob ポリシー](https://support.google.com/admob/answer/6128543)
- [iOS App Tracking Transparency](https://developer.apple.com/app-store/user-privacy-and-data-use/)

## まとめ

**推奨アプローチ**:
1. まず設定画面の最下部にバナー広告のみを配置（最もUXフレンドリー）
2. ユーザー反応を見ながらリワード広告を追加検討
3. 将来的にプレミアム版を提供して収益を多角化

**成功の鍵**:
- ユーザー体験を最優先
- 控えめで非侵襲的な広告配置
- 透明性の高いプライバシーポリシー
- ユーザーに選択肢を提供（オプトアウト、リワード広告）

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, Keyboard, SafeAreaView } from "react-native";
import { Link, useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";

import type { Unit } from "../src/core/model/types";
import { UnitToggle } from "../src/components/UnitToggle";
import { TimeValue } from "../src/components/TimeValue";
import { LifeBar } from "../src/components/LifeBar";
import { FocusBar } from "../src/components/FocusBar";

import { useProfileStore } from "../src/features/profile/store";
import { loadProfile } from "../src/features/profile/persistence";

import { calcLife, parseBirthISOToMs, calcTodayActiveRemainingMs } from "../src/core/time/calc";
import { formatRemaining, formatDateTime, formatDurationHMS } from "../src/core/time/format";

export default function Home() {
  const router = useRouter();
  const { state, load } = useProfileStore();
  const [unit, setUnit] = useState<Unit>("seconds");
  const [now, setNow] = useState<Date>(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const focusBarY = useRef<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

  // 画面がフォーカスされるたびにプロフィールを再読み込み
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const p = await loadProfile();
        load(p);
        if (!p) router.replace("/settings");
      })();
    }, [load, router])
  );

  // 更新頻度：秒モードのみ1秒、それ以外は1分
  useEffect(() => {
    const interval = unit === "seconds" ? 1000 : 60_000;
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [unit]);

  // 今日の活動時間の残りは常に1秒ごとに更新
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // キーボードイベントのリスナー
  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const profile = state.profile;
  const computed = useMemo(() => {
    if (!profile) return null;
    const birthMs = parseBirthISOToMs(profile.birthISO);
    const nowMs = now.getTime();
    const life = calcLife(nowMs, birthMs, profile.lifeExpectancyYears);
    const endDate = new Date(life.endMs);
    const activeRemainingMs = calcTodayActiveRemainingMs(now, profile);
    
    // 活動時間の進捗を計算
    const [startH, startM] = profile.activeStart.split(":").map(Number);
    const [endH, endM] = profile.activeEnd.split(":").map(Number);
    const startMs = (startH * 60 + startM) * 60 * 1000;
    let endMs = (endH * 60 + endM) * 60 * 1000;
    
    // 終了時刻が開始時刻以下の場合は翌日として扱う（24時間加算）
    if (endMs <= startMs) {
      endMs += 24 * 60 * 60 * 1000;
    }
    
    const totalActiveMs = endMs - startMs;
    const elapsedActiveMs = Math.max(0, totalActiveMs - activeRemainingMs);
    const activeProgress = totalActiveMs > 0 ? elapsedActiveMs / totalActiveMs : 0;
    
    return { ...life, endDate, activeRemainingMs, activeProgress };
  }, [profile, now]);

  if (!state.loaded) {
    return <View style={{ padding: 16 }}><Text>Loading...</Text></View>;
  }
  if (!profile || !computed) {
    return (
      <View style={{ padding: 16, gap: 12 }}>
        <Text>プロフィールが未設定です</Text>
        <Pressable onPress={() => router.push("/settings")} style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
          <Text>設定へ</Text>
        </Pressable>
      </View>
    );
  }

  function handleFocusBarFocus() {
    setTimeout(() => {
      // 上部に40pxの余白を持たせてスクロール
      const targetY = Math.max(0, focusBarY.current - 40);
      scrollViewRef.current?.scrollTo({ y: targetY, animated: false });
    }, 50);
  }

  function handleFocusBarLayout(y: number) {
    focusBarY.current = y;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 500 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isKeyboardVisible}
        >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>残りの時間</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Link href="/history" asChild>
              <Pressable style={{ padding: 10, borderWidth: 1, borderRadius: 12 }}>
                <Text>履歴</Text>
              </Pressable>
            </Link>
            <Link href="/settings" asChild>
              <Pressable style={{ padding: 10, borderWidth: 1, borderRadius: 12 }}>
                <Text>設定</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <UnitToggle value={unit} onChange={setUnit} />
        </View>

        <View style={{ marginBottom: 16 }}>
          <TimeValue label="残り" value={formatRemaining(computed.remainingMs, unit)} />
        </View>

        <Text style={{ opacity: 0.7, marginBottom: 16 }}>
          到達予定：{formatDateTime(computed.endDate)}
        </Text>

        <View style={{ marginBottom: 16 }}>
          <LifeBar progress={computed.progress} />
        </View>

        <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 6, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "600" }}>今日の活動時間の残り</Text>
            <Text style={{ fontSize: 12, opacity: 0.6 }}>{profile.activeStart}〜{profile.activeEnd}</Text>
          </View>
          
          <Text style={{ fontSize: 22, fontWeight: "600" }}>{formatDurationHMS(computed.activeRemainingMs)}</Text>
          
          {/* 活動時間の進捗バー */}
          <View style={{ height: 12, borderWidth: 1, borderRadius: 999, overflow: "hidden", backgroundColor: "#f0f0f0" }}>
            <View 
              style={{ 
                height: "100%", 
                width: `${Math.min(100, computed.activeProgress * 100)}%`, 
                backgroundColor: "#2196F3" 
              }} 
            />
          </View>
        </View>

        <FocusBar 
          defaultMode={profile.defaultFocusMode} 
          onFocus={handleFocusBarFocus}
          onViewLayout={handleFocusBarLayout}
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";

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

  useEffect(() => {
    (async () => {
      const p = await loadProfile();
      load(p);
      if (!p) router.replace("/settings");
    })();
  }, [load, router]);

  // 更新頻度：秒モードのみ1秒、それ以外は1分
  useEffect(() => {
    const interval = unit === "seconds" ? 1000 : 60_000;
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [unit]);

  const profile = state.profile;
  const computed = useMemo(() => {
    if (!profile) return null;
    const birthMs = parseBirthISOToMs(profile.birthISO);
    const nowMs = now.getTime();
    const life = calcLife(nowMs, birthMs, profile.lifeExpectancyYears);
    const endDate = new Date(life.endMs);
    const activeRemainingMs = calcTodayActiveRemainingMs(now, profile);
    return { ...life, endDate, activeRemainingMs };
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

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>残り（目安）</Text>
        <Link href="/settings" asChild>
          <Pressable style={{ padding: 10, borderWidth: 1, borderRadius: 12 }}>
            <Text>設定</Text>
          </Pressable>
        </Link>
      </View>

      <UnitToggle value={unit} onChange={setUnit} />

      <TimeValue label="残り" value={formatRemaining(computed.remainingMs, unit)} />
      <Text style={{ opacity: 0.7 }}>
        到達予定：{formatDateTime(computed.endDate)}
      </Text>
      <Text style={{ opacity: 0.7 }}>
        注意：本アプリは統計上の目安です。寿命を予測するものではありません。
      </Text>

      <LifeBar progress={computed.progress} />

      <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 6 }}>
        <Text style={{ fontWeight: "600" }}>今日の活動時間の残り</Text>
        <Text style={{ fontSize: 22, fontWeight: "600" }}>{formatDurationHMS(computed.activeRemainingMs)}</Text>
        <Text style={{ opacity: 0.7 }}>
          活動時間：{profile.activeStart}〜{profile.activeEnd}
        </Text>
      </View>

      <FocusBar defaultMode={profile.defaultFocusMode} />
    </View>
  );
}

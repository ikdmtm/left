import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";

import type { Profile, FocusMode } from "../src/core/model/types";
import { useProfileStore } from "../src/features/profile/store";
import { loadProfile, saveProfile } from "../src/features/profile/persistence";

function isHHMM(s: string) {
  return /^\d{2}:\d{2}$/.test(s);
}

export default function Settings() {
  const router = useRouter();
  const { state, setProfile, load } = useProfileStore();

  const [birthISO, setBirthISO] = useState("2000-01-01");
  const [years, setYears] = useState("80.0");
  const [activeStart, setActiveStart] = useState("07:00");
  const [activeEnd, setActiveEnd] = useState("23:00");
  const [defaultFocusMode, setDefaultFocusMode] = useState<FocusMode>("today");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await loadProfile();
      load(p);
      if (p) {
        setBirthISO(p.birthISO);
        setYears(String(p.lifeExpectancyYears));
        setActiveStart(p.activeStart);
        setActiveEnd(p.activeEnd);
        setDefaultFocusMode(p.defaultFocusMode);
      }
    })();
  }, [load]);

  async function onSave() {
    setError(null);
    const y = Number(years);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthISO)) return setError("生年月日は YYYY-MM-DD で入力してください");
    if (!Number.isFinite(y) || y < 1 || y > 150) return setError("寿命の目安は 1〜150 の範囲で入力してください");
    if (!isHHMM(activeStart) || !isHHMM(activeEnd)) return setError("活動時間は HH:MM で入力してください");

    // start < end を簡易チェック
    if (activeStart >= activeEnd) return setError("活動時間は start < end になるようにしてください（例 07:00〜23:00）");

    const p: Profile = {
      birthISO,
      lifeExpectancyYears: y,
      activeStart,
      activeEnd,
      defaultFocusMode,
    };

    await saveProfile(p);
    setProfile(p);
    router.replace("/");
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>設定</Text>

      <View style={{ gap: 6 }}>
        <Text>生年月日（YYYY-MM-DD）</Text>
        <TextInput value={birthISO} onChangeText={setBirthISO} style={{ borderWidth: 1, borderRadius: 12, padding: 10 }} />
      </View>

      <View style={{ gap: 6 }}>
        <Text>寿命の目安（年）</Text>
        <TextInput value={years} onChangeText={setYears} keyboardType="numeric" style={{ borderWidth: 1, borderRadius: 12, padding: 10 }} />
      </View>

      <View style={{ gap: 6 }}>
        <Text>活動時間 start（HH:MM）</Text>
        <TextInput value={activeStart} onChangeText={setActiveStart} style={{ borderWidth: 1, borderRadius: 12, padding: 10 }} />
      </View>

      <View style={{ gap: 6 }}>
        <Text>活動時間 end（HH:MM）</Text>
        <TextInput value={activeEnd} onChangeText={setActiveEnd} style={{ borderWidth: 1, borderRadius: 12, padding: 10 }} />
      </View>

      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Text>1行メモのデフォルト</Text>
        <Pressable onPress={() => setDefaultFocusMode("today")} style={{ padding: 8, borderWidth: 1, borderRadius: 12, opacity: defaultFocusMode === "today" ? 1 : 0.5 }}>
          <Text>Today</Text>
        </Pressable>
        <Pressable onPress={() => setDefaultFocusMode("week")} style={{ padding: 8, borderWidth: 1, borderRadius: 12, opacity: defaultFocusMode === "week" ? 1 : 0.5 }}>
          <Text>Week</Text>
        </Pressable>
      </View>

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      <Pressable onPress={onSave} style={{ padding: 14, borderWidth: 1, borderRadius: 14 }}>
        <Text style={{ fontWeight: "600" }}>保存して戻る</Text>
      </Pressable>

      <Text style={{ opacity: 0.7, marginTop: 8 }}>
        ※本アプリは統計上の目安です。寿命を予測するものではありません。
      </Text>
    </View>
  );
}

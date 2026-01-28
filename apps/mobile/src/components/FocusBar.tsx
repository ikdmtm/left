import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import type { FocusMode } from "../core/model/types";
import { getDayId, getWeekId, getLabel, normalizeOneLine } from "../features/focus/focus";
import { loadFocusDay, loadFocusWeek, saveFocusDay, saveFocusWeek } from "../features/focus/storage";

export function FocusBar({
  defaultMode,
}: {
  defaultMode: FocusMode;
}) {
  const [mode, setMode] = useState<FocusMode>(defaultMode);
  const [text, setText] = useState("");

  const now = useMemo(() => new Date(), []);
  const dayId = getDayId(now);
  const weekId = getWeekId(now);

  useEffect(() => {
    (async () => {
      const v = mode === "today" ? await loadFocusDay(dayId) : await loadFocusWeek(weekId);
      setText(v);
    })();
  }, [mode, dayId, weekId]);

  async function onSave(v: string) {
    const normalized = normalizeOneLine(v);
    setText(normalized);
    if (mode === "today") await saveFocusDay(dayId, normalized);
    else await saveFocusWeek(weekId, normalized);
  }

  return (
    <View style={{ gap: 8, padding: 12, borderWidth: 1, borderRadius: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontWeight: "600" }}>{getLabel(mode)}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => setMode("today")} style={{ opacity: mode === "today" ? 1 : 0.5 }}>
            <Text>Today</Text>
          </Pressable>
          <Pressable onPress={() => setMode("week")} style={{ opacity: mode === "week" ? 1 : 0.5 }}>
            <Text>Week</Text>
          </Pressable>
        </View>
      </View>

      <TextInput
        value={text}
        onChangeText={setText}
        onBlur={() => onSave(text)}
        placeholder="ここに1行で書く（保存は自動）"
        style={{ borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 }}
        multiline={false}
      />
      <Text style={{ opacity: 0.6, fontSize: 12 }}>※改行は自動でスペースに変換されます</Text>
    </View>
  );
}

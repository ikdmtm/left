import { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, TextInput, Pressable, Keyboard, InputAccessoryView, Platform } from "react-native";
import type { FocusMode } from "../core/model/types";
import { getDayId, getWeekId, getLabel } from "../features/focus/focus";
import { loadFocusDay, loadFocusWeek, saveFocusDay, saveFocusWeek } from "../features/focus/storage";

export function FocusBar({
  defaultMode,
  onFocus,
  onViewLayout,
}: {
  defaultMode: FocusMode;
  onFocus?: () => void;
  onViewLayout?: (y: number) => void;
}) {
  const inputAccessoryViewID = useRef(`focusBarToolbar-${Date.now()}`).current;
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
    setText(v);
    if (mode === "today") await saveFocusDay(dayId, v);
    else await saveFocusWeek(weekId, v);
  }

  function handleDone() {
    onSave(text);
    Keyboard.dismiss();
  }

  return (
    <>
      <View 
        style={{ gap: 8, padding: 12, borderWidth: 1, borderRadius: 12 }}
        onLayout={(event) => {
          const { y } = event.nativeEvent.layout;
          onViewLayout?.(y);
        }}
      >
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
          onFocus={onFocus}
          placeholder="目標や日記を書く（保存は自動）"
          style={{ 
            borderWidth: 1, 
            borderRadius: 10, 
            paddingHorizontal: 10, 
            paddingVertical: 8,
            minHeight: 80,
            textAlignVertical: "top"
          }}
          multiline={true}
          maxLength={140}
          blurOnSubmit={false}
          inputAccessoryViewID={Platform.OS === "ios" ? inputAccessoryViewID : undefined}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ opacity: 0.6, fontSize: 12 }}>※目標や日記に使えます。改行も可能です。</Text>
          <Text style={{ opacity: 0.6, fontSize: 12 }}>{text.length}/140</Text>
        </View>
      </View>

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={{ 
            backgroundColor: "#f0f0f0", 
            borderTopWidth: 1, 
            borderTopColor: "#ccc",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8
          }}>
            <Text style={{ opacity: 0.6, fontSize: 14 }}>{text.length}/140</Text>
            <Pressable 
              onPress={handleDone}
              style={{ 
                backgroundColor: "#007AFF", 
                paddingHorizontal: 20,
                paddingVertical: 10, 
                borderRadius: 8
              }}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>完了</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}

      {Platform.OS === "android" && (
        <View style={{ marginTop: 8 }}>
          <Pressable 
            onPress={handleDone}
            style={{ 
              backgroundColor: "#007AFF", 
              padding: 12, 
              borderRadius: 10, 
              alignItems: "center" 
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>完了</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

import { View, Text, Pressable } from "react-native";
import type { Unit } from "../core/model/types";

const UNITS: { key: Unit; label: string }[] = [
  { key: "years", label: "年" },
  { key: "months_avg", label: "月" },
  { key: "weeks", label: "週" },
  { key: "days", label: "日" },
  { key: "hours", label: "時" },
  { key: "minutes", label: "分" },
  { key: "seconds", label: "秒" },
];

export function UnitToggle({
  value,
  onChange,
}: {
  value: Unit;
  onChange: (u: Unit) => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {UNITS.map((u) => {
        const active = value === u.key;
        return (
          <Pressable
            key={u.key}
            onPress={() => onChange(u.key)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 999,
              borderWidth: 1,
              opacity: active ? 1 : 0.6,
            }}
          >
            <Text>{u.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

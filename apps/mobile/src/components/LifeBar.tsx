import { View, Text } from "react-native";

export function LifeBar({ progress }: { progress: number }) {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ gap: 6 }}>
      <View style={{ height: 14, borderWidth: 1, borderRadius: 999, overflow: "hidden" }}>
        <View style={{ width: `${p * 100}%`, height: "100%" }} />
      </View>
      <Text style={{ opacity: 0.7 }}>{(p * 100).toFixed(2)}%</Text>
    </View>
  );
}

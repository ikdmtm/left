import { View, Text } from "react-native";

export function TimeValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ opacity: 0.7 }}>{label}</Text>
      <Text style={{ fontSize: 26, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

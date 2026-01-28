import { View, Text, Animated } from "react-native";
import { useEffect, useRef } from "react";

export function TimeValue({ label, value }: { label: string; value: string }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 値が変わったら一瞬フェードアウト→フェードイン
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.4,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value, fadeAnim]);

  return (
    <View style={{ gap: 4 }}>
      <Text style={{ opacity: 0.7 }}>{label}</Text>
      <Animated.Text style={{ fontSize: 40, fontWeight: "700", opacity: fadeAnim }}>
        {value}
      </Animated.Text>
    </View>
  );
}

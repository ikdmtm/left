import { View, Text, Animated } from "react-native";
import { useEffect, useRef } from "react";

export function LifeBar({ progress }: { progress: number }) {
  const p = Math.max(0, Math.min(1, progress));
  const widthAnim = useRef(new Animated.Value(p * 100)).current;
  
  // 進捗に応じた色を計算（0-50%: 緑系、50-75%: 黄色系、75-100%: 赤系）
  const getColor = (progress: number): string => {
    if (progress < 0.5) return "#4CAF50"; // 緑
    if (progress < 0.75) return "#FFC107"; // 黄色
    return "#F44336"; // 赤
  };

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: p * 100,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [p, widthAnim]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  
  return (
    <View style={{ gap: 6 }}>
      <View style={{ height: 14, borderWidth: 1, borderRadius: 999, overflow: "hidden", backgroundColor: "#f0f0f0" }}>
        <Animated.View style={{ width: animatedWidth, height: "100%", backgroundColor: getColor(p) }} />
      </View>
      <Text style={{ opacity: 0.7 }}>{(p * 100).toFixed(2)}%</Text>
    </View>
  );
}

import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Picker } from "@react-native-picker/picker";

const FOCUS_PREFIX_DAY = "ttl:focus:day:";
const FOCUS_PREFIX_WEEK = "ttl:focus:week:";

interface HistoryEntry {
  id: string;
  date: string;
  content: string;
  type: "day" | "week";
}

interface FocusValue {
  text: string;
}

export default function History() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "day" | "week" | "yearmonth">("all");
  const [searchText, setSearchText] = useState("");
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>("");
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);

  function formatDate(date: string, type: "day" | "week"): string {
    if (type === "day") {
      // 2026-01-28 → 2026年1月28日
      const [year, month, day] = date.split("-");
      return `${year}年${parseInt(month)}月${parseInt(day)}日`;
    } else {
      // 2026-W05 → 2026年 第5週
      const [year, week] = date.split("-W");
      return `${year}年 第${parseInt(week)}週`;
    }
  }

  async function loadHistory() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const focusKeys = keys.filter(
        (k) => k.startsWith(FOCUS_PREFIX_DAY) || k.startsWith(FOCUS_PREFIX_WEEK)
      );

      const entries: HistoryEntry[] = [];
      for (const key of focusKeys) {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          try {
            const data: FocusValue = JSON.parse(raw);
            if (data.text && data.text.trim()) {
              const isDay = key.startsWith(FOCUS_PREFIX_DAY);
              const id = key.replace(isDay ? FOCUS_PREFIX_DAY : FOCUS_PREFIX_WEEK, "");
              entries.push({
                id,
                date: id,
                content: data.text,
                type: isDay ? "day" : "week",
              });
            }
          } catch (parseError) {
            console.error(`Failed to parse key ${key}:`, parseError);
          }
        }
      }

      // 日付順でソート（新しい順）
      entries.sort((a, b) => b.date.localeCompare(a.date));
      setHistory(entries);
    } catch (error) {
      console.error("履歴の読み込みに失敗:", error);
    }
  }

  // 画面がフォーカスされるたびに履歴を再読み込み
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  // 年月のリストを生成（履歴から）
  const yearMonthOptions = Array.from(
    new Set(
      history.map((entry) => {
        if (entry.type === "day") {
          const [year, month] = entry.date.split("-");
          return `${year}-${month}`;
        } else {
          const [year] = entry.date.split("-W");
          return `${year}-01`; // 週の場合は年として扱う
        }
      })
    )
  ).sort((a, b) => b.localeCompare(a)); // 新しい順

  function formatYearMonthLabel(ym: string): string {
    if (!ym) return "年月を選択";
    const [year, month] = ym.split("-");
    return `${year}年${parseInt(month)}月`;
  }

  // フィルタリング
  let filteredHistory = history;

  // タイプと年月でフィルター
  if (filter === "day") {
    filteredHistory = filteredHistory.filter((entry) => entry.type === "day");
  } else if (filter === "week") {
    filteredHistory = filteredHistory.filter((entry) => entry.type === "week");
  } else if (filter === "yearmonth" && selectedYearMonth) {
    filteredHistory = filteredHistory.filter((entry) => {
      if (entry.type === "day") {
        const [year, month] = entry.date.split("-");
        return `${year}-${month}` === selectedYearMonth;
      } else {
        const [year] = entry.date.split("-W");
        const [filterYear] = selectedYearMonth.split("-");
        return year === filterYear;
      }
    });
  }

  // テキストで検索
  if (searchText.trim()) {
    const searchLower = searchText.toLowerCase();
    filteredHistory = filteredHistory.filter(
      (entry) =>
        entry.content.toLowerCase().includes(searchLower) ||
        entry.date.includes(searchText)
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
            1行メモの履歴
          </Text>
          <Text style={{ opacity: 0.7, fontSize: 14, marginBottom: 16 }}>
            過去に記録したメモを確認できます
          </Text>

          {/* 検索セクション */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
              検索
            </Text>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="メモの内容や日付で検索..."
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: "white",
              }}
            />
          </View>

          {/* 絞り込みセクション */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
              絞り込み
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => { setFilter("all"); setSelectedYearMonth(""); }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: filter === "all" ? "#007AFF" : "#ccc",
                  backgroundColor: filter === "all" ? "#E3F2FD" : "white",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: filter === "all" ? "#007AFF" : "#666",
                    fontWeight: filter === "all" ? "600" : "normal",
                  }}
                >
                  すべて
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => { setFilter("day"); setSelectedYearMonth(""); }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: filter === "day" ? "#007AFF" : "#ccc",
                  backgroundColor: filter === "day" ? "#E3F2FD" : "white",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: filter === "day" ? "#007AFF" : "#666",
                    fontWeight: filter === "day" ? "600" : "normal",
                  }}
                >
                  日別
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => { setFilter("week"); setSelectedYearMonth(""); }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: filter === "week" ? "#007AFF" : "#ccc",
                  backgroundColor: filter === "week" ? "#E3F2FD" : "white",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: filter === "week" ? "#007AFF" : "#666",
                    fontWeight: filter === "week" ? "600" : "normal",
                  }}
                >
                  週別
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setFilter("yearmonth");
                  setShowYearMonthPicker(true);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: filter === "yearmonth" ? "#007AFF" : "#ccc",
                  backgroundColor: filter === "yearmonth" ? "#E3F2FD" : "white",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: filter === "yearmonth" ? "#007AFF" : "#666",
                    fontWeight: filter === "yearmonth" ? "600" : "normal",
                    fontSize: 13,
                  }}
                >
                  {filter === "yearmonth" && selectedYearMonth ? formatYearMonthLabel(selectedYearMonth) : "年月"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

      {/* 履歴リスト */}
      {filteredHistory.length === 0 ? (
        <View
          style={{
            padding: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ opacity: 0.5, fontSize: 16 }}>
            {history.length === 0 ? "履歴がありません" : "該当するメモが見つかりません"}
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {filteredHistory.map((entry) => (
            <View
              key={`${entry.type}-${entry.id}`}
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                backgroundColor: "white",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600" }}>
                  {formatDate(entry.date, entry.type)}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 4,
                    backgroundColor: entry.type === "day" ? "#E8F5E9" : "#FFF3E0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: entry.type === "day" ? "#2E7D32" : "#E65100",
                    }}
                  >
                    {entry.type === "day" ? "日" : "週"}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 14 }}>{entry.content}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 年月選択モーダル */}
      <Modal visible={showYearMonthPicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowYearMonthPicker(false)}
          />
          <View style={{ backgroundColor: "#f0f0f0", paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "white" }}>
              <TouchableOpacity onPress={() => setShowYearMonthPicker(false)}>
                <Text style={{ color: "#007AFF", fontSize: 17, fontWeight: "600" }}>完了</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={selectedYearMonth || yearMonthOptions[0]}
              onValueChange={(value) => setSelectedYearMonth(value)}
              style={{ height: 200, backgroundColor: "white" }}
              itemStyle={{ color: "#000000", fontSize: 20 }}
            >
              {yearMonthOptions.map((ym) => (
                <Picker.Item 
                  key={ym} 
                  label={formatYearMonthLabel(ym)} 
                  value={ym} 
                  color="#000000" 
                />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </>
  );
}

import { useState, useCallback } from "react";
import { View, Text, ScrollView, Modal, TouchableOpacity, Linking } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { StatusBar } from "expo-status-bar";

import type { Profile, FocusMode } from "../src/core/model/types";
import { useProfileStore } from "../src/features/profile/store";
import { loadProfile, saveProfile } from "../src/features/profile/persistence";

// 年の選択肢を生成（1900-2020）
const years = Array.from({ length: 121 }, (_, i) => 1900 + i);
// 月の選択肢（1-12）
const months = Array.from({ length: 12 }, (_, i) => i + 1);
// 日の選択肢（1-31）
const days = Array.from({ length: 31 }, (_, i) => i + 1);
// 時の選択肢（0-23）
const hours = Array.from({ length: 24 }, (_, i) => i);
// 分の選択肢（0-59、5分刻み）
const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
// 寿命の選択肢（1-150）
const lifeExpectancies = Array.from({ length: 150 }, (_, i) => i + 1);

export default function Settings() {
  const router = useRouter();
  const { setProfile, load } = useProfileStore();

  // 生年月日を年・月・日に分解して管理
  const [birthYear, setBirthYear] = useState(2000);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  
  // 寿命の目安
  const [lifeExpectancy, setLifeExpectancy] = useState(80);
  
  // 活動開始時刻を時・分に分解して管理
  const [startHour, setStartHour] = useState(7);
  const [startMinute, setStartMinute] = useState(0);
  
  // 活動終了時刻を時・分に分解して管理
  const [endHour, setEndHour] = useState(23);
  const [endMinute, setEndMinute] = useState(0);
  
  const [defaultFocusMode, setDefaultFocusMode] = useState<FocusMode>("today");
  const [error, setError] = useState<string | null>(null);
  
  // モーダル表示管理
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showLifeExpectancyPicker, setShowLifeExpectancyPicker] = useState(false);
  const [showStartHourPicker, setShowStartHourPicker] = useState(false);
  const [showStartMinutePicker, setShowStartMinutePicker] = useState(false);
  const [showEndHourPicker, setShowEndHourPicker] = useState(false);
  const [showEndMinutePicker, setShowEndMinutePicker] = useState(false);

  // 画面にフォーカスが当たるたびにプロフィールを再読み込み
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const p = await loadProfile();
        load(p);
        if (p) {
          // YYYY-MM-DD から年月日を抽出
          const [y, m, d] = p.birthISO.split("-").map(Number);
          setBirthYear(y);
          setBirthMonth(m);
          setBirthDay(d);
          
          setLifeExpectancy(Math.round(p.lifeExpectancyYears));
          
          // HH:MM から時分を抽出
          const [sh, sm] = p.activeStart.split(":").map(Number);
          setStartHour(sh);
          setStartMinute(sm);
          
          const [eh, em] = p.activeEnd.split(":").map(Number);
          setEndHour(eh);
          setEndMinute(em);
          
          setDefaultFocusMode(p.defaultFocusMode);
        }
      })();
    }, [])
  );

  async function onSave() {
    setError(null);
    
    // YYYY-MM-DD 形式に整形
    const birthISO = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;
    
    // HH:MM 形式に整形
    const activeStart = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
    const activeEnd = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
    
    // start < end のチェック（終了時刻が開始時刻より小さい場合は翌日として扱う）
    const startMinutes = startHour * 60 + startMinute;
    let endMinutes = endHour * 60 + endMinute;
    
    // 終了時刻が開始時刻以下の場合は翌日とみなす（例：23時開始→2時終了）
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60; // 翌日として24時間を加算
    }
    
    // 活動時間の計算
    const activityMinutes = endMinutes - startMinutes;
    
    // 0時間または24時間はエラー、1分〜23時間まではOK
    if (activityMinutes <= 0 || activityMinutes >= 24 * 60) {
      return setError("活動時間は1分以上23時間59分までに設定してください");
    }

    const p: Profile = {
      birthISO,
      lifeExpectancyYears: lifeExpectancy,
      activeStart,
      activeEnd,
      defaultFocusMode,
    };

    await saveProfile(p);
    setProfile(p);
    router.replace("/");
  }

  return (
    <>
      <StatusBar style="dark" />
      <ScrollView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
        <View style={{ padding: 16, gap: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>設定</Text>

        {/* 生年月日 */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>生年月日</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity 
              onPress={() => setShowYearPicker(true)}
              style={{ flex: 2, backgroundColor: "white", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#ddd" }}
            >
              <Text style={{ fontSize: 16 }}>{birthYear}年</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowMonthPicker(true)}
              style={{ flex: 1, backgroundColor: "white", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#ddd" }}
            >
              <Text style={{ fontSize: 16 }}>{birthMonth}月</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowDayPicker(true)}
              style={{ flex: 1, backgroundColor: "white", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#ddd" }}
            >
              <Text style={{ fontSize: 16 }}>{birthDay}日</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 寿命の目安 */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>寿命の目安</Text>
          <TouchableOpacity 
            onPress={() => setShowLifeExpectancyPicker(true)}
            style={{ backgroundColor: "white", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#ddd" }}
          >
            <Text style={{ fontSize: 16 }}>{lifeExpectancy}歳</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 12, opacity: 0.6 }}>※日本の平均寿命：男性 81.5歳、女性 87.6歳</Text>
        </View>

        {/* 活動開始時刻 */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>活動開始時刻</Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <TouchableOpacity 
              onPress={() => setShowStartHourPicker(true)}
              style={{ flex: 1, backgroundColor: "white", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#ddd" }}
            >
              <Text style={{ fontSize: 16 }}>{startHour}時</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>:</Text>
            <TouchableOpacity 
              onPress={() => setShowStartMinutePicker(true)}
              style={{ flex: 1, backgroundColor: "white", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#ddd" }}
            >
              <Text style={{ fontSize: 16 }}>{String(startMinute).padStart(2, "0")}分</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 12, opacity: 0.6 }}>※通常の起床時刻を選択してください</Text>
        </View>

        {/* 活動終了時刻 */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>活動終了時刻</Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <TouchableOpacity 
              onPress={() => setShowEndHourPicker(true)}
              style={{ flex: 1, backgroundColor: "white", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#ddd" }}
            >
              <Text style={{ fontSize: 16 }}>{endHour}時</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>:</Text>
            <TouchableOpacity 
              onPress={() => setShowEndMinutePicker(true)}
              style={{ flex: 1, backgroundColor: "white", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#ddd" }}
            >
              <Text style={{ fontSize: 16 }}>{String(endMinute).padStart(2, "0")}分</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 12, opacity: 0.6 }}>※開始時刻より前の時刻は翌日として扱われます（活動時間は最大23時間）</Text>
        </View>

        {/* 1行メモのデフォルト */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>1行メモのデフォルト</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity 
              onPress={() => setDefaultFocusMode("today")} 
              style={{ 
                flex: 1,
                padding: 12, 
                borderWidth: 2, 
                borderRadius: 8, 
                borderColor: defaultFocusMode === "today" ? "#007AFF" : "#ddd",
                backgroundColor: defaultFocusMode === "today" ? "#E3F2FD" : "white"
              }}
            >
              <Text style={{ fontWeight: "600", textAlign: "center" }}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setDefaultFocusMode("week")} 
              style={{ 
                flex: 1,
                padding: 12, 
                borderWidth: 2, 
                borderRadius: 8, 
                borderColor: defaultFocusMode === "week" ? "#007AFF" : "#ddd",
                backgroundColor: defaultFocusMode === "week" ? "#E3F2FD" : "white"
              }}
            >
              <Text style={{ fontWeight: "600", textAlign: "center" }}>Week</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={{ padding: 12, backgroundColor: "#FFEBEE", borderRadius: 8 }}>
            <Text style={{ color: "#C62828" }}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          onPress={onSave} 
          style={{ 
            padding: 16, 
            backgroundColor: "#007AFF", 
            borderRadius: 8,
            marginTop: 8,
            marginBottom: 24
          }}
        >
          <Text style={{ fontWeight: "600", color: "white", textAlign: "center", fontSize: 16 }}>保存して戻る</Text>
        </TouchableOpacity>
      </View>

      {/* 年ピッカーモーダル */}
      <Modal visible={showYearPicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowYearPicker(false)}
          />
          <View style={{ backgroundColor: "#f0f0f0", paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "white" }}>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <Text style={{ color: "#007AFF", fontSize: 17, fontWeight: "600" }}>完了</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={birthYear}
              onValueChange={setBirthYear}
              style={{ height: 200, backgroundColor: "white" }}
              itemStyle={{ color: "#000000", fontSize: 20 }}
            >
              {years.map(y => <Picker.Item key={y} label={`${y}年`} value={y} color="#000000" />)}
            </Picker>
          </View>
        </View>
      </Modal>

      {/* 月ピッカーモーダル */}
      <Modal visible={showMonthPicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowMonthPicker(false)}
          />
          <View style={{ backgroundColor: "#f0f0f0", paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "white" }}>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Text style={{ color: "#007AFF", fontSize: 17, fontWeight: "600" }}>完了</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={birthMonth}
              onValueChange={setBirthMonth}
              style={{ height: 200, backgroundColor: "white" }}
              itemStyle={{ color: "#000000", fontSize: 20 }}
            >
              {months.map(m => <Picker.Item key={m} label={`${m}月`} value={m} color="#000000" />)}
            </Picker>
          </View>
        </View>
      </Modal>

      {/* 日ピッカーモーダル */}
      <Modal visible={showDayPicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowDayPicker(false)}
          />
          <View style={{ backgroundColor: "#f0f0f0", paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "white" }}>
              <TouchableOpacity onPress={() => setShowDayPicker(false)}>
                <Text style={{ color: "#007AFF", fontSize: 17, fontWeight: "600" }}>完了</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={birthDay}
              onValueChange={setBirthDay}
              style={{ height: 200, backgroundColor: "white" }}
              itemStyle={{ color: "#000000", fontSize: 20 }}
            >
              {days.map(d => <Picker.Item key={d} label={`${d}日`} value={d} color="#000000" />)}
            </Picker>
          </View>
        </View>
      </Modal>

      {/* 寿命ピッカーモーダル */}
      <Modal visible={showLifeExpectancyPicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowLifeExpectancyPicker(false)}
          />
          <View style={{ backgroundColor: "#f0f0f0", paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "white" }}>
              <TouchableOpacity onPress={() => setShowLifeExpectancyPicker(false)}>
                <Text style={{ color: "#007AFF", fontSize: 17, fontWeight: "600" }}>完了</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={lifeExpectancy}
              onValueChange={setLifeExpectancy}
              style={{ height: 200, backgroundColor: "white" }}
              itemStyle={{ color: "#000000", fontSize: 20 }}
            >
              {lifeExpectancies.map(age => <Picker.Item key={age} label={`${age}歳`} value={age} color="#000000" />)}
            </Picker>
          </View>
        </View>
      </Modal>

      {/* 開始時ピッカーモーダル */}
      <Modal visible={showStartHourPicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowStartHourPicker(false)}
          />
          <View style={{ backgroundColor: "#f0f0f0", paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "white" }}>
              <TouchableOpacity onPress={() => setShowStartHourPicker(false)}>
                <Text style={{ color: "#007AFF", fontSize: 17, fontWeight: "600" }}>完了</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={startHour}
              onValueChange={setStartHour}
              style={{ height: 200, backgroundColor: "white" }}
              itemStyle={{ color: "#000000", fontSize: 20 }}
            >
              {hours.map(h => <Picker.Item key={h} label={`${h}時`} value={h} color="#000000" />)}
            </Picker>
          </View>
        </View>
      </Modal>

      {/* 開始分ピッカーモーダル */}
      <Modal visible={showStartMinutePicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowStartMinutePicker(false)}
          />
          <View style={{ backgroundColor: "#f0f0f0", paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "white" }}>
              <TouchableOpacity onPress={() => setShowStartMinutePicker(false)}>
                <Text style={{ color: "#007AFF", fontSize: 17, fontWeight: "600" }}>完了</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={startMinute}
              onValueChange={setStartMinute}
              style={{ height: 200, backgroundColor: "white" }}
              itemStyle={{ color: "#000000", fontSize: 20 }}
            >
              {minutes.map(m => <Picker.Item key={m} label={`${String(m).padStart(2, "0")}分`} value={m} color="#000000" />)}
            </Picker>
          </View>
        </View>
      </Modal>

      {/* 終了時ピッカーモーダル */}
      <Modal visible={showEndHourPicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowEndHourPicker(false)}
          />
          <View style={{ backgroundColor: "#f0f0f0", paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "white" }}>
              <TouchableOpacity onPress={() => setShowEndHourPicker(false)}>
                <Text style={{ color: "#007AFF", fontSize: 17, fontWeight: "600" }}>完了</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={endHour}
              onValueChange={setEndHour}
              style={{ height: 200, backgroundColor: "white" }}
              itemStyle={{ color: "#000000", fontSize: 20 }}
            >
              {hours.map(h => <Picker.Item key={h} label={`${h}時`} value={h} color="#000000" />)}
            </Picker>
          </View>
        </View>
      </Modal>

      {/* 終了分ピッカーモーダル */}
      <Modal visible={showEndMinutePicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableOpacity 
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setShowEndMinutePicker(false)}
          />
          <View style={{ backgroundColor: "#f0f0f0", paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#ccc", backgroundColor: "white" }}>
              <TouchableOpacity onPress={() => setShowEndMinutePicker(false)}>
                <Text style={{ color: "#007AFF", fontSize: 17, fontWeight: "600" }}>完了</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={endMinute}
              onValueChange={setEndMinute}
              style={{ height: 200, backgroundColor: "white" }}
              itemStyle={{ color: "#000000", fontSize: 20 }}
            >
              {minutes.map(m => <Picker.Item key={m} label={`${String(m).padStart(2, "0")}分`} value={m} color="#000000" />)}
            </Picker>
          </View>
        </View>
      </Modal>

      {/* プライバシーポリシー */}
      <View style={{ 
        paddingVertical: 20, 
        paddingHorizontal: 20,
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0"
      }}>
        <TouchableOpacity 
          onPress={() => Linking.openURL("https://ikdmtm.github.io/left-privacy/")}
          style={{ padding: 10 }}
        >
          <Text style={{ 
            fontSize: 12, 
            color: "#888",
            textDecorationLine: "underline"
          }}>
            プライバシーポリシー
          </Text>
        </TouchableOpacity>
      </View>

      </ScrollView>
    </>
  );
}

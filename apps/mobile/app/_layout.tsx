import { Stack } from "expo-router";
import { ProfileProvider } from "../src/features/profile/store";

export default function Layout() {
  return (
    <ProfileProvider>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Home",
            headerShown: false 
          }} 
        />
        <Stack.Screen name="history" options={{ title: "履歴" }} />
        <Stack.Screen name="settings" options={{ title: "設定" }} />
      </Stack>
    </ProfileProvider>
  );
}

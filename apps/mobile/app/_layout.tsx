import { Stack } from "expo-router";
import { ProfileProvider } from "../src/features/profile/store";

export default function Layout() {
  return (
    <ProfileProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Time Left" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </ProfileProvider>
  );
}

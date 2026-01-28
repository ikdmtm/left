import { getJSON, setJSON } from "../../core/storage/prefs";
import { KEYS } from "../../core/storage/keys";

type FocusValue = { text: string };

export async function loadFocusDay(dayId: string): Promise<string> {
  const v = await getJSON<FocusValue>(KEYS.focusDayPrefix + dayId);
  return v?.text ?? "";
}
export async function saveFocusDay(dayId: string, text: string): Promise<void> {
  await setJSON(KEYS.focusDayPrefix + dayId, { text });
}

export async function loadFocusWeek(weekId: string): Promise<string> {
  const v = await getJSON<FocusValue>(KEYS.focusWeekPrefix + weekId);
  return v?.text ?? "";
}
export async function saveFocusWeek(weekId: string, text: string): Promise<void> {
  await setJSON(KEYS.focusWeekPrefix + weekId, { text });
}

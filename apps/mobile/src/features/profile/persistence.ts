import type { Profile } from "../../core/model/types";
import { getJSON, setJSON } from "../../core/storage/prefs";
import { KEYS } from "../../core/storage/keys";

export async function loadProfile(): Promise<Profile | null> {
  return await getJSON<Profile>(KEYS.profile);
}

export async function saveProfile(p: Profile): Promise<void> {
  await setJSON(KEYS.profile, p);
}

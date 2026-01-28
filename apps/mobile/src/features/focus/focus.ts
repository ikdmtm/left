import type { FocusMode } from "../../core/model/types";

/**
 * ISO週の簡易ID（YYYY-Www）
 * ※厳密ISOにしたい場合はライブラリ導入でもOK（MVPは簡易で十分）
 */
export function getWeekId(d: Date): string {
  // 木曜基準の簡易ISO週
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const yyyy = date.getUTCFullYear();
  return `${yyyy}-W${String(weekNo).padStart(2, "0")}`;
}

export function getDayId(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function normalizeOneLine(s: string): string {
  return s.replace(/\r?\n/g, " ").slice(0, 120);
}

export function getLabel(mode: FocusMode): string {
  return mode === "today" ? "今日の1行メモ" : "今週の1行メモ";
}

import type { Profile } from "../model/types";

const MS_PER_MIN = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export const DAYS_PER_YEAR = 365.2425;
export const DAYS_PER_MONTH_AVG = DAYS_PER_YEAR / 12;

export function calcEndDateMs(birthMs: number, lifeExpectancyYears: number): number {
  return birthMs + lifeExpectancyYears * DAYS_PER_YEAR * MS_PER_DAY;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function calcLife(nowMs: number, birthMs: number, lifeExpectancyYears: number) {
  const endMs = calcEndDateMs(birthMs, lifeExpectancyYears);
  const totalMs = Math.max(0, endMs - birthMs);
  const livedMs = clamp(nowMs - birthMs, 0, totalMs);
  const remainingMs = Math.max(0, endMs - nowMs);
  const progress = totalMs === 0 ? 0 : livedMs / totalMs;

  return { endMs, totalMs, livedMs, remainingMs, progress };
}

export function parseBirthISOToMs(birthISO: string): number {
  // birthISO: "YYYY-MM-DD" をローカル日付の 00:00 として扱う
  const [y, m, d] = birthISO.split("-").map((v) => Number(v));
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

function parseHHMM(hhmm: string): { h: number; m: number } {
  const [h, m] = hhmm.split(":").map((v) => Number(v));
  return { h, m };
}

/**
 * 今日の活動時間の残り（ms）
 * activeStart〜activeEnd の範囲内なら (end - now)、範囲外なら 0
 * ※ start < end 前提（設定で担保）
 */
export function calcTodayActiveRemainingMs(now: Date, profile: Profile): number {
  const { h: sh, m: sm } = parseHHMM(profile.activeStart);
  const { h: eh, m: em } = parseHHMM(profile.activeEnd);

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sh, sm, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eh, em, 0, 0);

  const nowMs = now.getTime();
  if (nowMs < start.getTime()) return end.getTime() - start.getTime(); // “まだ開始前”は今日の活動総量を出す案もあるが…
  if (nowMs > end.getTime()) return 0;
  return end.getTime() - nowMs;
}

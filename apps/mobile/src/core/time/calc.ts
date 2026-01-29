import type { Profile } from "../model/types";

const MS_PER_MIN = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;

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
 * ※終了時刻が開始時刻以下の場合は翌日として扱う
 */
export function calcTodayActiveRemainingMs(now: Date, profile: Profile): number {
  const { h: sh, m: sm } = parseHHMM(profile.activeStart);
  const { h: eh, m: em } = parseHHMM(profile.activeEnd);

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sh, sm, 0, 0);
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eh, em, 0, 0);
  
  // 終了時刻が開始時刻以下の場合は翌日として扱う（例：23:00→02:00）
  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + MS_PER_DAY);
  }

  const nowMs = now.getTime();
  
  // 現在時刻が開始前の場合
  if (nowMs < start.getTime()) {
    // 開始時刻が今日で、終了時刻が翌日の場合を考慮
    return end.getTime() - start.getTime();
  }
  
  // 現在時刻が終了後の場合
  if (nowMs > end.getTime()) {
    return 0;
  }
  
  // 活動時間内
  return end.getTime() - nowMs;
}

/**
 * 人生の週数を計算
 */
export function calcWeeks(nowMs: number, birthMs: number, lifeExpectancyYears: number) {
  const endMs = calcEndDateMs(birthMs, lifeExpectancyYears);
  const totalWeeks = Math.floor((endMs - birthMs) / MS_PER_WEEK);
  const livedWeeks = Math.floor((nowMs - birthMs) / MS_PER_WEEK);
  const remainingWeeks = Math.max(0, totalWeeks - livedWeeks);
  
  return { totalWeeks, livedWeeks, remainingWeeks };
}

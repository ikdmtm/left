import { DAYS_PER_MONTH_AVG, DAYS_PER_YEAR } from "./calc";
import type { Unit } from "../model/types";

const MS_PER_SEC = 1000;
const MS_PER_MIN = 60 * MS_PER_SEC;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;

const MS_PER_YEAR = DAYS_PER_YEAR * MS_PER_DAY;
const MS_PER_MONTH_AVG = DAYS_PER_MONTH_AVG * MS_PER_DAY;

function pad2(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}
function pad4(n: number) {
  return String(Math.floor(n)).padStart(4, "0");
}
function comma(n: number) {
  return n.toLocaleString();
}

export function formatRemaining(remainingMs: number, unit: Unit): string {
  if (unit === "seconds") return `${comma(Math.floor(remainingMs / MS_PER_SEC))} 秒`;
  if (unit === "days") return `${comma(Math.floor(remainingMs / MS_PER_DAY))} 日`;
  if (unit === "weeks") return `${comma(Math.floor(remainingMs / MS_PER_WEEK))} 週`;
  if (unit === "months_avg") return `${comma(Math.floor(remainingMs / MS_PER_MONTH_AVG))} ヶ月`;
  if (unit === "years") return `${(remainingMs / MS_PER_YEAR).toFixed(2)} 年`;
  return formatDigits(remainingMs);
}

/**
 * 残り時間を YYYYMMDDHHMMSS 風に（年/月/日/時/分/秒）
 * 月は平均月（一定長）
 */
export function formatDigits(remainingMs: number): string {
  let rest = Math.max(0, Math.floor(remainingMs));

  const years = Math.floor(rest / MS_PER_YEAR);
  rest -= years * MS_PER_YEAR;

  const months = Math.floor(rest / MS_PER_MONTH_AVG);
  rest -= months * MS_PER_MONTH_AVG;

  const days = Math.floor(rest / MS_PER_DAY);
  rest -= days * MS_PER_DAY;

  const hours = Math.floor(rest / MS_PER_HOUR);
  rest -= hours * MS_PER_HOUR;

  const mins = Math.floor(rest / MS_PER_MIN);
  rest -= mins * MS_PER_MIN;

  const secs = Math.floor(rest / MS_PER_SEC);

  return `${pad4(years)}${pad2(months)}${pad2(days)}${pad2(hours)}${pad2(mins)}${pad2(secs)}`;
}

export function formatDateTime(dt: Date): string {
  const y = dt.getFullYear();
  const m = pad2(dt.getMonth() + 1);
  const d = pad2(dt.getDate());
  const hh = pad2(dt.getHours());
  const mm = pad2(dt.getMinutes());
  const ss = pad2(dt.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

export function formatDurationHMS(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

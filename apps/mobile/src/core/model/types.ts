export type Unit =
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months_avg"
  | "years"
  | "digits"; // YYYYMMDDHHMMSS（残りの桁表現）

export type FocusMode = "today" | "week";

export type Profile = {
  birthISO: string; // YYYY-MM-DD
  lifeExpectancyYears: number; // ex: 80.0
  activeStart: string; // "07:00"
  activeEnd: string;   // "23:00"
  defaultFocusMode: FocusMode;
};

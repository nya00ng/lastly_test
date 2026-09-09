export type CycleUnit = "day" | "week" | "month";

export type Cycle =
  | null
  | {
      unit: CycleUnit;
      interval: number;
      weekdays?: number[];
    };

export type CycleLifecycle = "ARCHIVED" | "NO_HISTORY" | "NO_CYCLE" | "NORMAL" | "UPCOMING" | "DUE";

const DAY_MS = 86_400_000;
const unitLimits: Record<CycleUnit, number> = { day: 365, week: 52, month: 24 };
const weekdayNames = ["일", "월", "화", "수", "목", "금", "토"];

export function normalizeDateOnly(value: string) {
  const normalized = value.replaceAll(".", "-");
  return parseDateOnly(normalized) ? normalized : null;
}

export function parseDateOnly(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { day, month, time: date.getTime(), year };
}

export function getDateOnlyWeekday(value: string) {
  const parsed = parseDateOnly(value);
  if (!parsed) throw new Error("Invalid date-only value");
  return new Date(parsed.time).getUTCDay();
}

function formatDateOnly(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

export function validateCycle(cycle: Cycle): { valid: boolean; message?: string } {
  if (cycle === null) return { valid: true };
  if (!Number.isInteger(cycle.interval) || cycle.interval < 1 || cycle.interval > unitLimits[cycle.unit]) {
    return { valid: false, message: `${cycle.unit === "day" ? "일" : cycle.unit === "week" ? "주" : "월"} 간격을 확인해주세요.` };
  }
  const weekdays = cycle.weekdays ?? [];
  if (cycle.unit !== "week" && weekdays.length > 0) {
    return { valid: false, message: "요일은 주 단위에서만 선택할 수 있어요." };
  }
  if (weekdays.some((day) => !Number.isInteger(day) || day < 0 || day > 6) || new Set(weekdays).size !== weekdays.length) {
    return { valid: false, message: "선택한 요일을 확인해주세요." };
  }
  if (cycle.unit === "week" && cycle.interval > 1 && weekdays.length > 0) {
    return { valid: false, message: "요일 지정은 매주 반복에서만 사용할 수 있어요." };
  }
  return { valid: true };
}

export function formatCycle(cycle: Cycle) {
  if (cycle === null) return "주기 없음";
  if (cycle.unit === "day") return `${cycle.interval}일마다`;
  if (cycle.unit === "month") return `${cycle.interval}개월마다`;
  const weekdays = [...(cycle.weekdays ?? [])].sort((a, b) => a - b);
  if (weekdays.length === 0) return `${cycle.interval}주마다`;
  return `매주 ${weekdays.map((day) => `${weekdayNames[day]}요일`).join(" · ")}`;
}

export function addDays(date: string, days: number) {
  const parsed = parseDateOnly(date);
  if (!parsed) throw new Error("Invalid date-only value");
  return formatDateOnly(parsed.time + days * DAY_MS);
}

export function addWeeks(date: string, weeks: number) {
  return addDays(date, weeks * 7);
}

export function addCalendarMonths(date: string, months: number) {
  const parsed = parseDateOnly(date);
  if (!parsed) throw new Error("Invalid date-only value");
  const targetMonthIndex = parsed.year * 12 + (parsed.month - 1) + months;
  const targetYear = Math.floor(targetMonthIndex / 12);
  const targetMonth = targetMonthIndex % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return formatDateOnly(Date.UTC(targetYear, targetMonth, Math.min(parsed.day, lastDay)));
}

export function getNextSelectedWeekday(date: string, weekdays: number[]) {
  const parsed = parseDateOnly(date);
  if (!parsed || weekdays.length === 0) throw new Error("A valid date and at least one weekday are required");
  const currentDay = new Date(parsed.time).getUTCDay();
  const distances = weekdays.map((weekday) => ((weekday - currentDay + 7) % 7) || 7);
  return addDays(date, Math.min(...distances));
}

export function calculateNextDue(lastPerformedDate: string, cycle: Cycle) {
  if (cycle === null || !validateCycle(cycle).valid) return null;
  if (cycle.unit === "day") return addDays(lastPerformedDate, cycle.interval);
  if (cycle.unit === "month") return addCalendarMonths(lastPerformedDate, cycle.interval);
  if ((cycle.weekdays ?? []).length > 0) return getNextSelectedWeekday(lastPerformedDate, cycle.weekdays ?? []);
  return addWeeks(lastPerformedDate, cycle.interval);
}

export function dayDifference(from: string, to: string) {
  const start = parseDateOnly(from);
  const end = parseDateOnly(to);
  if (!start || !end) throw new Error("Invalid date-only value");
  return Math.round((end.time - start.time) / DAY_MS);
}

export function calculateLifecycle(input: {
  archived?: boolean;
  cycle: Cycle;
  historyCount: number;
  lastPerformedDate: string | null;
  today: string;
}) {
  if (input.archived) return { dDayLabel: "보관됨", dueLabel: "보관된 항목이에요", nextDueDate: null, status: "ARCHIVED" as const };
  if (input.historyCount === 0 || !input.lastPerformedDate) {
    return { dDayLabel: "기록 없음", dueLabel: "첫 기록이 필요해요", nextDueDate: null, status: "NO_HISTORY" as const };
  }
  if (input.cycle === null) {
    return { dDayLabel: "주기 없음", dueLabel: "관리주기가 없어요", nextDueDate: null, status: "NO_CYCLE" as const };
  }
  const nextDueDate = calculateNextDue(input.lastPerformedDate, input.cycle);
  if (!nextDueDate) throw new Error("Cannot calculate lifecycle for an invalid cycle");
  const effectiveDays = dayDifference(input.lastPerformedDate, nextDueDate);
  const daysUntilDue = dayDifference(input.today, nextDueDate);
  const upcomingWindow = Math.max(1, Math.min(5, Math.ceil(effectiveDays * 0.2)));
  const status: CycleLifecycle = daysUntilDue <= 0 ? "DUE" : daysUntilDue <= upcomingWindow ? "UPCOMING" : "NORMAL";
  const dDayLabel = daysUntilDue === 0 ? "D-Day" : daysUntilDue > 0 ? `D-${daysUntilDue}` : `D+${Math.abs(daysUntilDue)}`;
  const dueLabel = daysUntilDue === 0
    ? "오늘 관리 예정"
    : daysUntilDue > 0
      ? `관리일까지 ${daysUntilDue}일 남음`
      : `관리일 ${Math.abs(daysUntilDue)}일 지남`;
  return { dDayLabel, dueLabel, nextDueDate, status };
}

export function calculateMonthlyPreviews(anchorDate: string, interval: number, count: number) {
  return Array.from({ length: count }, (_, index) => addCalendarMonths(anchorDate, interval * (index + 1)));
}

import { addCalendarMonths, addDays, getDateOnlyWeekday, normalizeDateOnly } from "./cycle";
import type { DemoItem } from "./demo-data";

export type MonthEvent = {
  date: string;
  type: "ACTIVITY" | "DUE";
  itemId: string;
  activityId?: string;
};

export type MonthGridCell = {
  date: string;
  day: number;
  inCurrentMonth: boolean;
};

export function normalizeMonth(value: string) {
  return /^\d{4}-\d{2}$/.test(value) && normalizeDateOnly(`${value}-01`) ? value : null;
}

export function moveMonth(month: string, offset: number) {
  const normalized = normalizeMonth(month);
  if (!normalized || !Number.isInteger(offset)) throw new Error("Invalid month value");
  return addCalendarMonths(`${normalized}-01`, offset).slice(0, 7);
}

export function isDateInMonth(date: string, month: string) {
  const normalizedDate = normalizeDateOnly(date);
  const normalizedMonth = normalizeMonth(month);
  return Boolean(normalizedDate && normalizedMonth && normalizedDate.startsWith(`${normalizedMonth}-`));
}

export function getMonthGrid(month: string): MonthGridCell[] {
  const normalized = normalizeMonth(month);
  if (!normalized) throw new Error("Invalid month value");
  const firstDate = `${normalized}-01`;
  const gridStart = addDays(firstDate, -getDateOnlyWeekday(firstDate));
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return { date, day: Number(date.slice(8, 10)), inCurrentMonth: isDateInMonth(date, normalized) };
  });
}

export function buildMonthEvents(items: DemoItem[], month: string): MonthEvent[] {
  const normalizedMonth = normalizeMonth(month);
  if (!normalizedMonth) return [];
  const events: MonthEvent[] = [];

  for (const item of items) {
    if (item.status === "ARCHIVED") continue;
    for (const activity of item.history) {
      const date = normalizeDateOnly(activity.dateLabel);
      if (date && isDateInMonth(date, normalizedMonth)) {
        events.push({ activityId: activity.id, date, itemId: item.id, type: "ACTIVITY" });
      }
    }
    if (
      item.status !== "NO_HISTORY" &&
      item.status !== "NO_CYCLE" &&
      item.nextDueDate &&
      isDateInMonth(item.nextDueDate, normalizedMonth)
    ) {
      events.push({ date: item.nextDueDate, itemId: item.id, type: "DUE" });
    }
  }

  return events.sort((left, right) => left.date.localeCompare(right.date) || left.type.localeCompare(right.type));
}

export function groupEventsByDate(events: MonthEvent[]) {
  const grouped = new Map<string, MonthEvent[]>();
  for (const event of events) grouped.set(event.date, [...(grouped.get(event.date) ?? []), event]);
  return grouped;
}

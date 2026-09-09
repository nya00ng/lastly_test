"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { DemoItem } from "@/lib/demo-data";
import { buildMonthEvents, getMonthGrid, groupEventsByDate, moveMonth } from "@/lib/month-view";
import { ChevronIcon } from "./AppIcons";

type HomeMonthlyViewProps = {
  dueFilter: "ALL" | "DUE" | "UPCOMING" | "NORMAL";
  items: DemoItem[];
  selectedDate: string | null;
  selectedMonth: string;
  today: string;
  onSelectDate: (date: string) => void;
  onSelectMonth: (month: string) => void;
  onToday: () => void;
};

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];
const dueOrder: Record<DemoItem["status"], number> = {
  DUE: 0,
  UPCOMING: 1,
  NORMAL: 2,
  NO_HISTORY: 3,
  NO_CYCLE: 4,
  ARCHIVED: 5,
};

function koreanDateLabel(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

function EventRow({ item, showDday }: { item: DemoItem; showDday?: boolean }) {
  const tagSummary = item.tags.join(" · ");
  return (
    <Link
      className="focus-ring flex min-h-14 items-center justify-between gap-3 border-t border-[var(--divider)] py-3 first:border-t-0"
      href={`/items/${item.id}`}
    >
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold">{item.name}</span>
        {tagSummary ? <span className="mt-0.5 block truncate text-[13px] text-[var(--muted)]">{tagSummary}</span> : null}
      </span>
      {showDday ? <span className="shrink-0 text-[14px] font-semibold text-[var(--primary-strong)]">{item.dDayLabel}</span> : null}
    </Link>
  );
}

export function HomeMonthlyView({
  dueFilter,
  items,
  onSelectDate,
  onSelectMonth,
  onToday,
  selectedDate,
  selectedMonth,
  today,
}: HomeMonthlyViewProps) {
  const grid = useMemo(() => getMonthGrid(selectedMonth), [selectedMonth]);
  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const allEvents = useMemo(() => buildMonthEvents(items, selectedMonth), [items, selectedMonth]);
  const events = useMemo(
    () => allEvents.filter((event) => {
      if (event.type === "ACTIVITY" || dueFilter === "ALL") return true;
      return itemById.get(event.itemId)?.status === dueFilter;
    }),
    [allEvents, dueFilter, itemById],
  );
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);
  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];
  const selectedActivities = selectedEvents
    .filter((event) => event.type === "ACTIVITY")
    .map((event) => itemById.get(event.itemId))
    .filter((item): item is DemoItem => Boolean(item));
  const selectedDues = selectedEvents
    .filter((event) => event.type === "DUE")
    .map((event) => itemById.get(event.itemId))
    .filter((item): item is DemoItem => Boolean(item))
    .sort((left, right) => dueOrder[left.status] - dueOrder[right.status] || left.name.localeCompare(right.name, "ko"));

  return (
    <section aria-label="월간 보기" className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">
        <div className="flex min-h-14 items-center justify-between gap-2 px-1">
          <button
            aria-label="이전 달"
            className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--icon-line)]"
            onClick={() => onSelectMonth(moveMonth(selectedMonth, -1))}
            type="button"
          >
            <ChevronIcon className="h-5 w-5 rotate-180" />
          </button>
          <h2 className="text-[18px] font-semibold">{Number(selectedMonth.slice(0, 4))}년 {Number(selectedMonth.slice(5, 7))}월</h2>
          <button
            aria-label="다음 달"
            className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--icon-line)]"
            onClick={() => onSelectMonth(moveMonth(selectedMonth, 1))}
            type="button"
          >
            <ChevronIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 border-t border-[var(--divider)]" aria-hidden="true">
          {weekdayLabels.map((label) => <span className="py-2 text-center text-[12px] font-semibold text-[var(--muted)]" key={label}>{label}</span>)}
        </div>
        <div className="grid grid-cols-7 border-l border-t border-[var(--divider)]">
          {grid.map((cell) => {
            const cellEvents = eventsByDate.get(cell.date) ?? [];
            const activityCount = cellEvents.filter((event) => event.type === "ACTIVITY").length;
            const dueCount = cellEvents.filter((event) => event.type === "DUE").length;
            const visibleEvents = cellEvents.slice(0, 3);
            const overflow = cellEvents.length - visibleEvents.length;
            const isToday = cell.date === today;
            const isSelected = cell.date === selectedDate;
            const accessibilityLabel = `${koreanDateLabel(cell.date)}, 기록 ${activityCount}개, 관리 예정 ${dueCount}개`;

            return (
              <button
                aria-current={isToday ? "date" : undefined}
                aria-label={accessibilityLabel}
                aria-pressed={isSelected}
                className={`focus-ring relative flex min-h-12 min-w-0 flex-col items-center justify-center border-b border-r border-[var(--divider)] px-0.5 py-1 transition-colors ${cell.inCurrentMonth ? "bg-transparent" : "bg-[#fafaf8] text-[var(--muted)]"} ${isSelected ? "z-10 bg-[var(--soft-primary)] outline-2 outline-[var(--primary)] -outline-offset-2" : ""}`}
                disabled={!cell.inCurrentMonth}
                key={cell.date}
                onClick={() => onSelectDate(cell.date)}
                type="button"
              >
                <span className={`flex h-5 min-w-5 items-center justify-center text-[12px] ${isToday ? "rounded-full border border-[var(--primary-strong)] font-bold" : "font-medium"}`}>{cell.day}</span>
                <span className="mt-0.5 flex h-2 max-w-full items-center justify-center gap-0.5" aria-hidden="true">
                  {visibleEvents.map((event, index) => event.type === "ACTIVITY" ? (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary-strong)]" key={`${event.type}-${event.itemId}-${event.activityId ?? index}`} />
                  ) : (
                    <span className="h-2 w-2 shrink-0 rounded-full border border-[#a95550] bg-white" key={`${event.type}-${event.itemId}-${index}`} />
                  ))}
                  {overflow > 0 ? <span className="text-[8px] font-bold leading-none text-[var(--muted)]">+{overflow}</span> : null}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-center border-t border-[var(--divider)] py-2">
          <button aria-label="오늘" className="focus-ring min-h-11 rounded-lg px-5 text-[13px] font-medium text-[var(--primary)] hover:bg-[var(--soft-primary)]" onClick={onToday} type="button">오늘</button>
        </div>
      </div>

      {selectedDate ? (
        <section aria-live="polite">
          <h2 className="text-[17px] font-semibold">{koreanDateLabel(selectedDate)}</h2>
          {selectedActivities.length === 0 && selectedDues.length === 0 ? (
            <p className="mt-3 border-y border-[var(--divider)] py-5 text-center text-[13px] text-[var(--muted)]">이날의 기록이나 관리 예정이 없어요.</p>
          ) : (
            <div className="mt-3 space-y-5">
              {selectedActivities.length > 0 ? <section><h3 className="text-[14px] font-semibold">한 기록</h3><div className="mt-1 border-y border-[var(--divider)]">{selectedActivities.map((item, index) => <EventRow item={item} key={`${item.id}-${index}`} />)}</div></section> : null}
              {selectedDues.length > 0 ? <section><h3 className="text-[14px] font-semibold">관리 예정</h3><div className="mt-1 border-y border-[var(--divider)]">{selectedDues.map((item) => <EventRow item={item} key={item.id} showDday />)}</div></section> : null}
            </div>
          )}
        </section>
      ) : (
        <p className="border-y border-[var(--divider)] py-5 text-center text-[13px] text-[var(--muted)]">날짜를 선택해 기록과 관리 예정을 확인하세요.</p>
      )}
    </section>
  );
}

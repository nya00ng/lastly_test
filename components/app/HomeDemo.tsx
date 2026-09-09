"use client";

import { useState } from "react";
import { getCurrentLocalDate } from "@/lib/ai/date";
import { DemoAppShell } from "./DemoAppShell";
import { useDemoActivityStore } from "./DemoActivityProvider";
import { HomeItemRow } from "./HomeItemRow";
import { HomeMonthlyView } from "./HomeMonthlyView";
import { UnifiedComposer } from "./UnifiedComposer";
import { CalendarIcon, ChevronIcon, ListIcon, MicIcon, PlusIcon, PlusPenIcon, StatusFaceIcon } from "./AppIcons";
import type { DemoItem } from "@/lib/demo-data";
import type { LifecycleStatus } from "@/lib/types";

type HomeFilter = "ALL" | Extract<LifecycleStatus, "DUE" | "UPCOMING" | "NORMAL">;
type ComposerEntry = "text" | "voice";
type ViewMode = "list" | "month";

const summaryItems: Array<{
  label: string;
  status: Exclude<HomeFilter, "ALL">;
  mood: "due" | "normal" | "upcoming";
  baseTone: string;
  numberTone: string;
  selectedTone: string;
}> = [
  {
    label: "관리 필요",
    status: "DUE",
    mood: "due",
    baseTone: "bg-[#faeeee]",
    numberTone: "text-[#a95550]",
    selectedTone: "bg-[#f7e3e2]",
  },
  {
    label: "곧 관리",
    status: "UPCOMING",
    mood: "upcoming",
    baseTone: "bg-[#faf5e8]",
    numberTone: "text-[#8a6619]",
    selectedTone: "bg-[#f6edcf]",
  },
  {
    label: "괜찮아요",
    status: "NORMAL",
    mood: "normal",
    baseTone: "bg-[#eef6f1]",
    numberTone: "text-[#31795f]",
    selectedTone: "bg-[#e2f0e8]",
  },
];

const listHeading: Record<HomeFilter, string> = {
  ALL: "전체 기억",
  DUE: "관리 필요",
  UPCOMING: "곧 관리",
  NORMAL: "괜찮은 기억",
};

const lifecycleOrder: Record<LifecycleStatus, number> = {
  DUE: 0,
  UPCOMING: 1,
  NORMAL: 2,
  NO_CYCLE: 3,
  NO_HISTORY: 4,
  ARCHIVED: 5,
};

export function HomeDemo() {
  const { deleteItem, items } = useDemoActivityStore();
  const today = getCurrentLocalDate();
  const [filter, setFilter] = useState<HomeFilter>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState<string | null>(today);
  const [composerEntry, setComposerEntry] = useState<ComposerEntry | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DemoItem | null>(null);
  const [feedback, setFeedback] = useState("");
  const activeItems = items
    .filter((item) => item.status !== "ARCHIVED")
    .sort((left, right) => lifecycleOrder[left.status] - lifecycleOrder[right.status]);
  const filteredItems = activeItems.filter((item) => filter === "ALL" || item.status === filter);

  return (
    <DemoAppShell activeRoute="home">
      <section className="space-y-7 pb-[calc(88px+var(--safe-bottom))]">
        <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[var(--line)]" aria-label="관리 상태 요약">
          {summaryItems.map((item) => {
            const count = activeItems.filter((demoItem) => demoItem.status === item.status).length;

            return (
              <button
                aria-label={`${item.label} ${count}개`}
                aria-pressed={filter === item.status}
                className={[
                  "focus-ring relative flex min-h-[72px] flex-col items-center justify-center gap-1 border-l border-[var(--line)] px-1 py-2 transition-[background-color,transform] duration-150 ease-out first:border-l-0 active:scale-[0.97] motion-reduce:transform-none",
                  item.baseTone,
                  filter === item.status
                    ? `${item.selectedTone} z-10`
                    : "hover:brightness-[0.98]",
                ].join(" ")}
                key={item.status}
                onClick={() => setFilter((current) => (current === item.status ? "ALL" : item.status))}
                type="button"
              >
                {filter === item.status ? <span aria-hidden="true" className={`pointer-events-none absolute inset-[3px] rounded-lg border-2 ${item.numberTone}`} /> : null}
                <StatusFaceIcon className={["h-6 w-6", filter === item.status ? "stroke-[2.5]" : "", item.numberTone].join(" ")} mood={item.mood} />
                <span className={["text-[20px] leading-none", filter === item.status ? "font-bold" : "font-semibold", item.numberTone].join(" ")}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mx-auto grid w-[104px] grid-cols-2 rounded-lg bg-[var(--soft-primary)] p-1" aria-label="보기 방식">
          {([ ["list", "리스트 보기", ListIcon], ["month", "월간 보기", CalendarIcon] ] as const).map(([mode, label, Icon]) => (
            <button
              aria-label={label}
              aria-pressed={viewMode === mode}
              className={`focus-ring flex h-10 items-center justify-center rounded-lg transition-[background-color,transform] duration-150 ease-out active:scale-95 motion-reduce:transform-none ${viewMode === mode ? "border border-[var(--line)] bg-white text-[var(--primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]" : "text-[var(--muted)]"}`}
              key={mode}
              onClick={() => {
                setViewMode(mode);
              }}
              type="button"
            ><Icon className="h-5 w-5" /></button>
          ))}
        </div>

        {viewMode === "list" ? <section aria-live="polite">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold">{listHeading[filter]}</h2>
            <span className="text-[13px] font-medium text-[var(--muted)]">
              {filteredItems.length}개
            </span>
          </div>
          <div className="mt-2 border-y border-[var(--divider)]">
            {filteredItems.map((item) => (
              <HomeItemRow item={item} key={item.id} onRequestDelete={setDeleteTarget} />
            ))}
          </div>
        </section> : (
          <HomeMonthlyView
            dueFilter={filter}
            items={items}
            onSelectDate={setSelectedDate}
            onSelectMonth={(month) => {
              setSelectedMonth(month);
              setSelectedDate(null);
            }}
            onToday={() => {
              setSelectedMonth(today.slice(0, 7));
              setSelectedDate(today);
            }}
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            today={today}
          />
        )}
        {feedback ? (
          <p className="border-y border-[var(--divider)] py-3 text-center text-[13px] text-[var(--primary)]" role="status">
            {feedback}
          </p>
        ) : null}
      </section>

      <button
        aria-label="기록하거나 찾아보기"
        className="focus-ring fixed bottom-[calc(20px+var(--safe-bottom))] left-1/2 z-30 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[0_6px_18px_rgba(36,49,45,0.16)] transition-transform duration-150 ease-out active:-translate-x-1/2 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100"
        onClick={() => {
          setFeedback("");
          setActionSheetOpen(true);
        }}
        type="button"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
      {actionSheetOpen ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/20 px-3 pb-[var(--safe-bottom)] pt-16">
          <section aria-label="기록하거나 찾아보기" aria-modal="true" className="mx-auto w-full max-w-[480px] rounded-t-[20px] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-float)]" role="dialog">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-semibold">기록하거나 찾아보기</h2>
              <button aria-label="선택 창 닫기" className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)]" onClick={() => setActionSheetOpen(false)} type="button"><ChevronIcon className="h-5 w-5 rotate-90" /></button>
            </div>
            <div className="mt-4 grid gap-2">
              <button className="focus-ring flex min-h-14 items-center gap-3 rounded-xl border border-[var(--line)] px-4 text-[15px] font-semibold transition-transform duration-150 ease-out active:scale-[0.98] motion-reduce:transform-none" onClick={() => { setActionSheetOpen(false); setComposerEntry("voice"); }} type="button"><MicIcon className="h-5 w-5 text-[var(--icon-line)]" />말하기</button>
              <button className="focus-ring flex min-h-14 items-center gap-3 rounded-xl border border-[var(--line)] px-4 text-[15px] font-semibold transition-transform duration-150 ease-out active:scale-[0.98] motion-reduce:transform-none" onClick={() => { setActionSheetOpen(false); setComposerEntry("text"); }} type="button"><PlusPenIcon className="h-5 w-5 text-[var(--icon-line)]" />직접 입력</button>
            </div>
          </section>
        </div>
      ) : null}
      {deleteTarget ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/20 px-3 pb-[var(--safe-bottom)] pt-16">
          <section aria-label="항목 삭제" aria-modal="true" className="mx-auto w-full max-w-[480px] rounded-t-[20px] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-float)]" role="dialog">
            <h2 className="break-words text-[17px] font-semibold">{deleteTarget.name}을 삭제할까요?</h2>
            <p className="mt-2 text-[13px] leading-5 text-[var(--muted)]">이 항목의 지난 기록도 현재 데모 세션에서 함께 사라져요.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="focus-ring min-h-12 rounded-xl border border-[var(--line)] text-[14px] font-semibold" onClick={() => setDeleteTarget(null)} type="button">취소</button>
              <button className="focus-ring min-h-12 rounded-xl bg-[var(--danger)] text-[14px] font-semibold text-white" onClick={() => { deleteItem(deleteTarget.id); setDeleteTarget(null); }} type="button">삭제</button>
            </div>
          </section>
        </div>
      ) : null}
      {composerEntry ? (
        <UnifiedComposer
          initialEntry={composerEntry}
          mode="sheet"
          onClose={() => setComposerEntry(null)}
          onRecorded={setFeedback}
        />
      ) : null}
    </DemoAppShell>
  );
}

"use client";

import { useState } from "react";
import { DemoAppShell } from "./DemoAppShell";
import { DemoButton } from "./DemoButton";
import { CategoryIcon, ChevronIcon } from "./AppIcons";
import type { DemoItem } from "@/lib/demo-data";
import { formatCycle, normalizeDateOnly, type Cycle, type CycleUnit, validateCycle } from "@/lib/cycle";
import { useDemoActivityStore } from "./DemoActivityProvider";

type ItemDetailDemoProps = { itemId: string };
type DetailPanel = "name" | "tags" | "note" | "cycle" | null;

const detailStatusCopy: Record<DemoItem["status"], string> = {
  ARCHIVED: "보관됨", DUE: "관리 필요", NO_CYCLE: "주기 없음", NO_HISTORY: "기록 없음",
  NORMAL: "관리 중", UPCOMING: "곧 관리",
};

function displayDate(value: string) {
  const normalized = normalizeDateOnly(value);
  return normalized ? `${Number(normalized.slice(5, 7))}월 ${Number(normalized.slice(8, 10))}일` : value;
}

function Panel({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/20 px-4 pb-[calc(12px+var(--safe-bottom))]">
      <section aria-label={title} aria-modal="true" className="mx-auto max-h-[calc(100dvh-24px)] w-full max-w-[480px] overflow-y-auto rounded-t-[20px] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-float)]" role="dialog">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-[17px] font-semibold">{title}</h2>
          <button aria-label={`${title} 닫기`} className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)]" onClick={onClose} type="button"><ChevronIcon className="h-5 w-5 rotate-90" /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function SectionHeading({ action, children }: { action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="flex min-h-11 items-center justify-between gap-3"><h2 className="text-[17px] font-semibold">{children}</h2>{action}</div>;
}

function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className="focus-ring min-h-11 rounded-lg px-2 text-[13px] font-semibold text-[var(--primary-strong)]" onClick={onClick} type="button">{label}</button>;
}

export function ItemDetailDemo({ itemId }: ItemDetailDemoProps) {
  const { items, updateItemCycle, updateItemMetadata } = useDemoActivityStore();
  const item = items.find((candidate) => candidate.id === itemId);
  const [panel, setPanel] = useState<DetailPanel>(null);
  const [draftName, setDraftName] = useState("");
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [draftNote, setDraftNote] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [editError, setEditError] = useState("");
  const [draftCycleUnit, setDraftCycleUnit] = useState<"none" | CycleUnit>("none");
  const [draftCycleInterval, setDraftCycleInterval] = useState("1");
  const [draftWeekdays, setDraftWeekdays] = useState<number[]>([]);

  function openPanel(nextPanel: Exclude<DetailPanel, null>) {
    if (!item) return;
    setDraftName(item.name);
    setDraftTags([...item.tags]);
    setDraftNote(item.note ?? "");
    setTagInput("");
    setDraftCycleUnit(item.cycle?.unit ?? "none");
    setDraftCycleInterval(item.cycle ? String(item.cycle.interval) : "1");
    setDraftWeekdays([...(item.cycle?.weekdays ?? [])]);
    setEditError("");
    setPanel(nextPanel);
  }

  function closePanel() { setPanel(null); setEditError(""); }

  function saveMetadata(patch: Partial<Pick<DemoItem, "name" | "tags" | "note">>) {
    if (!item) return;
    const result = updateItemMetadata({
      itemId: item.id,
      name: patch.name ?? item.name,
      note: patch.note === undefined ? item.note ?? "" : patch.note ?? "",
      tags: patch.tags ?? item.tags,
    });
    if (result.ok) closePanel();
    else setEditError(result.message ?? "입력 내용을 확인해주세요.");
  }

  function addDraftTag() {
    const nextTag = tagInput.trim();
    if (!nextTag) return;
    if (nextTag.length > 30) return setEditError("태그는 30자 이하로 입력해주세요.");
    if (draftTags.includes(nextTag)) { setTagInput(""); return; }
    if (draftTags.length >= 10) return setEditError("태그는 최대 10개까지 추가할 수 있어요.");
    setDraftTags((current) => [...current, nextTag]);
    setTagInput("");
    setEditError("");
  }

  const draftCycle: Cycle = draftCycleUnit === "none" ? null : {
    interval: Number(draftCycleInterval), unit: draftCycleUnit,
    ...(draftCycleUnit === "week" && draftWeekdays.length > 0 ? { weekdays: draftWeekdays } : {}),
  };
  const cycleValidation = validateCycle(draftCycle);

  if (!item) {
    return <DemoAppShell activeRoute="items" backHref="/items" showBack title="항목 보기"><section className="flex min-h-[58vh] flex-col justify-center text-center"><h1 className="text-[26px] font-bold leading-8">항목을 찾을 수 없어요.</h1><p className="mt-3 text-[14px] text-[var(--muted)]">전체관리에서 다시 확인해주세요.</p><div className="mt-6"><DemoButton href="/items" tone="primary">전체관리로 가기</DemoButton></div></section></DemoAppShell>;
  }

  const nextDueCopy = item.nextDueDate ? `${displayDate(item.nextDueDate)} · ${item.dDayLabel}` : item.nextDueDateLabel;
  const history = item.history.slice(0, 10);

  return (
    <DemoAppShell activeRoute="items" backHref="/items" showBack title={item.name}>
      <div className="pb-8">
        <section className="border-b border-[var(--divider)] pb-6 pt-2">
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--soft-primary)] text-[var(--icon-line)]"><CategoryIcon category={item.category} className="h-[18px] w-[18px]" /></span>
            <div className="min-w-0 flex-1"><p className="text-[12px] text-[var(--muted)]">{item.category}</p><h1 className="mt-1 break-words text-[26px] font-bold leading-8">{item.name}</h1></div>
            <EditButton label="이름 수정" onClick={() => openPanel("name")} />
          </div>
          <p className="mt-4 inline-flex min-h-8 items-center border-l-2 border-[var(--primary)] pl-2 text-[13px] font-medium">{detailStatusCopy[item.status]}</p>
        </section>

        <section className="grid grid-cols-1 border-b border-[var(--divider)] min-[390px]:grid-cols-2">
          <div className="py-5 min-[390px]:pr-4"><p className="text-[13px] font-medium text-[var(--muted)]">마지막 수행</p><p className="mt-2 text-[18px] font-semibold">{displayDate(item.lastPerformedDateLabel)}</p></div>
          <div className="border-t border-[var(--divider)] py-5 min-[390px]:border-l min-[390px]:border-t-0 min-[390px]:pl-4"><p className="text-[13px] font-medium text-[var(--muted)]">다음 관리</p><p className="mt-2 break-words text-[18px] font-semibold">{nextDueCopy}</p></div>
        </section>

        <section className="border-b border-[var(--divider)] py-5"><DemoButton aria-label={`${item.name} 완료 기록하기`} href={`/record?item=${item.id}`} tone="primary">오늘 완료 기록</DemoButton></section>

        <section className="border-b border-[var(--divider)] py-5"><SectionHeading action={<EditButton label="세부 대상 수정" onClick={() => openPanel("tags")} />}>세부 대상</SectionHeading>{item.tags.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">{item.tags.map((tag) => <span className="rounded-lg border border-[var(--line)] bg-[var(--soft-primary)] px-3 py-2 text-[13px]" key={tag}>{tag}</span>)}</div> : <p className="mt-2 text-[14px] text-[var(--muted)]">등록된 세부 대상이 없어요.</p>}</section>
        <section className="border-b border-[var(--divider)] py-5"><SectionHeading action={<EditButton label="메모 수정" onClick={() => openPanel("note")} />}>메모</SectionHeading><p className="mt-2 whitespace-pre-wrap break-words text-[14px] leading-6 text-[var(--muted)]">{item.note ?? "메모 없음"}</p></section>
        <section className="border-b border-[var(--divider)] py-5"><SectionHeading action={<EditButton label="관리 주기 수정" onClick={() => openPanel("cycle")} />}>관리 주기</SectionHeading><p className="mt-2 text-[16px] font-semibold">{formatCycle(item.cycle)}</p></section>

        <section aria-labelledby="history-heading" className="py-5">
          <div className="flex min-h-11 items-center justify-between gap-3"><h2 className="text-[17px] font-semibold" id="history-heading">지난 기록</h2><span className="text-[13px] text-[var(--muted)]">{item.history.length}개</span></div>
          {history.length > 0 ? <ul className="mt-2 border-y border-[var(--divider)]">{history.map((entry) => <li className="flex min-h-14 items-center justify-between gap-3 border-t border-[var(--divider)] py-3 first:border-t-0" key={entry.id}><span className="shrink-0 text-[14px] font-semibold">{displayDate(entry.dateLabel)}</span><span className="min-w-0 truncate text-right text-[13px] text-[var(--muted)]">{entry.actionLabel}</span></li>)}</ul> : <p className="mt-2 border-y border-[var(--divider)] py-5 text-[14px] text-[var(--muted)]">아직 기록이 없어요.</p>}
        </section>
      </div>

      {panel === "name" ? <Panel onClose={closePanel} title="이름 수정"><label className="block text-[14px] font-semibold">이름<input autoFocus className="focus-ring mt-2 min-h-13 w-full rounded-xl border border-[var(--line)] px-4 text-[16px]" onChange={(event) => setDraftName(event.target.value)} value={draftName} /></label>{editError ? <p className="mt-3 text-[13px] font-semibold text-[var(--danger)]" role="alert">{editError}</p> : null}<div className="mt-5 grid grid-cols-2 gap-2"><DemoButton onClick={closePanel} tone="secondary">취소</DemoButton><DemoButton disabled={!draftName.trim()} onClick={() => saveMetadata({ name: draftName })} tone="primary">저장</DemoButton></div></Panel> : null}

      {panel === "tags" ? <Panel onClose={closePanel} title="세부 대상 수정"><label className="block text-[14px] font-semibold">새 세부 대상<div className="mt-2 flex gap-2"><input aria-label="새 세부 대상 추가" className="focus-ring min-h-12 min-w-0 flex-1 rounded-xl border border-[var(--line)] px-4 text-[15px]" onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addDraftTag(); } }} value={tagInput} /><button className="focus-ring min-h-12 shrink-0 rounded-xl border border-[var(--line)] px-4 text-[14px] font-semibold" onClick={addDraftTag} type="button">추가</button></div></label><div className="mt-4 flex flex-wrap gap-2">{draftTags.map((tag) => <button aria-label={`${tag} 태그 삭제`} className="focus-ring min-h-11 rounded-lg border border-[var(--line)] px-3 text-[13px] font-medium" key={tag} onClick={() => setDraftTags((current) => current.filter((candidate) => candidate !== tag))} type="button">{tag} ×</button>)}</div><p className="mt-3 text-[12px] text-[var(--muted)]">{draftTags.length}/10</p>{editError ? <p className="mt-2 text-[13px] font-semibold text-[var(--danger)]" role="alert">{editError}</p> : null}<div className="mt-5 grid grid-cols-2 gap-2"><DemoButton onClick={closePanel} tone="secondary">취소</DemoButton><DemoButton onClick={() => saveMetadata({ tags: draftTags })} tone="primary">저장</DemoButton></div></Panel> : null}

      {panel === "note" ? <Panel onClose={closePanel} title="메모 수정"><label className="block text-[14px] font-semibold">메모<textarea autoFocus className="focus-ring mt-2 min-h-36 w-full resize-none rounded-xl border border-[var(--line)] p-4 text-[15px] leading-6" onChange={(event) => setDraftNote(event.target.value)} value={draftNote} /></label><p className={`mt-2 text-right text-[12px] ${draftNote.length > 500 ? "text-[var(--danger)]" : "text-[var(--muted)]"}`}>{draftNote.length}/500</p>{draftNote.length > 500 ? <p className="mt-2 text-[13px] font-semibold text-[var(--danger)]" role="alert">메모는 500자 이하로 입력해주세요.</p> : null}<div className="mt-5 grid grid-cols-2 gap-2"><DemoButton onClick={closePanel} tone="secondary">취소</DemoButton><DemoButton disabled={draftNote.length > 500} onClick={() => saveMetadata({ note: draftNote })} tone="primary">저장</DemoButton></div></Panel> : null}

      {panel === "cycle" ? <Panel onClose={closePanel} title="관리 주기 수정"><fieldset><legend className="text-[14px] font-semibold">반복 단위</legend><div className="mt-2 grid grid-cols-4 gap-2">{([["none", "없음"], ["day", "일"], ["week", "주"], ["month", "월"]] as const).map(([unit, label]) => <button aria-pressed={draftCycleUnit === unit} className={`focus-ring min-h-12 rounded-xl border px-2 text-[13px] font-semibold ${draftCycleUnit === unit ? "border-[var(--primary)] bg-[var(--mint)]" : "border-[var(--line)]"}`} key={unit} onClick={() => { setDraftCycleUnit(unit); setEditError(""); }} type="button">{label}</button>)}</div></fieldset>{draftCycleUnit !== "none" ? <label className="mt-5 block text-[14px] font-semibold">반복 간격<div className="mt-2 flex items-center gap-3"><input aria-label="반복 간격" className="focus-ring min-h-13 min-w-0 flex-1 rounded-xl border border-[var(--line)] px-4 text-[18px]" inputMode="numeric" onChange={(event) => setDraftCycleInterval(event.target.value)} value={draftCycleInterval} /><span className="shrink-0 text-[15px] font-semibold">{draftCycleUnit === "day" ? "일마다" : draftCycleUnit === "week" ? "주마다" : "개월마다"}</span></div></label> : null}{draftCycleUnit === "week" ? <fieldset className="mt-5"><legend className="text-[14px] font-semibold">요일 지정 <span className="font-normal text-[var(--muted)]">(선택)</span></legend><div className="mt-2 grid grid-cols-7 gap-1.5">{[[1, "월"], [2, "화"], [3, "수"], [4, "목"], [5, "금"], [6, "토"], [0, "일"]].map(([day, label]) => { const selected = draftWeekdays.includes(day as number); return <button aria-pressed={selected} className={`focus-ring min-h-11 rounded-lg border text-[13px] font-semibold ${selected ? "border-[var(--primary)] bg-[var(--mint)]" : "border-[var(--line)]"}`} key={day} onClick={() => setDraftWeekdays((current) => selected ? current.filter((value) => value !== day) : [...current, day as number])} type="button">{label}</button>; })}</div></fieldset> : null}<p className="mt-3 text-[13px] text-[var(--muted)]">{cycleValidation.valid ? formatCycle(draftCycle) : cycleValidation.message}</p>{editError ? <p className="mt-2 text-[13px] font-semibold text-[var(--danger)]" role="alert">{editError}</p> : null}<div className="mt-5 grid grid-cols-2 gap-2"><DemoButton onClick={closePanel} tone="secondary">취소</DemoButton><DemoButton disabled={!cycleValidation.valid} onClick={() => { const result = updateItemCycle(item.id, draftCycle); if (result.ok) closePanel(); else setEditError(result.message ?? "관리 주기를 확인해주세요."); }} tone="primary">저장</DemoButton></div></Panel> : null}
    </DemoAppShell>
  );
}

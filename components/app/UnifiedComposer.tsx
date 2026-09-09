"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AiParseApiResponse, EnrichedParserSegment, ParserIntent } from "@/lib/ai/types";
import { getCurrentLocalDate } from "@/lib/ai/date";
import { matchDemoItems } from "@/lib/ai/demo-matching";
import { resolveDemoQuery, type DemoQueryResolution } from "@/lib/demo-query";
import type { DemoCategory } from "@/lib/demo-data";
import { useDemoActivityStore } from "./DemoActivityProvider";
import { DemoButton } from "./DemoButton";
import { CheckIcon, ChevronIcon, MicIcon } from "./AppIcons";
import { useVoiceRecognition } from "./useVoiceRecognition";

type ComposerView = "input" | "voice" | "processing" | "confirm" | "query" | "blocked" | "saved";
type ComposerEntry = "text" | "voice";

type ConfirmationDraft = {
  action: string;
  category: DemoCategory;
  date: string;
  itemName: string;
  selectedTags: string[];
  segment: EnrichedParserSegment;
};

type UnifiedComposerProps = {
  initialEntry?: ComposerEntry;
  initialItemId?: string;
  mode: "page" | "sheet";
  onClose?: () => void;
  onRecorded?: (message: string) => void;
};

function intentMessage(intent: ParserIntent, segment: EnrichedParserSegment) {
  if (intent === "NOT_COMPLETED") return "아직 하지 않은 일로 이해했어요. 기록하지 않았습니다.";
  if (intent === "PLANNED") return "앞으로 할 일로 이해했어요. LASTLY는 완료한 기억만 기록해요.";
  if (intent === "UNCERTAIN") return segment.clarification?.question || "실제로 한 일인지 조금 더 알려주세요.";
  if (intent === "UNKNOWN") return "무슨 기억인지 잘 이해하지 못했어요. 다시 말하거나 입력해주세요.";
  return "이 내용을 바로 기록하기는 어려워요. 다시 확인해주세요.";
}

function candidateMessage(segment: EnrichedParserSegment) {
  switch (segment.record_candidate_reason) {
    case "SCOPE_NOT_IN_SCOPE": return "생활관리 기록으로 남기기 어려운 내용이에요.";
    case "ACTION_REQUIRED": return "무엇을 했는지 한 번 더 적어주세요.";
    case "EXACT_DATE_REQUIRED": return "정확히 언제 했는지 확인이 필요해요.";
    case "FUTURE_DATE_BLOCKED": return "미래 날짜는 완료기록으로 남길 수 없어요.";
    case "CLARIFICATION_REQUIRED": return segment.clarification?.question || "한 가지를 더 확인해야 해요.";
    default: return intentMessage(segment.intent, segment);
  }
}

function formatActivityDate(value: string) {
  const match = value.match(/^(\d{4})[-.](\d{2})[-.](\d{2})$/);
  return match ? `${Number(match[2])}월 ${Number(match[3])}일` : value;
}

export function UnifiedComposer({ initialEntry = "text", initialItemId, mode, onClose, onRecorded }: UnifiedComposerProps) {
  const today = getCurrentLocalDate();
  const { addActivities, items } = useDemoActivityStore();
  const initialItem = items.find((item) => item.id === initialItemId);
  const [view, setView] = useState<ComposerView>(initialEntry === "voice" ? "voice" : "input");
  const [text, setText] = useState(initialItem ? `오늘 ${initialItem.name}했어` : "");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AiParseApiResponse | null>(null);
  const [drafts, setDrafts] = useState<ConfirmationDraft[]>([]);
  const [querySegments, setQuerySegments] = useState<EnrichedParserSegment[]>([]);
  const [querySelections, setQuerySelections] = useState<Record<string, string>>({});
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const parsingRef = useRef(false);
  const savingRef = useRef(false);
  const startedInitialVoice = useRef(false);
  const voice = useVoiceRecognition((nextTranscript) => {
    setText(nextTranscript);
    setView("voice");
  });

  useEffect(() => {
    if (initialEntry === "voice" && !startedInitialVoice.current) {
      startedInitialVoice.current = true;
      voice.start();
    }
  }, [initialEntry, voice]);

  const textEmpty = text.trim().length === 0;
  const textTooLong = text.length > 500;
  const canAnalyze = !textEmpty && !textTooLong && !isParsing;

  function resetToInput() {
    voice.reset();
    setResult(null);
    setDrafts([]);
    setQuerySegments([]);
    setQuerySelections({});
    setMessage("");
    setView("input");
  }

  function closeComposer() {
    voice.reset();
    onClose?.();
  }

  function routeSegments(segments: EnrichedParserSegment[]) {
    const intents = new Set(segments.map((segment) => segment.intent));
    if (intents.size === 1 && segments[0]?.intent === "QUERY") {
      setQuerySegments(segments);
      setQuerySelections({});
      setView("query");
      return;
    }
    if (intents.size === 1 && segments[0]?.intent === "COMPLETED") {
      const invalidSegment = segments.find((segment) => !segment.record_candidate);
      if (invalidSegment) {
        setMessage(candidateMessage(invalidSegment));
        setView("blocked");
        return;
      }
      setDrafts(segments.map((segment) => {
        const candidates = segment.item_match.candidates.filter((candidate) => candidate.matchType !== "NONE");
        const matchedInitial = initialItem && candidates.some((candidate) => candidate.name === initialItem.name);
        return {
          action: segment.normalized_action || "",
          category: (segment.demo_category || "기타") as DemoCategory,
          date: segment.performed_date || "",
          itemName: matchedInitial ? initialItem.name : candidates[0]?.name || "새 항목으로 기록",
          selectedTags: [...(segment.tag_candidates ?? [])],
          segment,
        };
      }));
      setView("confirm");
      return;
    }
    if (intents.size > 1) setMessage("기록과 조회가 함께 있어요. 한 번에 한 종류씩 다시 입력해주세요.");
    else if (segments[0]) setMessage(intentMessage(segments[0].intent, segments[0]));
    setView("blocked");
  }

  async function analyze(nextText = text) {
    const submittedText = nextText.trim();
    if (!submittedText || submittedText.length > 500 || parsingRef.current) return;
    parsingRef.current = true;
    setIsParsing(true);
    setView("processing");
    setMessage("");
    setResult(null);
    setText(submittedText);
    try {
      const response = await fetch("/api/ai/parse", {
        body: JSON.stringify({ text: submittedText }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as AiParseApiResponse;
      setResult(payload);
      if (!payload.ok) {
        setMessage(payload.message);
        setView("blocked");
        return;
      }
      if (payload.result_type === "TOO_MANY_ACTIONS") {
        setMessage("한 번에 최대 5개까지만 처리할 수 있어요. 내용을 나누어 다시 입력해주세요.");
        setView("blocked");
        return;
      }
      if (payload.segments.length === 0) {
        setMessage("내용을 이해하지 못했어요. 다시 입력해주세요.");
        setView("blocked");
        return;
      }
      const runtimeSegments = payload.segments.map((segment) => {
        const candidates = matchDemoItems(
          segment.normalized_action,
          items,
          segment.tag_candidates,
          { requireTagMatch: segment.intent === "QUERY" },
        );
        return {
          ...segment,
          item_match: {
            candidates,
            needs_review: candidates.length > 1,
          },
        };
      });
      routeSegments(runtimeSegments);
    } catch {
      setMessage("연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.");
      setView("blocked");
    } finally {
      parsingRef.current = false;
      setIsParsing(false);
    }
  }

  function updateDraft(index: number, patch: Partial<ConfirmationDraft>) {
    setDrafts((current) => current.map((draft, draftIndex) => draftIndex === index ? { ...draft, ...patch } : draft));
  }

  const draftsValid = drafts.length > 0 && drafts.every((draft) =>
    draft.action.trim().length > 0 && draft.date.trim().length > 0 && draft.date <= today,
  );

  function saveRecords() {
    if (!draftsValid || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    const saved = addActivities(drafts.map((draft) => ({
      action: draft.action,
      category: draft.category,
      itemName: draft.itemName === "새 항목으로 기록" ? draft.action : draft.itemName,
      performedDate: draft.date,
      selectedTags: draft.selectedTags,
    })));
    setIsSaving(false);
    savingRef.current = false;
    if (!saved) {
      setMessage("기록을 확인해주세요. 이번 내용은 저장되지 않았어요.");
      return;
    }
    if (mode === "sheet") {
      voice.reset();
      onRecorded?.(drafts.length > 1 ? `${drafts.length}개의 기억을 기록했어요.` : "기록했어요.");
      onClose?.();
      return;
    }
    setView("saved");
  }

  const queryResults: DemoQueryResolution[] = querySegments.map((segment) =>
    resolveDemoQuery(segment, items, querySelections[segment.segment_id]),
  );

  const content = <div className="space-y-6">
    {mode === "sheet" ? <div className="flex items-center justify-between gap-3">
      <h2 className="text-[17px] font-semibold leading-6">기록하거나 물어보세요</h2>
      <button aria-label="입력 닫기" className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--soft-primary)]" onClick={closeComposer} type="button"><ChevronIcon className="h-5 w-5 rotate-90" /></button>
    </div> : null}

    {view === "input" ? <section className="space-y-4">
      <button aria-label="음성으로 기록하거나 물어보기" className="focus-ring mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-transform active:scale-95" disabled={isParsing} onClick={() => { setView("voice"); voice.start(); }} type="button"><MicIcon className="h-7 w-7" /></button>
      <label className="block text-[14px] font-medium">기록하거나 물어볼 내용
        <textarea autoFocus={mode === "sheet" && initialEntry === "text"} className="focus-ring mt-2 min-h-36 w-full resize-none rounded-xl border border-[var(--line)] bg-white p-4 text-[16px] leading-7" onChange={(event) => setText(event.target.value)} placeholder="오늘 이불 빨았어 · 이불 언제 빨았지?" value={text} />
      </label>
      <div className="flex items-center justify-between gap-3 text-[13px]"><span className={textEmpty || textTooLong ? "text-[var(--danger)]" : "text-[var(--muted)]"}>{textEmpty ? "내용을 입력해주세요." : textTooLong ? "500자를 넘었어요." : "한 일을 기록하거나 지난 기록을 물어보세요."}</span><span className={textTooLong ? "shrink-0 text-[var(--danger)]" : "shrink-0 text-[var(--muted)]"}>{text.length}/500</span></div>
      <DemoButton disabled={!canAnalyze} onClick={() => analyze()} tone="primary">내용 이해하기</DemoButton>
    </section> : null}

    {view === "voice" ? <section className="space-y-5 text-center">
      {voice.state === "REQUESTING_PERMISSION" || voice.state === "LISTENING" ? <>
        <div><h3 className="text-[26px] font-bold leading-8">{voice.state === "REQUESTING_PERMISSION" ? "마이크를 준비하고 있어요" : "듣고 있어요"}</h3><p className="mt-2 text-[14px] text-[var(--muted)]">편하게 말해주세요. 예) 오늘 이불 빨았어</p></div>
        <div className="voice-ring mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[var(--soft-primary)] text-[var(--primary)]"><MicIcon className="h-10 w-10" /></div>
        {voice.interimTranscript ? <p className="text-[15px] font-semibold">{voice.interimTranscript}</p> : null}
        <DemoButton onClick={voice.stop} tone="primary">듣기 중지</DemoButton>
      </> : null}
      {voice.state === "TRANSCRIPT_READY" ? <div className="space-y-4 text-left">
        <h3 className="text-center text-[26px] font-bold leading-8">이렇게 들었어요</h3>
        <label className="block text-[14px] font-medium">말한 내용<textarea className="focus-ring mt-2 min-h-36 w-full resize-none rounded-xl border border-[var(--line)] bg-white p-4 text-[16px] leading-7" onChange={(event) => { voice.setTranscript(event.target.value); setText(event.target.value); }} value={voice.transcript} /></label>
        <div className="grid grid-cols-2 gap-2"><DemoButton disabled={isParsing} onClick={voice.retry} tone="secondary">다시 말하기</DemoButton><DemoButton disabled={voice.transcript.trim().length === 0 || voice.transcript.length > 500 || isParsing} onClick={() => analyze(voice.transcript)} tone="primary">이 내용으로 이해하기</DemoButton></div>
      </div> : null}
      {voice.state === "UNSUPPORTED" || voice.state === "PERMISSION_DENIED" || voice.state === "ERROR" ? <div className="space-y-4">
        <h3 className="text-[26px] font-bold leading-8">{voice.state === "UNSUPPORTED" ? "음성 입력을 사용할 수 없어요" : "음성을 듣지 못했어요"}</h3><p className="text-[14px] leading-6 text-[var(--muted)]">{voice.message}</p>
        {voice.state !== "UNSUPPORTED" ? <DemoButton onClick={voice.retry}>다시 말하기</DemoButton> : null}<DemoButton onClick={resetToInput} tone="primary">직접 입력하기</DemoButton>
      </div> : null}
    </section> : null}

    {view === "processing" ? <section aria-live="polite" className="py-14 text-center"><div className="animate-lastly-pulse mx-auto h-12 w-12 rounded-full bg-[var(--soft-primary)]" /><h3 className="mt-5 text-[17px] font-semibold">기억을 확인하고 있어요</h3></section> : null}

    {view === "confirm" ? <section className="space-y-4">
      <div><h3 className="text-[26px] font-bold leading-8">이렇게 기록할까요?</h3><p className="mt-1 text-[13px] text-[var(--muted)]">확인하기 전에는 기록되지 않아요.</p></div>
      {drafts.map((draft, index) => {
        const itemOptions = Array.from(new Set([...draft.segment.item_match.candidates.filter((candidate) => candidate.matchType !== "NONE").map((candidate) => candidate.name), ...(initialItem ? [initialItem.name] : []), "새 항목으로 기록"]));
        return <fieldset className="space-y-3 border-t border-[var(--divider)] pt-4 first:border-t-0 first:pt-0" key={draft.segment.segment_id}>
          {drafts.length > 1 ? <legend className="text-[14px] font-semibold">기억 {index + 1}</legend> : null}
          <label className="block text-[13px] font-medium text-[var(--muted)]">항목<input className="focus-ring mt-1 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-[14px] text-[var(--foreground)]" onChange={(event) => updateDraft(index, { action: event.target.value })} value={draft.action} /></label>
          <label className="block text-[13px] font-medium text-[var(--muted)]">날짜<input className="focus-ring mt-1 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-[14px] text-[var(--foreground)]" max={today} onChange={(event) => updateDraft(index, { date: event.target.value })} type="date" value={draft.date} /></label>
          <label className="block text-[13px] font-medium text-[var(--muted)]">관리 항목<select className="focus-ring mt-1 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-[14px] text-[var(--foreground)]" onChange={(event) => updateDraft(index, { itemName: event.target.value })} value={draft.itemName}>{itemOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
          {(draft.segment.tag_candidates ?? []).length > 0 ? <div>
            <p className="text-[14px] font-semibold">세부 대상</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(draft.segment.tag_candidates ?? []).map((tag) => {
                const selected = draft.selectedTags.includes(tag);
                const matchedItem = items.find((item) => item.name === draft.itemName);
                const isNew = !matchedItem?.tags.includes(tag);
                return <button
                  aria-pressed={selected}
                  className={selected
                    ? "focus-ring min-h-11 rounded-lg border border-[var(--primary)] bg-[var(--mint)] px-3 text-[13px] font-semibold"
                    : "focus-ring min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-[13px] font-semibold text-[var(--muted)]"}
                  key={tag}
                  onClick={() => updateDraft(index, {
                    selectedTags: selected
                      ? draft.selectedTags.filter((candidate) => candidate !== tag)
                      : [...draft.selectedTags, tag],
                  })}
                  type="button"
                >{selected ? "선택됨 · " : ""}{tag}{isNew ? " · 새 태그" : ""}</button>;
              })}
            </div>
            <p className="mt-2 text-[12px] text-[var(--muted)]">선택한 세부 대상만 기록 확인 후 항목에 반영돼요.</p>
          </div> : null}
          {draft.segment.date_resolution_source === "IMPLICIT_TODAY" ? <p className="text-[13px] text-[var(--muted)]">날짜 표현이 없어 오늘로 이해했어요.</p> : null}
        </fieldset>;
      })}
      {!draftsValid ? <p className="text-[13px] font-semibold text-[var(--danger)]">Action과 오늘 또는 과거의 정확한 날짜를 확인해주세요.</p> : null}
      <div className="grid grid-cols-2 gap-2"><DemoButton onClick={resetToInput} tone="secondary">취소</DemoButton><DemoButton disabled={!draftsValid || isSaving} onClick={saveRecords} tone="primary">기록하기</DemoButton></div>
    </section> : null}

    {view === "query" ? <section aria-live="polite" className="space-y-4"><h3 className="text-[26px] font-bold leading-8">찾은 기억</h3>
      {queryResults.map((queryResult) => {
        if (queryResult.type === "CLARIFICATION") return <p className="rounded-xl bg-[#f4f7f5] p-4 text-[15px] font-semibold" key={queryResult.segmentId}>{queryResult.question}</p>;
        if (queryResult.type === "AMBIGUOUS") return <div className="space-y-3" key={queryResult.segmentId}><p className="text-[15px] font-semibold">어떤 기억을 찾을까요?</p>{queryResult.candidates.map((candidate) => <DemoButton key={candidate} onClick={() => setQuerySelections((current) => ({ ...current, [queryResult.segmentId]: candidate }))} tone="secondary">{candidate}</DemoButton>)}</div>;
        if (queryResult.type === "NOT_FOUND") return <p className="rounded-xl bg-[#f4f7f5] p-4 text-[14px] text-[var(--muted)]" key={queryResult.segmentId}>관련된 기억을 찾지 못했어요.</p>;
        return <div className="border-y border-[var(--divider)] py-4" key={queryResult.segmentId}>
          <p className="text-[18px] font-semibold">{queryResult.queryTag ?? queryResult.item.name}</p>
          {queryResult.queryTag ? <p className="mt-1 text-[13px] text-[var(--muted)]">{queryResult.item.name} 항목의 최근 기록이에요.</p> : null}
          <p className="mt-2 text-[15px] text-[var(--muted)]">{formatActivityDate(queryResult.lastActivityDate)}에 기록했어요.</p>
          <Link className="focus-ring mt-4 inline-flex min-h-11 items-center font-semibold text-[var(--primary-strong)]" href={`/items/${queryResult.item.id}`}>{queryResult.item.name} 보기</Link>
        </div>;
      })}
      <DemoButton onClick={mode === "sheet" ? closeComposer : resetToInput} tone="primary">닫기</DemoButton>
    </section> : null}

    {view === "blocked" ? <section className="space-y-5 border-y border-[var(--divider)] py-8 text-center"><h3 className="text-[26px] font-bold leading-8">내용을 다시 확인해주세요</h3><p className="text-[14px] leading-6 text-[var(--muted)]">{message}</p><DemoButton onClick={resetToInput} tone="primary">다시 입력하기</DemoButton></section> : null}

    {view === "saved" ? <section className="space-y-5 py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--soft-primary)] text-[var(--primary)]"><CheckIcon className="h-6 w-6" /></span><h3 className="text-[26px] font-bold leading-8">기록했어요.</h3><p className="text-[14px] text-[var(--muted)]">현재 데모 세션에서 확인할 수 있어요.</p><DemoButton href="/" tone="primary">홈으로</DemoButton><DemoButton onClick={resetToInput} tone="secondary">계속 입력하기</DemoButton></section> : null}

    {result?.ok && result.mode === "MOCK" && view !== "processing" ? <p className="text-center text-[11px] text-[var(--muted)]">Mock Demo 결과</p> : null}
  </div>;

  if (mode === "sheet") return <div className="fixed inset-0 z-40 flex items-end bg-black/20 px-3 pb-[var(--safe-bottom)] pt-16"><section aria-label="기록하거나 물어보기" aria-modal="true" className="mx-auto max-h-full w-full max-w-[480px] overflow-y-auto rounded-t-[20px] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-float)]" role="dialog">{content}</section></div>;
  return content;
}

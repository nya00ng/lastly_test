"use client";

import { useState } from "react";
import type { AiParseApiResponse, EnrichedParserSegment } from "@/lib/ai/types";
import { DemoAppShell } from "./DemoAppShell";
import { DemoButton } from "./DemoButton";
import { CategoryIcon, CheckIcon, MicIcon } from "./AppIcons";

type RecordStep = "input" | "processing" | "confirm" | "manual" | "blocked" | "saved";

const fallbackDate = "2026-09-03";
const fallbackItemOptions = ["이불 세탁", "침구 정리", "칫솔 교체", "새 항목으로 기록"];

function getCandidateCopy(segment: EnrichedParserSegment | null) {
  if (!segment) return "직접 기록으로 이어갈 수 있어요.";
  if (segment.record_candidate) return "확인 후 기록할 수 있어요.";

  switch (segment.record_candidate_reason) {
    case "INTENT_NOT_COMPLETED":
      return "완료한 일인지 조금 더 확인이 필요해요.";
    case "SCOPE_NOT_IN_SCOPE":
      return "생활관리 기록으로 남기기 어려운 내용이에요.";
    case "ACTION_REQUIRED":
      return "무엇을 했는지 한 번 더 적어주세요.";
    case "EXACT_DATE_REQUIRED":
      return "정확히 언제 했는지 확인이 필요해요.";
    case "FUTURE_DATE_BLOCKED":
      return "미래 날짜는 완료기록으로 남길 수 없어요.";
    case "CLARIFICATION_REQUIRED":
      return segment.clarification?.question || "한 가지를 더 확인해야 해요.";
    default:
      return "직접 기록으로 이어갈 수 있어요.";
  }
}

export function RecordDemo() {
  const [step, setStep] = useState<RecordStep>("input");
  const [text, setText] = useState("오늘 이불 빨았어");
  const [action, setAction] = useState("이불 세탁");
  const [date, setDate] = useState(fallbackDate);
  const [item, setItem] = useState("이불 세탁");
  const [category, setCategory] = useState("생활");
  const [message, setMessage] = useState("");
  const [apiResult, setApiResult] = useState<AiParseApiResponse | null>(null);
  const [activeSegment, setActiveSegment] = useState<EnrichedParserSegment | null>(null);

  const isEmpty = text.trim().length === 0;
  const isTooLong = text.length > 500;
  const canAnalyze = !isEmpty && !isTooLong;
  const dateEmpty = date.trim().length === 0;
  const futureDate = date > fallbackDate;
  const canSave = action.trim().length > 0 && !dateEmpty && !futureDate;

  function applySegment(segment: EnrichedParserSegment) {
    const firstCandidate = segment.item_match.candidates[0]?.name || "새 항목으로 기록";

    setActiveSegment(segment);
    setAction(segment.normalized_action || "");
    setDate(segment.performed_date || fallbackDate);
    setCategory(segment.demo_category || "기타");
    setItem(firstCandidate);
    setMessage(getCandidateCopy(segment));
    setStep(segment.record_candidate ? "confirm" : "blocked");
  }

  async function analyzeRecord() {
    if (!canAnalyze) return;

    setStep("processing");
    setMessage("");
    setApiResult(null);
    setActiveSegment(null);

    try {
      const response = await fetch("/api/ai/parse", {
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as AiParseApiResponse;
      setApiResult(result);

      if (!result.ok) {
        setMessage(result.message);
        setAction("");
        setDate(fallbackDate);
        setItem("새 항목으로 기록");
        setCategory("기타");
        setStep("manual");
        return;
      }

      if (result.result_type === "TOO_MANY_ACTIONS") {
        setMessage("한 번에 최대 5개까지만 나눠 기록할 수 있어요. 이번 내용은 직접 나눠주세요.");
        setStep("blocked");
        return;
      }

      const segment = result.segments[0];
      if (!segment) {
        setMessage("기록으로 남길 내용을 찾지 못했어요. 직접 기록으로 이어갈 수 있어요.");
        setStep("manual");
        return;
      }

      applySegment(segment);
    } catch {
      setMessage("지금은 기록을 이해하기 어려워요. 직접 기록으로 이어갈 수 있어요.");
      setStep("manual");
    }
  }

  function startManualRecord() {
    setAction(activeSegment?.normalized_action || "");
    setDate(activeSegment?.performed_date || fallbackDate);
    setItem("새 항목으로 기록");
    setCategory(activeSegment?.demo_category || "기타");
    setStep("manual");
  }

  function resetInput() {
    setStep("input");
    setMessage("");
  }

  const itemOptions =
    activeSegment && activeSegment.item_match.candidates.length > 0
      ? activeSegment.item_match.candidates.map((candidate) => candidate.name)
      : fallbackItemOptions;
  const dedupedOptions = Array.from(new Set([...itemOptions, ...fallbackItemOptions]));

  return (
    <DemoAppShell activeRoute="record" title="기록하기">
      {step === "input" ? (
        <section className="space-y-5">
          <div>
            <h1 className="text-[26px] font-semibold leading-8">무엇을 했나요?</h1>
            <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
              오늘 한 생활관리를 한 문장으로 남겨보세요.
            </p>
          </div>
          <label className="block text-[14px] font-semibold">
            기록할 내용
            <textarea
              className="focus-ring mt-2 min-h-48 w-full resize-none rounded-[24px] border-0 bg-white p-5 text-[17px] leading-7 shadow-[var(--shadow-card)]"
              onChange={(event) => setText(event.target.value)}
              placeholder="예) 오늘 이불 빨았어"
              value={text}
            />
          </label>
          <p
            className={[
              "rounded-2xl px-4 py-3 text-[13px] font-medium",
              isEmpty || isTooLong
                ? "bg-[#ffe2dc] text-[#9f3e30]"
                : "bg-[var(--mint)] text-[var(--primary-strong)]",
            ].join(" ")}
          >
            {isEmpty
              ? "내용을 입력하면 이해할 수 있어요."
              : isTooLong
                ? `500자를 넘었어요. ${text.length}/500자`
                : `${text.length}/500자 · 이해할 준비가 됐어요.`}
          </p>
          <button
            className="focus-ring flex min-h-16 w-full items-center justify-center gap-3 rounded-[22px] bg-white text-[15px] font-semibold shadow-[var(--shadow-card)]"
            onClick={() => setMessage("말로 기록하기는 다음 데모 단계에서 연결돼요. 지금은 글로 남겨주세요.")}
            type="button"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mint)] text-[var(--primary)]">
              <MicIcon className="h-5 w-5" />
            </span>
            말로 기록하기
          </button>
          {message ? (
            <p className="rounded-2xl bg-white px-4 py-3 text-[13px] font-semibold text-[var(--muted)] shadow-[var(--shadow-card)]">
              {message}
            </p>
          ) : null}
          <DemoButton disabled={!canAnalyze} onClick={analyzeRecord} tone="primary">
            기록 이해하기
          </DemoButton>
        </section>
      ) : null}

      {step === "processing" ? (
        <section className="flex min-h-[58vh] flex-col items-center justify-center text-center">
          <div className="animate-lastly-pulse flex h-20 w-20 items-center justify-center rounded-[28px] bg-[var(--mint)] text-[var(--primary)]">
            <CategoryIcon category="생활" className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-[24px] font-semibold leading-8">
            LASTLY가 기록을 이해하고 있어요
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">
            입력한 문장을 확인 가능한 기록으로 정리하는 중이에요.
          </p>
        </section>
      ) : null}

      {step === "confirm" || step === "manual" ? (
        <section className="space-y-5">
          <div className="rounded-[26px] bg-white p-5 shadow-[var(--shadow-card)]">
            <p className="text-[13px] font-medium text-[var(--muted)]">내가 남긴 내용</p>
            <p className="mt-2 text-[20px] font-semibold leading-7">{text || "오늘 이불 빨았어"}</p>
            {apiResult?.ok ? (
              <p className="mt-3 text-[13px] font-medium text-[var(--muted)]">
                서버 날짜 기준 {apiResult.server_context.current_local_date}
              </p>
            ) : null}
          </div>
          <div className="rounded-[28px] bg-white p-5 shadow-[var(--shadow-card)]">
            <p className="text-[13px] font-medium text-[var(--muted)]">
              {step === "manual" ? "직접 확인해서 기록해요" : "LASTLY가 이렇게 이해했어요"}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--mint)] text-[var(--primary)]">
                <CategoryIcon category={category} className="h-6 w-6" />
              </span>
              <div>
                <span className="rounded-full bg-[var(--mint)] px-3 py-1 text-xs font-semibold text-[var(--primary-strong)]">
                  {category}
                </span>
                <h1 className="mt-2 text-[24px] font-semibold">{action || "기록 이름 입력"}</h1>
              </div>
            </div>
            {activeSegment?.date_resolution_source === "IMPLICIT_TODAY" ? (
              <p className="mt-4 rounded-2xl bg-[var(--sun)] px-4 py-3 text-[13px] font-semibold text-[#6b5523]">
                날짜 표현이 없어 오늘로 이해했어요.
              </p>
            ) : null}
            <label className="mt-5 block text-[14px] font-semibold">
              수행한 날
              <input
                className="focus-ring mt-2 min-h-12 w-full rounded-2xl border-0 bg-[#f2f4ef] px-4"
                onChange={(event) => setDate(event.target.value)}
                type="date"
                value={date}
              />
            </label>
            <label className="mt-4 block text-[14px] font-semibold">
              어떤 항목으로 기록할까요?
              <select
                className="focus-ring mt-2 min-h-12 w-full rounded-2xl border-0 bg-[#f2f4ef] px-4"
                onChange={(event) => setItem(event.target.value)}
                value={item}
              >
                {dedupedOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-[14px] font-semibold">
              기록할 이름
              <input
                className="focus-ring mt-2 min-h-12 w-full rounded-2xl border-0 bg-[#f2f4ef] px-4"
                onChange={(event) => setAction(event.target.value)}
                value={action}
              />
            </label>
            {message ? (
              <p className="mt-4 rounded-2xl bg-[var(--mint)] px-4 py-3 text-[13px] font-semibold text-[var(--primary-strong)]">
                {message}
              </p>
            ) : null}
            {!canSave ? (
              <p className="mt-4 rounded-2xl bg-[#ffe2dc] px-4 py-3 text-[13px] font-semibold text-[#9f3e30]">
                {futureDate ? "미래 날짜는 완료기록으로 남길 수 없어요." : "수행한 날을 확인해주세요."}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DemoButton disabled={!canSave} onClick={() => setStep("saved")} tone="primary">
              기록하기
            </DemoButton>
            <DemoButton onClick={resetInput} tone="secondary">
              수정하기
            </DemoButton>
          </div>
        </section>
      ) : null}

      {step === "blocked" ? (
        <section className="flex min-h-[58vh] flex-col justify-center space-y-5 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-[var(--sun)] text-[#6b5523]">
            <CategoryIcon category="기타" className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold leading-8">바로 기록하기 전에 확인이 필요해요</h1>
            <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">{message}</p>
          </div>
          <div className="space-y-2">
            <DemoButton onClick={startManualRecord} tone="primary">
              직접 기록하기
            </DemoButton>
            <DemoButton onClick={resetInput} tone="secondary">
              다시 입력하기
            </DemoButton>
          </div>
        </section>
      ) : null}

      {step === "saved" ? (
        <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[var(--primary)] text-white shadow-[var(--shadow-card)]">
            <CheckIcon className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-[26px] font-semibold">기록했어요!</h1>
          <p className="mt-3 text-[18px] font-semibold">{item}</p>
          <p className="mt-2 text-[14px] text-[var(--muted)]">데모 상태에서만 확인되는 기록이에요.</p>
          <div className="mt-8 w-full space-y-2">
            <DemoButton href="/items" tone="primary">
              관리 항목 보기
            </DemoButton>
            <DemoButton href="/" tone="secondary">
              홈으로
            </DemoButton>
          </div>
        </section>
      ) : null}
    </DemoAppShell>
  );
}

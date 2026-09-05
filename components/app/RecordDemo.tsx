"use client";

import { useEffect, useRef, useState } from "react";
import type { AiParseApiResponse, EnrichedParserSegment } from "@/lib/ai/types";
import { demoItems } from "@/lib/demo-data";
import { DemoAppShell } from "./DemoAppShell";
import { DemoButton } from "./DemoButton";
import { CategoryIcon, CheckIcon, MicIcon } from "./AppIcons";

type RecordStep = "input" | "voice" | "processing" | "confirm" | "manual" | "blocked" | "saved";
type VoiceState =
  | "IDLE"
  | "REQUESTING_PERMISSION"
  | "LISTENING"
  | "TRANSCRIPT_READY"
  | "PERMISSION_DENIED"
  | "UNSUPPORTED"
  | "ERROR";

const fallbackItemOptions = ["이불 세탁", "침구 정리", "칫솔 교체", "새 항목으로 기록"];
const quickItems = demoItems.slice(0, 6);

function getToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "09";
  const day = parts.find((part) => part.type === "day")?.value ?? "04";
  return `${year}-${month}-${day}`;
}

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function getVoiceErrorCopy(error: SpeechRecognitionErrorCode | "unknown") {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "마이크 사용이 허용되지 않았어요. 브라우저에서 마이크 권한을 허용해주세요.";
  }
  if (error === "audio-capture") {
    return "마이크를 찾지 못했어요. 기기 연결을 확인하거나 직접 입력해주세요.";
  }
  if (error === "no-speech" || error === "aborted") {
    return "음성을 잘 듣지 못했어요. 다시 말하거나 직접 입력해주세요.";
  }
  if (error === "network") {
    return "음성 인식 연결이 불안정해요. 다시 말하거나 직접 입력해주세요.";
  }
  return "음성 입력을 이어가기 어려워요. 다시 말하거나 직접 입력해주세요.";
}

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
  const today = getToday();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recognitionActiveRef = useRef(false);
  const voiceStateRef = useRef<VoiceState>("IDLE");
  const voiceTranscriptRef = useRef("");
  const [step, setStep] = useState<RecordStep>("input");
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [text, setText] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [action, setAction] = useState("이불 세탁");
  const [date, setDate] = useState(today);
  const [item, setItem] = useState("이불 세탁");
  const [category, setCategory] = useState("생활");
  const [message, setMessage] = useState("");
  const [apiResult, setApiResult] = useState<AiParseApiResponse | null>(null);
  const [activeSegment, setActiveSegment] = useState<EnrichedParserSegment | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      recognitionActiveRef.current = false;
    };
  }, []);

  function updateVoiceState(nextState: VoiceState) {
    voiceStateRef.current = nextState;
    setVoiceState(nextState);
  }

  function updateVoiceTranscript(nextTranscript: string) {
    voiceTranscriptRef.current = nextTranscript;
    setVoiceTranscript(nextTranscript);
  }

  function updateText(nextText: string) {
    setText(nextText);
    if (voiceStateRef.current === "TRANSCRIPT_READY") {
      updateVoiceTranscript(nextText);
    }
  }

  const isEmpty = text.trim().length === 0;
  const isTooLong = text.length > 500;
  const canAnalyze = !isEmpty && !isTooLong;
  const transcriptEmpty = voiceTranscript.trim().length === 0;
  const transcriptTooLong = voiceTranscript.length > 500;
  const canAnalyzeTranscript = !transcriptEmpty && !transcriptTooLong;
  const dateEmpty = date.trim().length === 0;
  const futureDate = date > today;
  const canSave = action.trim().length > 0 && !dateEmpty && !futureDate;

  function applySegment(segment: EnrichedParserSegment) {
    const firstCandidate = segment.item_match.candidates[0]?.name || "새 항목으로 기록";

    setActiveSegment(segment);
    setAction(segment.normalized_action || "");
    setDate(segment.performed_date || today);
    setCategory(segment.demo_category || "기타");
    setItem(firstCandidate);
    setMessage(getCandidateCopy(segment));
    setStep(segment.record_candidate ? "confirm" : "blocked");
  }

  async function analyzeRecord(nextText = text) {
    const candidateText = nextText.trim();
    if (!candidateText || candidateText.length > 500) return;

    setStep("processing");
    setMessage("");
    setApiResult(null);
    setActiveSegment(null);
    setText(candidateText);

    try {
      const response = await fetch("/api/ai/parse", {
        body: JSON.stringify({ text: candidateText }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as AiParseApiResponse;
      setApiResult(result);

      if (!result.ok) {
        setMessage(result.message);
        setAction("");
        setDate(today);
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
    setDate(activeSegment?.performed_date || today);
    setItem("새 항목으로 기록");
    setCategory(activeSegment?.demo_category || "기타");
    setStep("manual");
  }

  function resetInput() {
    stopVoiceRecognition();
    setStep("input");
    setMessage("");
  }

  function stopVoiceRecognition() {
    if (!recognitionActiveRef.current) return;
    recognitionActiveRef.current = false;
    recognitionRef.current?.stop();
  }

  function startVoiceRecognition() {
    const Recognition = getSpeechRecognitionConstructor();
    setMessage("");
    setInterimTranscript("");

    if (!Recognition) {
      updateVoiceState("UNSUPPORTED");
      setStep("voice");
      setMessage("이 브라우저에서는 음성 입력을 사용할 수 없어요.");
      return;
    }

    if (recognitionActiveRef.current) return;

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      recognitionActiveRef.current = true;
      updateVoiceState("LISTENING");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript.trim();
        if (!transcript) continue;
        if (result.isFinal) {
          finalText = `${finalText} ${transcript}`.trim();
        } else {
          interimText = `${interimText} ${transcript}`.trim();
        }
      }

      if (finalText) {
        updateVoiceTranscript(finalText);
        setText(finalText);
        updateVoiceState("TRANSCRIPT_READY");
        setMessage("이렇게 들은 내용을 확인하고 고칠 수 있어요.");
        setStep("input");
        if (recognitionActiveRef.current) {
          recognitionActiveRef.current = false;
          recognition.stop();
        }
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      recognitionActiveRef.current = false;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        updateVoiceState("PERMISSION_DENIED");
      } else {
        updateVoiceState("ERROR");
      }
      setMessage(getVoiceErrorCopy(event.error));
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;
      recognitionRef.current = null;
      if (voiceStateRef.current === "LISTENING") {
        if (voiceTranscriptRef.current.trim()) {
          updateVoiceState("TRANSCRIPT_READY");
        } else {
          updateVoiceState("ERROR");
          setMessage(getVoiceErrorCopy("no-speech"));
        }
      }
    };

    updateVoiceTranscript("");
    updateVoiceState("REQUESTING_PERMISSION");
    setStep("voice");

    try {
      recognition.start();
    } catch {
      recognitionActiveRef.current = false;
      updateVoiceState("ERROR");
      setMessage(getVoiceErrorCopy("unknown"));
    }
  }

  function retryVoice() {
    stopVoiceRecognition();
    updateVoiceTranscript("");
    setInterimTranscript("");
    startVoiceRecognition();
  }

  const itemOptions =
    activeSegment && activeSegment.item_match.candidates.length > 0
      ? activeSegment.item_match.candidates.map((candidate) => candidate.name)
      : fallbackItemOptions;
  const dedupedOptions = Array.from(new Set([...itemOptions, ...fallbackItemOptions]));

  return (
    <DemoAppShell activeRoute="record" title="기록하기">
      {step === "input" ? (
        <section className="space-y-6">
          <div className="flex justify-center pt-2">
            <button
              aria-label="말로 기록하기"
              className={[
                "focus-ring flex h-36 w-36 items-center justify-center rounded-full border border-[#9ecdbd] bg-[var(--mint)] text-[var(--primary-strong)] shadow-[var(--shadow-card)]",
                voiceState === "LISTENING" ? "voice-ring" : "",
              ].join(" ")}
              onClick={startVoiceRecognition}
              type="button"
            >
              <MicIcon className="h-14 w-14" />
            </button>
          </div>
          <label className="block text-[14px] font-semibold">
            <textarea
              className="focus-ring min-h-44 w-full resize-none rounded-[20px] border border-[var(--line)] bg-white p-5 text-[17px] leading-7 shadow-[var(--shadow-card)]"
              onChange={(event) => updateText(event.target.value)}
              placeholder="오늘 어떤 걸 기록할까요?"
              value={text}
            />
          </label>
          <div className="flex items-center justify-between text-[13px] font-medium">
            <span className={isEmpty || isTooLong ? "text-[var(--danger)]" : "text-[var(--muted)]"}>
              {isEmpty ? "내용을 입력해주세요." : isTooLong ? "500자를 넘었어요." : "기록할 수 있어요."}
            </span>
            <span className={isTooLong ? "text-[var(--danger)]" : "text-[var(--muted)]"}>{text.length}/500</span>
          </div>
          {message ? (
            <p className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-[13px] font-semibold text-[var(--muted)] shadow-[var(--shadow-card)]">
              {message}
            </p>
          ) : null}
          <section className="space-y-3">
            <h2 className="text-[18px] font-semibold">자주 사용하는 항목</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickItems.map((item) => (
                <button
                  className="focus-ring flex min-h-14 items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-3 text-left text-[14px] font-semibold shadow-[var(--shadow-card)]"
                  key={item.id}
                  onClick={() => updateText(`오늘 ${item.name}했어`)}
                  type="button"
                >
                  <CategoryIcon category={item.category} className="h-5 w-5 shrink-0 text-[var(--icon-line)]" />
                  <span className="min-w-0 truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </section>
          <DemoButton disabled={!canAnalyze} onClick={() => analyzeRecord()} tone="primary">
            기록하기
          </DemoButton>
        </section>
      ) : null}

      {step === "voice" ? (
        <section className="flex min-h-[64vh] flex-col justify-center space-y-6 text-center">
          {voiceState === "REQUESTING_PERMISSION" || voiceState === "LISTENING" ? (
            <>
              <div>
                <h1 className="text-[26px] font-semibold leading-8">
                  {voiceState === "REQUESTING_PERMISSION" ? "마이크를 준비하고 있어요" : "듣고 있어요"}
                </h1>
                <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">
                  편하게 말해주세요.
                  <br />
                  예) 오늘 이불 빨았어
                </p>
              </div>
              <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full border border-[#9ecdbd] bg-[var(--mint)] text-[var(--primary-strong)] voice-ring">
                <MicIcon className="h-16 w-16" />
              </div>
              {interimTranscript ? (
                <p className="rounded-2xl bg-white px-4 py-3 text-[15px] font-semibold shadow-[var(--shadow-card)]">
                  {interimTranscript}
                </p>
              ) : null}
              <DemoButton onClick={stopVoiceRecognition} tone="primary">
                듣기 중지
              </DemoButton>
              <DemoButton onClick={resetInput} tone="ghost">
                직접 입력하기
              </DemoButton>
            </>
          ) : null}

          {voiceState === "TRANSCRIPT_READY" ? (
            <div className="space-y-5 text-left">
              <div className="text-center">
                <h1 className="text-[26px] font-semibold leading-8">이렇게 들었어요</h1>
                <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">
                  내용을 확인하고 고칠 수 있어요.
                </p>
              </div>
              <label className="block text-[14px] font-semibold">
                들은 내용
                <textarea
                  className="focus-ring mt-2 min-h-44 w-full resize-none rounded-[20px] border border-[var(--line)] bg-white p-5 text-[17px] leading-7 shadow-[var(--shadow-card)]"
                  onChange={(event) => {
                    updateVoiceTranscript(event.target.value);
                    setText(event.target.value);
                  }}
                  value={voiceTranscript}
                />
              </label>
              <p
                className={[
                  "rounded-2xl px-4 py-3 text-[13px] font-medium",
                  transcriptEmpty || transcriptTooLong
                    ? "bg-[#ffe2dc] text-[#9f3e30]"
                    : "bg-[var(--mint)] text-[var(--primary-strong)]",
                ].join(" ")}
              >
                {transcriptEmpty
                  ? "들은 내용이 비어 있어요."
                  : transcriptTooLong
                    ? `500자를 넘었어요. ${voiceTranscript.length}/500자`
                    : `${voiceTranscript.length}/500자 · 이 내용으로 이해할 수 있어요.`}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <DemoButton onClick={retryVoice} tone="secondary">
                  다시 말하기
                </DemoButton>
                <DemoButton
                  disabled={!canAnalyzeTranscript}
                  onClick={() => analyzeRecord(voiceTranscript)}
                  tone="primary"
                >
                  이 내용으로 이해하기
                </DemoButton>
              </div>
            </div>
          ) : null}

          {voiceState === "UNSUPPORTED" || voiceState === "PERMISSION_DENIED" || voiceState === "ERROR" ? (
            <div className="space-y-5">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#ffe2dc] text-[#9f3e30]">
                <MicIcon className="h-9 w-9" />
              </div>
              <div>
                <h1 className="text-[24px] font-semibold leading-8">
                  {voiceState === "UNSUPPORTED" ? "음성 입력을 사용할 수 없어요" : "음성을 듣지 못했어요"}
                </h1>
                <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">
                  {message || "직접 입력으로 계속 기록할 수 있어요."}
                </p>
              </div>
              <div className="space-y-2">
                {voiceState !== "UNSUPPORTED" ? (
                  <DemoButton onClick={retryVoice} tone="primary">
                    다시 말하기
                  </DemoButton>
                ) : null}
                <DemoButton onClick={resetInput} tone={voiceState === "UNSUPPORTED" ? "primary" : "secondary"}>
                  직접 입력하기
                </DemoButton>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {step === "processing" ? (
        <section className="flex min-h-[58vh] flex-col items-center justify-center text-center">
          <div className="animate-lastly-pulse flex h-20 w-20 items-center justify-center rounded-[28px] border border-[var(--line)] bg-white text-[var(--icon-line)]">
            <CategoryIcon category="생활" className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-[24px] font-semibold leading-8">
            기록을 정리하고 있어요.
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">
            내용을 확인 가능한 기록으로 정리하는 중이에요.
          </p>
        </section>
      ) : null}

      {step === "confirm" || step === "manual" ? (
        <section className="space-y-5">
          <div className="rounded-[20px] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-card)]">
            <p className="text-[13px] font-medium text-[var(--muted)]">내가 남긴 내용</p>
            <p className="mt-2 text-[20px] font-semibold leading-7">{text || "오늘 이불 빨았어"}</p>
            {apiResult?.ok ? (
              <p className="mt-3 text-[13px] font-medium text-[var(--muted)]">
                서버 날짜 기준 {apiResult.server_context.current_local_date}
              </p>
            ) : null}
          </div>
          <div className="rounded-[20px] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-card)]">
            <p className="text-[13px] font-medium text-[var(--muted)]">
              {step === "manual" ? "직접 확인해서 기록해요" : "이렇게 기록할게요."}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-white text-[var(--icon-line)]">
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
                className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4"
                onChange={(event) => setDate(event.target.value)}
                type="date"
                value={date}
              />
            </label>
            <label className="mt-4 block text-[14px] font-semibold">
              어떤 항목으로 기록할까요?
              <select
                className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4"
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
                className="focus-ring mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4"
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

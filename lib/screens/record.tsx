"use client";

import { useMemo, useState } from "react";
import { ActionLink } from "@/components/ActionLink";
import { AIResultCard } from "@/components/AIResultCard";
import { BottomActionBar } from "@/components/BottomActionBar";
import { ClarificationPanel } from "@/components/ClarificationPanel";
import { FixtureStateTabs } from "@/components/FixtureStateTabs";
import { InfoGrid } from "@/components/InfoGrid";
import { StateBlock } from "@/components/StateBlock";
import {
  aiConfirmationFixture,
  aiProcessingStateFixtures,
  clarificationFixtures,
  guardVariantFixtures,
  implicitTodayConfirmationFixture,
  itemMatchingCandidates,
  recordInputStateFixtures,
  voiceStateFixtures,
} from "@/lib/fixtures";
import type { AiConfirmationFixture } from "@/lib/types";
import {
  currentFixtureDate,
  ItemMatchingPanel,
  MultiActionPanel,
  StaticManualRecordSummary,
  toVariants,
} from "./shared";

export function RecordInputScreen() {
  const [text, setText] = useState("오늘 이불 빨았어");
  const trimmedLength = text.trim().length;
  const isEmpty = trimmedLength === 0;
  const isTooLong = text.length > 500;
  const canAnalyze = !isEmpty && !isTooLong;

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <label className="block text-sm font-bold">
          오늘 한 일을 알려주세요.
          <textarea
            className="focus-ring mt-2 min-h-32 w-full resize-none rounded-md border border-[var(--line)] p-4 text-base leading-7"
            onChange={(event) => setText(event.target.value)}
            placeholder="예: 오늘 이불 빨았어"
            value={text}
          />
        </label>
        <p
          className={[
            "mt-2 text-xs font-bold leading-5",
            isEmpty || isTooLong ? "text-[var(--danger)]" : "text-[var(--muted)]",
          ].join(" ")}
        >
          {isEmpty
            ? "내용을 입력하면 분석할 수 있어요."
            : isTooLong
              ? `500자를 넘었어요. ${text.length}/500자 · 입력을 줄이면 분석할 수 있어요.`
              : `${text.length}/500자 · 분석할 수 있어요.`}
        </p>
      </section>
      <FixtureStateTabs
        title="S11 input states"
        variants={toVariants(recordInputStateFixtures)}
      />
      <BottomActionBar>
        <ActionLink href="/screens/S12">음성으로 입력</ActionLink>
        <ActionLink disabled={!canAnalyze} href="/screens/S14" tone="primary">
          AI로 이해하기
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

export function VoiceListeningScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-5 text-center">
        <p className="text-xs font-bold text-[var(--primary)]">LISTENING</p>
        <h2 className="mt-2 text-2xl font-bold">말하는 중...</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          실제 microphone/STT Provider 없이 상태 전환만 확인합니다.
        </p>
      </section>
      <FixtureStateTabs
        title="Voice/STT states"
        variants={toVariants(voiceStateFixtures)}
      />
    </div>
  );
}

export function SttResultScreen() {
  const [transcript, setTranscript] = useState("오늘 이불 빨았어");
  const canAnalyze = transcript.trim().length > 0;

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <h2 className="text-base font-bold">이렇게 들었어요.</h2>
        <label className="mt-3 block text-sm font-bold">
          Transcript
          <textarea
            className="focus-ring mt-2 min-h-24 w-full resize-none rounded-md border border-[var(--line)] p-3"
            onChange={(event) => setTranscript(event.target.value)}
            value={transcript}
          />
        </label>
        <p
          className={[
            "mt-2 text-xs font-bold",
            canAnalyze ? "text-[var(--muted)]" : "text-[var(--danger)]",
          ].join(" ")}
        >
          {canAnalyze
            ? "수정한 문장으로 다음 분석을 진행합니다."
            : "빈 Transcript는 분석할 수 없습니다."}
        </p>
      </section>
      <FixtureStateTabs
        title="S13 transcript states"
        variants={toVariants(voiceStateFixtures.slice(2))}
      />
      <BottomActionBar>
        <ActionLink href="/screens/S12">다시 말하기</ActionLink>
        <ActionLink disabled={!canAnalyze} href="/screens/S14" tone="primary">
          분석하기
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

export function AiProcessingScreen() {
  return (
    <div className="space-y-4">
      <FixtureStateTabs
        title="S14 AI parser states"
        variants={toVariants(aiProcessingStateFixtures)}
      />
      <ManualRecordFlow />
    </div>
  );
}

export function AiConfirmationScreen() {
  return (
    <div className="space-y-4">
      <InteractiveAiConfirmation />
      <ItemMatchingPanel />
      <MultiActionPanel />
    </div>
  );
}

export function ClarificationScreen() {
  return (
    <div className="space-y-4">
      <section className="grid gap-3">
        {clarificationFixtures.map((clarification) => (
          <ClarificationPanel key={clarification.type} {...clarification} />
        ))}
      </section>
      <FixtureStateTabs
        title="S16 guard variants"
        variants={toVariants(guardVariantFixtures)}
      />
      <ItemMatchingPanel />
      <ManualRecordFlow />
    </div>
  );
}

export function RecordSavedScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-bold">
          이불 세탁을 2026-09-02에 기록했어요.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          실제 Server Save 성공 이후에만 표시해야 하는 성공 화면의 fixture입니다.
        </p>
        <div className="mt-4">
          <InfoGrid
            rows={[
              { label: "Item", value: "이불 세탁" },
              { label: "Performed Date", value: "2026-09-02" },
              { label: "Last Performed", value: "2026-09-02" },
              { label: "Cycle", value: "주기 없음" },
              { label: "Next Due", value: "없음" },
            ]}
          />
        </div>
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S25" tone="primary">
          관리주기 설정
        </ActionLink>
        <ActionLink href="/screens/S10">나중에</ActionLink>
      </BottomActionBar>
    </div>
  );
}

function InteractiveAiConfirmation() {
  const [fixtureMode, setFixtureMode] = useState<"EXPLICIT" | "IMPLICIT_TODAY">(
    "EXPLICIT",
  );
  const [action, setAction] = useState(aiConfirmationFixture.normalizedAction);
  const [date, setDate] = useState(aiConfirmationFixture.resolvedDate);
  const [item, setItem] = useState(aiConfirmationFixture.itemMatchingCandidate);
  const [cancelled, setCancelled] = useState(false);

  const result: AiConfirmationFixture = {
    ...aiConfirmationFixture,
    normalizedAction: action,
    resolvedDate: date,
    itemMatchingCandidate: item,
  };
  const needsMatchingReview = action !== aiConfirmationFixture.normalizedAction;
  const dateEmpty = date.trim().length === 0;
  const futureBlocked = date > currentFixtureDate;
  const canConfirm = !dateEmpty && !futureBlocked && !needsMatchingReview;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          className={[
            "focus-ring min-h-11 rounded-md border px-3 text-sm font-bold",
            fixtureMode === "EXPLICIT"
              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
              : "border-[var(--line)] bg-white",
          ].join(" ")}
          onClick={() => setFixtureMode("EXPLICIT")}
          type="button"
        >
          날짜가 있는 입력
          <span className="block text-[10px] font-semibold opacity-80">
            EXPLICIT
          </span>
        </button>
        <button
          className={[
            "focus-ring min-h-11 rounded-md border px-3 text-sm font-bold",
            fixtureMode === "IMPLICIT_TODAY"
              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
              : "border-[var(--line)] bg-white",
          ].join(" ")}
          onClick={() => setFixtureMode("IMPLICIT_TODAY")}
          type="button"
        >
          날짜가 없는 입력
          <span className="block text-[10px] font-semibold opacity-80">
            IMPLICIT_TODAY
          </span>
        </button>
      </div>
      {fixtureMode === "IMPLICIT_TODAY" ? (
        <ImplicitTodayPreview />
      ) : (
        <AIResultCard result={result} />
      )}
      <div className="rounded-md border border-[var(--line)] bg-white p-4">
        <h2 className="text-base font-bold">확인하고 고치기</h2>
        <label className="mt-3 block text-sm font-bold">
          기록할 내용
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            onChange={(event) => setAction(event.target.value)}
            value={action}
          />
        </label>
        <label className="mt-3 block text-sm font-bold">
          수행 날짜
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            onChange={(event) => setDate(event.target.value)}
            type="date"
            value={date}
          />
        </label>
        <label className="mt-3 block text-sm font-bold">
          어떤 항목으로 기록할까요?
          <select
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            onChange={(event) => setItem(event.target.value)}
            value={item}
          >
            {itemMatchingCandidates.map((candidate) => (
              <option key={candidate}>{candidate}</option>
            ))}
            <option>신규 Item으로 기록</option>
          </select>
        </label>
        <div className="mt-4 rounded-md border border-dashed border-[var(--line)] bg-[var(--background)] p-3 text-sm leading-6">
          {needsMatchingReview ? (
            <p className="font-bold text-[var(--danger)]">
              기록할 내용을 바꿨어요. 항목 후보를 다시 확인해주세요.
            </p>
          ) : (
            <p>선택한 항목 후보를 유지합니다.</p>
          )}
          {futureBlocked ? (
            <p className="mt-2 font-bold text-[var(--danger)]">
              미래 날짜는 완료기록으로 저장할 수 없어요.
            </p>
          ) : null}
          {dateEmpty ? (
            <p className="mt-2 font-bold text-[var(--danger)]">
              정확한 수행 날짜를 확인해주세요.
            </p>
          ) : null}
          {cancelled ? <p className="mt-2">Cancel: Activity는 생성되지 않습니다.</p> : null}
        </div>
        <div className="mt-4 grid gap-2">
          <ActionLink disabled={!canConfirm} href="/screens/S17" tone="primary">
            기록하기
          </ActionLink>
          <button
            className="focus-ring min-h-12 rounded-md border border-[var(--line)] bg-white px-4 text-sm font-bold"
            onClick={() => setCancelled(true)}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}

function ImplicitTodayPreview() {
  return (
    <section className="rounded-md border border-[var(--line)] bg-white p-4">
      <h2 className="text-base font-bold">날짜가 없는 완료 입력 예시</h2>
      <AIResultCard result={implicitTodayConfirmationFixture} />
      <div className="mt-4">
        <StateBlock
          title="날짜 표현이 없어 오늘로 이해했어요."
          description="이 안내는 날짜 없는 완료형 fixture에서만 표시합니다."
        />
      </div>
    </section>
  );
}

function ManualRecordFlow() {
  const [action, setAction] = useState("이불 세탁");
  const [date, setDate] = useState(currentFixtureDate);
  const [confirmed, setConfirmed] = useState(true);

  const actionEmpty = action.trim().length === 0;
  const dateEmpty = date.trim().length === 0;
  const futureBlocked = date > currentFixtureDate;
  const canContinue = !actionEmpty && !dateEmpty && !futureBlocked && confirmed;

  const guardText = useMemo(() => {
    if (actionEmpty) return "기록할 내용을 입력해주세요.";
    if (dateEmpty) return "정확한 수행 날짜가 필요합니다.";
    if (futureBlocked) return "미래 날짜는 완료기록으로 저장할 수 없어요.";
    if (!confirmed) return "생활관리 기록 확인 필요";
    return "확인 화면으로 이동할 수 있어요.";
  }, [actionEmpty, confirmed, dateEmpty, futureBlocked]);

  return (
    <section className="rounded-md border border-[var(--line)] bg-white p-4">
      <p className="text-xs font-bold text-[var(--primary)]">Manual Record Flow</p>
      <h2 className="mt-1 text-base font-bold">직접 기록하기</h2>
      <div className="mt-4 grid gap-3">
        <label className="block text-sm font-bold">
          Action
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            onChange={(event) => setAction(event.target.value)}
            value={action}
          />
        </label>
        <label className="block text-sm font-bold">
          Performed Date
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            onChange={(event) => setDate(event.target.value)}
            type="date"
            value={date}
          />
        </label>
        <label className="flex min-h-12 items-center gap-3 rounded-md border border-[var(--line)] px-3 text-sm font-bold">
          <input
            checked={confirmed}
            className="focus-ring"
            onChange={(event) => setConfirmed(event.target.checked)}
            type="checkbox"
          />
          생활관리 기록 확인
        </label>
      </div>
      <div className="mt-4 rounded-md border border-dashed border-[var(--line)] bg-[var(--background)] p-3 text-sm font-bold">
        {guardText}
      </div>
      <div className="mt-4 grid gap-2">
        <ActionLink disabled={!canContinue} href="/screens/S15" tone="primary">
          확인 화면으로
        </ActionLink>
        <ActionLink href="/screens/S16">Item Matching</ActionLink>
      </div>
    </section>
  );
}

export function ManualRecordFixture() {
  return <ManualRecordFlow />;
}

export function StaticManualRecordFixture() {
  return <StaticManualRecordSummary />;
}

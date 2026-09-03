"use client";

import { useMemo, useState } from "react";
import { ActionLink } from "@/components/ActionLink";
import { BottomActionBar } from "@/components/BottomActionBar";
import { FixtureStateTabs } from "@/components/FixtureStateTabs";
import { ManagementItemCard } from "@/components/ManagementItemCard";
import { StateBlock } from "@/components/StateBlock";
import { managementFixtures } from "@/lib/fixtures";
import {
  currentFixtureDate,
  notificationPermissionVariants,
  toVariants,
} from "./shared";

export function NotificationLandingScreen() {
  return (
    <div className="space-y-4">
      <ManagementItemCard item={managementFixtures[0]} />
      <FixtureStateTabs
        title="S30 notification states"
        variants={toVariants(notificationPermissionVariants("S30"))}
      />
      <BottomActionBar>
        <ActionLink href="/screens/S31" tone="primary">
          오늘 했어요
        </ActionLink>
        <ActionLink href="/screens/S32">다른 날 했어요</ActionLink>
        <ActionLink href="/screens/S33">나중에 알려줘</ActionLink>
      </BottomActionBar>
    </div>
  );
}

export function CompleteTodayScreen() {
  return (
    <div className="space-y-4">
      <StateBlock
        title="오늘 했어요"
        description="Duplicate Guard 뒤 오늘 날짜로 재기록하는 fixture입니다. 실제 Activity 저장은 없습니다."
      />
      <FixtureStateTabs
        title="Today complete guards"
        variants={toVariants([
          {
            id: "DUPLICATE_WARNING",
            label: "Duplicate",
            title: "오늘 이미 같은 기록이 있어요.",
            description: "추가로 기록할까요?",
            details: ["기존 기록 보기", "그래도 추가", "취소"],
            primaryHref: "/screens/S22",
            primaryLabel: "기존 기록 보기",
          },
          {
            id: "SAVE_READY",
            label: "Ready",
            title: "생활관리 기록 확인",
            description: "확인 후 fixture 성공 화면으로 이동합니다.",
            primaryHref: "/screens/S17",
            primaryLabel: "확인하기",
          },
        ])}
      />
    </div>
  );
}

export function CompleteOtherDateScreen() {
  const [completedDate, setCompletedDate] = useState("2026-09-01");
  const emptyDate = completedDate.trim().length === 0;
  const futureDate = completedDate > currentFixtureDate;
  const canConfirm = !emptyDate && !futureDate;
  const guardText = useMemo(() => {
    if (emptyDate) return "완료 날짜를 선택해주세요.";
    if (futureDate) return "미래 날짜는 완료기록으로 저장할 수 없어요.";
    if (completedDate === currentFixtureDate) {
      return "오늘 날짜로 확인할 수 있어요.";
    }
    return "선택한 과거 날짜로 확인할 수 있어요.";
  }, [completedDate, emptyDate, futureDate]);

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <label className="block text-sm font-bold">
          완료 날짜
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            onChange={(event) => setCompletedDate(event.target.value)}
            type="date"
            value={completedDate}
          />
        </label>
        <p
          className={[
            "mt-3 rounded-md border border-dashed p-3 text-sm font-bold",
            canConfirm
              ? "border-[var(--line)] bg-[var(--background)]"
              : "border-red-200 bg-red-50 text-[var(--danger)]",
          ].join(" ")}
        >
          {guardText}
        </p>
      </section>
      <FixtureStateTabs
        title="Other date guards"
        variants={toVariants([
          {
            id: "PAST_DATE",
            label: "Past",
            title: "정확한 과거 날짜",
            description: "History에 추가합니다. 최신 Last보다 오래된 경우 Last는 유지됩니다.",
            primaryHref: "/screens/S17",
            primaryLabel: "확인하기",
          },
          {
            id: "FUTURE_BLOCK",
            label: "Future",
            title: "미래 날짜 차단",
            description: "미래 날짜는 완료 Activity로 저장할 수 없습니다.",
            details: ["User Today 이하 날짜 선택 필요"],
          },
        ])}
      />
      <BottomActionBar>
        <ActionLink disabled={!canConfirm} href="/screens/S17" tone="primary">
          확인하기
        </ActionLink>
        <ActionLink href="/screens/S30">알림 화면으로</ActionLink>
      </BottomActionBar>
    </div>
  );
}

export function SnoozeScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <h2 className="text-base font-bold">나중에 알려줘</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["1일", "3일", "7일"].map((label) => (
            <button
              className="focus-ring min-h-12 rounded-md border border-[var(--line)] bg-white text-sm font-bold"
              key={label}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      <StateBlock
        title="완료로 기록되지 않아요."
        description="Activity 변화 없음, Next Due 변화 없음, DUE 유지, Notification만 연기하는 fixture입니다."
      />
      <BottomActionBar>
        <ActionLink href="/screens/S30" tone="primary">
          알림 화면으로
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

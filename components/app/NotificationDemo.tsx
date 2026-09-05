"use client";

import { useState } from "react";
import { DemoAppShell } from "./DemoAppShell";
import { DemoButton } from "./DemoButton";
import { BellIcon, CategoryIcon, CheckIcon } from "./AppIcons";
import { demoItems } from "@/lib/demo-data";

export function NotificationDemo() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const notificationItem = demoItems.find((item) => item.id === "bedding") ?? demoItems[0];

  return (
    <DemoAppShell activeRoute="home" title="알림">
      <section className="space-y-5">
        <div className="rounded-[22px] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-card)]">
          <div className="rounded-[18px] border border-[var(--line)] bg-[var(--background)] p-4 text-[var(--foreground)]">
            <div className="flex items-center justify-between text-[12px] font-semibold text-[var(--muted)]">
              <span>LASTLY</span>
              <span>지금</span>
            </div>
            <div className="mt-3 flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--mint)] text-[var(--icon-line)]">
                <BellIcon className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-[17px] font-semibold">{notificationItem.name}</h1>
                <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{notificationItem.memo}</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-[var(--muted)]">
            앱 안에서 확인하는 알림 데모 흐름입니다.
          </p>
        </div>

        <div className="rounded-[22px] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-card)]">
          <span className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-[var(--line)] bg-white text-[var(--icon-line)]">
            <CategoryIcon category="생활" className="h-7 w-7" />
          </span>
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[25px] font-semibold">{notificationItem.name}</h1>
              <p className="mt-1 text-[15px] leading-6 text-[var(--muted)]">{notificationItem.memo}</p>
            </div>
            <span className="rounded-full bg-[var(--status-due-bg)] px-3 py-1.5 text-[18px] font-semibold text-[#a95550]">
              {notificationItem.dDayLabel}
            </span>
          </div>
          <div className="mt-5 grid gap-2">
            <DemoButton href="/record" tone="primary">
              오늘 했어요
            </DemoButton>
            <DemoButton href="/record" tone="secondary">
              다른 날 했어요
            </DemoButton>
            <DemoButton onClick={() => setSheetOpen(true)} tone="ghost">
              나중에 알려줘
            </DemoButton>
          </div>
        </div>
      </section>

      {sheetOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/28 px-4"
          role="dialog"
        >
          <div className="w-full max-w-[480px] rounded-t-[30px] bg-white px-5 pb-[calc(20px+var(--safe-bottom))] pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.16)]">
            <div className="mx-auto h-1.5 w-11 rounded-full bg-[#d9ded7]" />
            <h2 className="mt-5 text-[21px] font-semibold">언제 다시 알려드릴까요?</h2>
            <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
              완료로 기록되지 않고, 관리 필요 상태는 그대로 유지돼요.
            </p>
            <div className="mt-5 grid gap-2">
              {["1일 후", "3일 후", "7일 후"].map((label) => (
                <button
                  className="focus-ring flex min-h-13 items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 text-[15px] font-semibold"
                  key={label}
                  onClick={() => setSheetOpen(false)}
                  type="button"
                >
                  {label}
                  <CheckIcon className="h-4 w-4 text-[var(--primary)]" />
                </button>
              ))}
              <button
                className="focus-ring min-h-12 rounded-2xl text-[15px] font-semibold text-[var(--muted)]"
                onClick={() => setSheetOpen(false)}
                type="button"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DemoAppShell>
  );
}

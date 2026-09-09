"use client";

import { useState } from "react";
import { DemoAppShell } from "./DemoAppShell";
import { DemoButton } from "./DemoButton";
import { BellIcon, CategoryIcon, CheckIcon } from "./AppIcons";
import { useDemoActivityStore } from "./DemoActivityProvider";

export function NotificationDemo() {
  const { items } = useDemoActivityStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const notificationItem = items.find((item) => item.id === "bedding") ?? items[0];
  if (!notificationItem) {
    return (
      <DemoAppShell activeRoute="home" showBack title="알림">
        <section className="flex min-h-[58vh] flex-col justify-center text-center">
          <h1 className="text-[26px] font-bold leading-8">알림으로 확인할 항목이 없어요.</h1>
          <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">새로운 기억을 기록하면 이곳에서 관리 알림 데모를 확인할 수 있어요.</p>
        </section>
      </DemoAppShell>
    );
  }
  const tagSummary = notificationItem.tags.join(" · ");

  return (
    <DemoAppShell activeRoute="home" showBack title="알림">
      <section className="space-y-7">
        <section className="border-b border-[var(--divider)] pb-6">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--soft-primary)] p-4 text-[var(--foreground)]">
            <div className="flex items-center justify-between text-[12px] font-semibold text-[var(--muted)]">
              <span>LASTLY</span>
              <span>지금</span>
            </div>
            <div className="mt-3 flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--icon-line)]">
                <BellIcon className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-[17px] font-semibold">{notificationItem.name}</h1>
                {tagSummary ? <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{tagSummary}</p> : null}
              </div>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-5 text-[var(--muted)]">
            앱 안에서 확인하는 알림 데모 흐름입니다.
          </p>
        </section>

        <section>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--soft-primary)] text-[var(--icon-line)]">
            <CategoryIcon category="생활" className="h-[18px] w-[18px]" />
          </span>
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[26px] font-bold leading-8">{notificationItem.name}</h1>
              {tagSummary ? <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{tagSummary}</p> : null}
            </div>
            <span className="shrink-0 text-[14px] font-semibold text-[#9b524d]">
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
        </section>
      </section>

      {sheetOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/28 px-4"
          role="dialog"
        >
          <div className="w-full max-w-[480px] rounded-t-[20px] bg-white px-5 pb-[calc(20px+var(--safe-bottom))] pt-3 shadow-[var(--shadow-float)]">
            <div className="mx-auto h-1.5 w-11 rounded-full bg-[#d9ded7]" />
            <h2 className="mt-5 text-[17px] font-semibold">언제 다시 알려드릴까요?</h2>
            <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
              완료로 기록되지 않고, 관리 필요 상태는 그대로 유지돼요.
            </p>
            <div className="mt-5 grid gap-2">
              {["1일 후", "3일 후", "7일 후"].map((label) => (
                <button
                  className="focus-ring flex min-h-12 items-center justify-between rounded-xl border border-[var(--line)] bg-white px-4 text-[14px] font-medium hover:bg-[var(--soft-primary)]"
                  key={label}
                  onClick={() => setSheetOpen(false)}
                  type="button"
                >
                  {label}
                  <CheckIcon className="h-4 w-4 text-[var(--primary)]" />
                </button>
              ))}
              <button
                className="focus-ring min-h-12 rounded-xl text-[14px] font-medium text-[var(--muted)] hover:bg-[var(--soft-primary)]"
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

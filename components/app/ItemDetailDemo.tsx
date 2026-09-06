"use client";

import { useState } from "react";
import { DemoAppShell } from "./DemoAppShell";
import { DemoButton } from "./DemoButton";
import { CategoryIcon, ChevronIcon } from "./AppIcons";
import { getDemoItemById, statusCopy, statusTone } from "@/lib/demo-data";

type ItemDetailDemoProps = {
  itemId: string;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 border-t border-[var(--divider)] py-3 first:border-t-0">
      <span className="shrink-0 text-[14px] font-medium text-[var(--muted)]">{label}</span>
      <span className="min-w-0 text-right text-[15px] font-semibold leading-6 text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function Panel({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/20 px-4 pb-[calc(12px+var(--safe-bottom))]">
      <section
        aria-label={title}
        className="mx-auto w-full max-w-[480px] rounded-[26px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_42px_rgba(23,35,31,0.18)]"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-[21px] font-semibold">{title}</h2>
          <button
            aria-label="닫기"
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)]"
            onClick={onClose}
            type="button"
          >
            <ChevronIcon className="h-5 w-5 rotate-90" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function ItemDetailDemo({ itemId }: ItemDetailDemoProps) {
  const item = getDemoItemById(itemId);
  const [panel, setPanel] = useState<"cycle" | "edit" | "history" | null>(null);
  const [displayName, setDisplayName] = useState(item?.name ?? "");
  const [displayMemo, setDisplayMemo] = useState(item?.memo ?? "");
  const [displayCycleLabel, setDisplayCycleLabel] = useState(item?.cycleLabel ?? "");
  const [draftName, setDraftName] = useState(displayName);
  const [draftMemo, setDraftMemo] = useState(displayMemo);
  const [draftCycle, setDraftCycle] = useState(item?.cycleDays ? String(item.cycleDays) : "");

  function openCyclePanel() {
    setDraftCycle(displayCycleLabel === "주기 없음" ? "" : displayCycleLabel.replace("일마다", ""));
    setPanel("cycle");
  }

  function openEditPanel() {
    setDraftName(displayName);
    setDraftMemo(displayMemo);
    setPanel("edit");
  }

  function closePanel() {
    setPanel(null);
  }

  if (!item) {
    return (
      <DemoAppShell activeRoute="items" backHref="/items" showBack title="항목 보기">
        <section className="flex min-h-[58vh] flex-col justify-center space-y-5 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-[var(--line)] bg-white text-[var(--icon-line)]">
            <ChevronIcon className="h-9 w-9 rotate-180" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold leading-8">항목을 찾을 수 없어요.</h1>
            <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">
              전체관리에서 다시 확인해주세요.
            </p>
          </div>
          <DemoButton href="/items" tone="primary">
            전체관리로 가기
          </DemoButton>
        </section>
      </DemoAppShell>
    );
  }

  return (
    <DemoAppShell activeRoute="items" backHref="/items" showBack title={displayName}>
      <section className="space-y-5">
        <section className="rounded-[22px] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] border border-[var(--line)] bg-white text-[var(--icon-line)]">
              <CategoryIcon category={item.category} className="h-8 w-8" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-[26px] font-semibold leading-8">{displayName}</h1>
                  <p className="mt-2 text-[15px] leading-6 text-[var(--muted)]">{displayMemo}</p>
                </div>
                <span
                  className={[
                    "shrink-0 rounded-full px-3 py-1.5 text-[15px] font-semibold leading-5",
                    statusTone[item.status],
                  ].join(" ")}
                >
                  {item.dDayLabel}
                </span>
              </div>
              <p className="mt-4 border-t border-[var(--divider)] pt-4 text-[14px] leading-6 text-[var(--muted)]">
                {statusCopy[item.status]} · {item.dueLabel}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[19px] font-semibold">관리 정보</h2>
          <div className="mt-4">
            <InfoRow label="관리 주기" value={displayCycleLabel} />
            <InfoRow label="다음 관리일" value={item.nextDueDateLabel} />
            <InfoRow label="최근 수행일" value={item.lastPerformedDateLabel} />
          </div>
        </section>

        <section className="rounded-[22px] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[19px] font-semibold">이력 요약</h2>
            <span className="text-[13px] font-medium text-[var(--muted)]">{item.history.length}개</span>
          </div>
          <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">{item.detail}</p>

          <div className="mt-5 border-t border-[var(--divider)] pt-4">
            <h3 className="text-[15px] font-semibold">최근 기록</h3>
            {item.history.length > 0 ? (
              <div className="mt-3 space-y-2">
                {item.history.map((history) => (
                  <div
                    className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-[#f7fbf9] px-4 py-3"
                    key={history.id}
                  >
                    <span className="text-[14px] font-semibold text-[var(--foreground)]">{history.dateLabel}</span>
                    <span className="min-w-0 text-right text-[14px] font-medium text-[var(--muted)]">
                      {history.actionLabel}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-2xl bg-[#f7fbf9] px-4 py-4 text-[14px] leading-6 text-[var(--muted)]">
                아직 수행기록이 없어요.
              </p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <DemoButton href={`/record?item=${item.id}`} tone="primary">
            오늘 했어요
          </DemoButton>
          <DemoButton onClick={openCyclePanel} tone="secondary">
            관리 주기 수정
          </DemoButton>
          <DemoButton onClick={openEditPanel} tone="secondary">
            항목 수정
          </DemoButton>
          <DemoButton onClick={() => setPanel("history")} tone="secondary">
            수행 기록 보기
          </DemoButton>
        </section>
      </section>

      {panel === "cycle" ? (
        <Panel onClose={closePanel} title="관리 주기">
          <label className="block text-[14px] font-semibold">
            <span className="sr-only">관리 주기</span>
            <div className="flex items-center gap-3">
              <input
                className="focus-ring min-h-13 min-w-0 flex-1 rounded-2xl border border-[var(--line)] px-4 text-[18px] font-semibold"
                inputMode="numeric"
                onChange={(event) => setDraftCycle(event.target.value)}
                placeholder="30"
                value={draftCycle}
              />
              <span className="shrink-0 text-[17px] font-semibold">일마다</span>
            </div>
          </label>
          <p className="mt-3 text-[13px] leading-5 text-[var(--muted)]">
            이 화면에서만 값을 바꿔보는 확인용 동작이에요.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <DemoButton onClick={closePanel} tone="secondary">
              취소
            </DemoButton>
            <DemoButton
              disabled={draftCycle.trim().length > 0 && !/^[1-9]\d*$/.test(draftCycle.trim())}
              onClick={() => {
                const nextCycle = draftCycle.trim();
                setDisplayCycleLabel(nextCycle ? `${nextCycle}일마다` : "주기 없음");
                closePanel();
              }}
              tone="primary"
            >
              적용
            </DemoButton>
          </div>
        </Panel>
      ) : null}

      {panel === "edit" ? (
        <Panel onClose={closePanel} title="항목 수정">
          <div className="space-y-4">
            <label className="block text-[14px] font-semibold">
              이름
              <input
                className="focus-ring mt-2 min-h-13 w-full rounded-2xl border border-[var(--line)] px-4 text-[16px] font-semibold"
                onChange={(event) => setDraftName(event.target.value)}
                value={draftName}
              />
            </label>
            <label className="block text-[14px] font-semibold">
              세부 메모
              <textarea
                className="focus-ring mt-2 min-h-24 w-full resize-none rounded-2xl border border-[var(--line)] p-4 text-[15px] leading-6"
                onChange={(event) => setDraftMemo(event.target.value)}
                value={draftMemo}
              />
            </label>
            <p className="text-[13px] leading-5 text-[var(--muted)]">
              적용한 내용은 현재 화면에서만 확인돼요.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <DemoButton
              onClick={closePanel}
              tone="secondary"
            >
              취소
            </DemoButton>
            <DemoButton
              disabled={draftName.trim().length === 0}
              onClick={() => {
                setDisplayName(draftName);
                setDisplayMemo(draftMemo);
                closePanel();
              }}
              tone="primary"
            >
              적용
            </DemoButton>
          </div>
        </Panel>
      ) : null}

      {panel === "history" ? (
        <Panel onClose={() => setPanel(null)} title="수행 기록">
          {item.history.length > 0 ? (
            <div className="space-y-2">
              {item.history.map((history) => (
                <div
                  className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-[#f7fbf9] px-4 py-3"
                  key={history.id}
                >
                  <span className="text-[14px] font-semibold text-[var(--foreground)]">{history.dateLabel}</span>
                  <span className="min-w-0 text-right text-[14px] font-medium text-[var(--muted)]">
                    {history.actionLabel}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-[#f7fbf9] px-4 py-4 text-[14px] leading-6 text-[var(--muted)]">
              아직 수행기록이 없어요.
            </p>
          )}
        </Panel>
      ) : null}
    </DemoAppShell>
  );
}

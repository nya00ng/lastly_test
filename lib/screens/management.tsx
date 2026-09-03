"use client";

import { useMemo, useState } from "react";
import { ActionLink } from "@/components/ActionLink";
import { ActivityRow } from "@/components/ActivityRow";
import { BottomActionBar } from "@/components/BottomActionBar";
import { FixtureStateTabs } from "@/components/FixtureStateTabs";
import { ManagementItemCard } from "@/components/ManagementItemCard";
import { StateBlock } from "@/components/StateBlock";
import {
  activeManagementFixtures,
  activityFixtures,
  managementFixtures,
} from "@/lib/fixtures";
import { currentFixtureDate, InfoPanel, toVariants } from "./shared";

export function AllManagementScreen() {
  return (
    <div className="space-y-4">
      <section className="space-y-3">
        {activeManagementFixtures.map((item) => (
          <ManagementItemCard href="/screens/S21" item={item} key={item.id} />
        ))}
      </section>
      <StateBlock
        title="전체 관리 항목"
        description="기록이 없거나 주기가 없는 항목도 여기에서 확인할 수 있습니다. 보관 항목은 기본 목록에 보이지 않습니다."
      />
    </div>
  );
}

export function ItemDetailScreen() {
  const item = managementFixtures[0];

  return (
    <div className="space-y-4">
      <ManagementItemCard item={item} />
      <InfoPanel
        rows={[
          { label: "Elapsed", value: "32일 지남" },
          { label: "Next Due", value: "2026-08-31" },
          { label: "Status", value: "관리 필요" },
        ]}
        title="Item detail"
      />
      <ActivityRow activity={activityFixtures[0]} />
      <BottomActionBar>
        <ActionLink href="/screens/S31" tone="primary">
          오늘 했어요
        </ActionLink>
        <ActionLink href="/screens/S22">수행이력</ActionLink>
        <ActionLink href="/screens/S25">주기 설정</ActionLink>
        <ActionLink href="/screens/S24">항목 수정</ActionLink>
      </BottomActionBar>
    </div>
  );
}

export function ActivityHistoryScreen() {
  return (
    <div className="space-y-3">
      {activityFixtures.map((activity) => (
        <ActivityRow activity={activity} editable key={activity.id} />
      ))}
      <StateBlock
        title="수행 이력이 기준입니다."
        description="각 기록은 누적해서 보존하며 마지막 수행일 하나로 과거 이력을 대체하지 않습니다."
      />
    </div>
  );
}

export function RecordEditScreen() {
  const [performedDate, setPerformedDate] = useState("2026-08-01");
  const [managementItem, setManagementItem] = useState("이불 세탁");
  const emptyDate = performedDate.trim().length === 0;
  const futureDate = performedDate > currentFixtureDate;
  const canSave = !emptyDate && !futureDate;
  const guardText = emptyDate
    ? "수행 날짜를 선택해주세요."
    : futureDate
      ? "미래 날짜는 완료기록으로 저장할 수 없어요."
      : "저장할 수 있는 수행 날짜입니다.";

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <label className="block text-sm font-bold">
          수행일
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            onChange={(event) => setPerformedDate(event.target.value)}
            type="date"
            value={performedDate}
          />
        </label>
        <label className="mt-4 block text-sm font-bold">
          Management Item
          <select
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            onChange={(event) => setManagementItem(event.target.value)}
            value={managementItem}
          >
            <option>이불 세탁</option>
            <option>침구 정리</option>
          </select>
        </label>
        <p
          className={[
            "mt-4 rounded-md border border-dashed p-3 text-sm font-bold",
            canSave
              ? "border-[var(--line)] bg-[var(--background)]"
              : "border-red-200 bg-red-50 text-[var(--danger)]",
          ].join(" ")}
        >
          {guardText}
        </p>
      </section>
      <InfoPanel
        title="읽기 전용 Snapshot"
        rows={[
          { label: "original_text", value: "오늘 이불 빨았어" },
          { label: "normalized_action_snapshot", value: "이불 세탁" },
          {
            label: "original AI parse snapshot",
            value: "COMPLETED / IN_SCOPE / EXACT",
          },
        ]}
      />
      <FixtureStateTabs
        title="Edit/Delete edge states"
        variants={toVariants([
          {
            id: "EDIT_FUTURE_BLOCK",
            label: "Future block",
            title: "미래 수행일 차단",
            description: "수정 후 performed_date도 User Today 이하만 허용합니다.",
            details: ["미래 날짜 선택 시 저장 불가", "입력값 유지"],
          },
          {
            id: "DELETE_LATEST",
            label: "Delete latest",
            title: "최신 Activity 삭제",
            description: "이전 Activity가 존재하면 이전 Record가 Last가 됩니다.",
            details: ["이전 Record = 2026-07-02", "Next Due 재계산"],
          },
          {
            id: "DELETE_ONLY",
            label: "Delete only",
            title: "마지막 하나 삭제",
            description: "last = null, next_due = null, status = NO_HISTORY",
            details: ["NO_CYCLE로 표시하지 않음", "실제 DB delete 없음"],
          },
        ])}
      />
      <BottomActionBar>
        <ActionLink disabled={!canSave} href="/screens/S21" tone="primary">
          저장하기
        </ActionLink>
        <ActionLink href="/screens/S50">삭제/오류 상태 보기</ActionLink>
      </BottomActionBar>
    </div>
  );
}

export function ItemEditScreen() {
  const [itemName, setItemName] = useState("이불 세탁");
  const canSave = itemName.trim().length > 0;

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <label className="block text-sm font-bold">
          Item Name
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            onChange={(event) => setItemName(event.target.value)}
            value={itemName}
          />
        </label>
        <p
          className={[
            "mt-3 rounded-md border border-dashed p-3 text-sm font-bold",
            canSave
              ? "border-[var(--line)] bg-[var(--background)]"
              : "border-red-200 bg-red-50 text-[var(--danger)]",
          ].join(" ")}
        >
          {canSave
            ? "저장할 수 있는 항목 이름입니다."
            : "항목 이름을 입력해주세요."}
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Item 이름 수정은 Activity History를 변경하지 않습니다.
        </p>
      </section>
      <StateBlock
        title="SHOULD actions separated"
        description="Archive, Restore, Merge는 SHOULD입니다. Core 흐름의 필수 단계로 만들지 않습니다."
      />
      <BottomActionBar>
        <ActionLink href="/screens/S25">주기 설정</ActionLink>
        <ActionLink disabled={!canSave} href="/screens/S21" tone="primary">
          저장하기
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

export function CycleSettingScreen() {
  const [cycle, setCycle] = useState("30");
  const numberValue = Number(cycle);
  const state = useMemo(() => {
    if (cycle.trim() === "") return "empty → NO_CYCLE";
    if (numberValue === 0) return "0 → invalid";
    if (numberValue < 0) return "negative → invalid";
    if (!Number.isInteger(numberValue)) return `${cycle} → non-integer → invalid`;
    return `${numberValue} → valid`;
  }, [cycle, numberValue]);
  const isValid = cycle.trim() === "" || (Number.isInteger(numberValue) && numberValue > 0);

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <label className="block text-sm font-bold">
          N일마다
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            onChange={(event) => setCycle(event.target.value)}
            type="number"
            value={cycle}
          />
        </label>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          주기는 사용자가 직접 정하며, 설정하지 않을 수도 있습니다. 기준일: {currentFixtureDate}
        </p>
        <p
          className={[
            "mt-3 rounded-md border border-dashed p-3 text-sm font-bold",
            isValid
              ? "border-[var(--line)] bg-[var(--background)]"
              : "border-red-200 bg-red-50 text-[var(--danger)]",
          ].join(" ")}
        >
          {isValid
            ? cycle.trim() === ""
              ? "주기를 설정하지 않는 상태입니다."
              : "저장할 수 있는 주기입니다."
            : "1 이상의 정수만 입력할 수 있어요."}
          <span className="mt-1 block text-xs font-semibold text-[var(--muted)]">
            Dev: {state}
          </span>
        </p>
      </section>
      <FixtureStateTabs
        title="S25 cycle states"
        variants={toVariants([
          {
            id: "NO_CYCLE",
            label: "empty",
            title: "empty → NO_CYCLE",
            description: "Next Due가 사라지고 관리 알림 대상에서 제외됩니다.",
            details: ["Cycle 설정 강제 없음", "History는 유지"],
          },
          {
            id: "VALID_CYCLE",
            label: "30",
            title: "30 → valid",
            description: "1 이상의 정수로 Next Due와 Status를 계산합니다.",
            details: ["next_due = last_performed_date + cycle_days"],
          },
          {
            id: "INVALID_ZERO",
            label: "0",
            title: "0 → invalid",
            description: "0일 주기는 저장할 수 없습니다.",
            details: ["유효값: 1 이상의 정수"],
          },
          {
            id: "INVALID_NEGATIVE",
            label: "negative",
            title: "negative → invalid",
            description: "음수 주기는 저장할 수 없습니다.",
            details: ["입력값 유지", "다시 선택"],
          },
        ])}
      />
      <BottomActionBar>
        <ActionLink disabled={!isValid} href="/screens/S21" tone="primary">
          저장하기
        </ActionLink>
        <ActionLink href="/screens/S41">이 기기에서 알림 받기</ActionLink>
      </BottomActionBar>
    </div>
  );
}

import { ActionLink } from "@/components/ActionLink";
import {
  FixtureStateTabs,
  type FixtureStateVariant,
} from "@/components/FixtureStateTabs";
import { InfoGrid } from "@/components/InfoGrid";
import { StateBlock } from "@/components/StateBlock";
import { itemMatchStateFixtures, multiActionSegments } from "@/lib/fixtures";

export const currentFixtureDate = "2026-09-02";

export function toVariants(
  rows: Array<{
    id: string;
    label: string;
    title: string;
    description: string;
    details?: string[];
    primaryHref?: string;
    primaryLabel?: string;
    secondaryHref?: string;
    secondaryLabel?: string;
  }>,
): FixtureStateVariant[] {
  return rows;
}

export function InfoPanel({
  rows,
  title,
}: {
  rows: Array<{ label: string; value: string }>;
  title: string;
}) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-white p-4">
      <h2 className="text-base font-bold">{title}</h2>
      <div className="mt-4">
        <InfoGrid rows={rows} />
      </div>
    </section>
  );
}

export function ItemMatchingPanel() {
  return (
    <FixtureStateTabs
      title="Item Matching states"
      variants={toVariants(itemMatchStateFixtures)}
    />
  );
}

export function MultiActionPanel() {
  const longOriginalText =
    "오늘 이불 빨았고, 에어컨 필터도 청소했는데 세탁조 청소는 내일 하려고 했어. 그리고 지난주쯤 욕실 환풍기도 닦은 것 같아서 정확한 날짜를 다시 골라야 해.";

  return (
    <section className="rounded-md border border-[var(--line)] bg-white p-4">
      <p className="text-xs font-bold text-[var(--primary)]">Multiple Actions</p>
      <h2 className="mt-1 text-base font-bold">2~5개 Segment 확인</h2>
      <div className="mt-3 grid gap-3">
        {multiActionSegments.map((segment) => (
          <article
            className="rounded-md border border-[var(--line)] bg-[var(--background)] p-3"
            key={segment.id}
          >
            <InfoGrid
              rows={[
                { label: "Source Text", value: segment.sourceText },
                { label: "Action", value: segment.action },
                { label: "Date", value: segment.date },
                { label: "Item", value: segment.item },
                { label: "Include / Exclude", value: segment.inclusion },
                { label: "Recordable", value: segment.recordability },
              ]}
            />
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {segment.note}
            </p>
          </article>
        ))}
      </div>
      <StateBlock
        title="Atomic save failure state"
        description="하나의 Segment가 Invalid면 전체 저장 보류, 문제 Segment 표시, 수정 후 다시 확인 상태로 남습니다."
      />
      <p className="mt-3 break-words rounded-md border border-dashed border-[var(--line)] p-3 text-sm leading-6">
        Long Original Text: {longOriginalText}
      </p>
    </section>
  );
}

export function StaticManualRecordSummary() {
  return (
    <section className="rounded-md border border-[var(--line)] bg-white p-4">
      <p className="text-xs font-bold text-[var(--primary)]">Manual Record Flow</p>
      <h2 className="mt-1 text-base font-bold">직접 기록하기</h2>
      <div className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted)]">
        <p>직접 입력 → 항목 확인 → 저장 전 확인 순서로 진행합니다.</p>
        <p>미래 날짜, 중복 가능성, 항목 선택, 최종 확인을 건너뛰지 않습니다.</p>
      </div>
      <div className="mt-4 grid gap-2">
        <ActionLink href="/screens/S16">Item Matching</ActionLink>
        <ActionLink href="/screens/S15" tone="primary">
          Confirmation
        </ActionLink>
      </div>
    </section>
  );
}

export function notificationPermissionVariants(screen: "S30" | "S41") {
  return [
    {
      id: "PERMISSION_GRANTED",
      label: "granted",
      title: "permission granted",
      description: "현재 기기에서 알림을 받을 수 있는 fixture 상태입니다.",
      details: ["Device/Browser 단위", "전역 서비스 Toggle 아님"],
    },
    {
      id: "PERMISSION_DENIED",
      label: "denied",
      title: "permission denied",
      description: "알림은 꺼져 있어요. 앱 안에서는 관리 필요 상태를 계속 확인할 수 있어요.",
      details: ["기록/History/Dashboard 사용 가능"],
    },
    {
      id: "NOT_REQUESTED",
      label: "not requested",
      title: "permission not requested",
      description: "첫 앱 진입 즉시 강제 요청하지 않고 맥락 있는 시점에 요청합니다.",
      details: ["Cycle 설정 후 안내 가능"],
    },
    {
      id: "UNSUPPORTED",
      label: "unsupported",
      title: "unsupported",
      description: "브라우저가 알림을 지원하지 않아도 Core 기록 흐름은 사용할 수 있습니다.",
      details: ["Text 기록", "History", "Dashboard"],
    },
    {
      id: "STALE_NOTIFICATION",
      label: "stale",
      title: "stale notification",
      description:
        screen === "S30"
          ? "이미 최신 기록이 있으면 오래된 완료 Action을 강제하지 않습니다."
          : "오래된 Push payload를 Source of Truth로 사용하지 않습니다.",
      details: ["최신 상태 재조회", "항목 보기", "홈으로"],
      primaryHref: "/screens/S21",
      primaryLabel: "항목 보기",
      secondaryHref: "/screens/S10",
      secondaryLabel: "홈으로",
    },
  ];
}

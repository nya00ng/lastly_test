import Link from "next/link";
import { ActionLink } from "@/components/ActionLink";
import { ActivityRow } from "@/components/ActivityRow";
import { AIResultCard } from "@/components/AIResultCard";
import { BottomActionBar } from "@/components/BottomActionBar";
import { ClarificationPanel } from "@/components/ClarificationPanel";
import { ManagementItemCard } from "@/components/ManagementItemCard";
import { ScreenFrame } from "@/components/ScreenFrame";
import { StateBlock } from "@/components/StateBlock";
import {
  activeManagementFixtures,
  activityFixtures,
  aiConfirmationFixture,
  archivedManagementFixtures,
  clarificationFixtures,
  dashboardFixtures,
  itemMatchingCandidates,
  managementFixtures,
} from "@/lib/fixtures";
import type { RouteKey, ScreenId } from "@/lib/types";

export const screenDefinitions: Array<{
  id: ScreenId;
  title: string;
  group: "Entry" | "Dashboard" | "Record" | "Management" | "Notification" | "Settings" | "Error";
}> = [
  { id: "S00", title: "Splash / App Entry", group: "Entry" },
  { id: "S01", title: "Login / Sign Up", group: "Entry" },
  { id: "S02", title: "Onboarding / Empty", group: "Entry" },
  { id: "S10", title: "Dashboard", group: "Dashboard" },
  { id: "S11", title: "Record Input", group: "Record" },
  { id: "S12", title: "Voice Listening", group: "Record" },
  { id: "S13", title: "STT Result", group: "Record" },
  { id: "S14", title: "AI Processing", group: "Record" },
  { id: "S15", title: "AI Confirmation", group: "Record" },
  { id: "S16", title: "Clarification", group: "Record" },
  { id: "S17", title: "Record Saved", group: "Record" },
  { id: "S20", title: "All Management Items", group: "Management" },
  { id: "S21", title: "Management Item Detail", group: "Management" },
  { id: "S22", title: "Activity History", group: "Management" },
  { id: "S23", title: "Record Edit", group: "Management" },
  { id: "S24", title: "Item Edit", group: "Management" },
  { id: "S25", title: "Cycle Setting", group: "Management" },
  { id: "S30", title: "Notification Landing", group: "Notification" },
  { id: "S31", title: "Complete Today", group: "Notification" },
  { id: "S32", title: "Complete Other Date", group: "Notification" },
  { id: "S33", title: "Snooze", group: "Notification" },
  { id: "S40", title: "Settings", group: "Settings" },
  { id: "S41", title: "Notification Permission / Device Setting", group: "Settings" },
  { id: "S50", title: "Generic Error / Recovery", group: "Error" },
];

export const screenIds = screenDefinitions.map((screen) => screen.id);

export function isScreenId(value: string): value is ScreenId {
  return screenIds.includes(value as ScreenId);
}

export function renderScreen(screenId: ScreenId) {
  const definition = screenDefinitions.find((screen) => screen.id === screenId);

  return (
    <ScreenFrame
      activeRoute={routeForScreen(screenId)}
      description="PHASE 1 fixture UI입니다. 실제 Auth, DB, AI, STT, Push Runtime은 연결되어 있지 않습니다."
      screenId={screenId}
      title={definition?.title ?? screenId}
    >
      {screenContent(screenId)}
    </ScreenFrame>
  );
}

function routeForScreen(screenId: ScreenId): RouteKey {
  if (screenId.startsWith("S2")) return "items";
  if (screenId.startsWith("S4")) return "settings";
  if (screenId.startsWith("S1") && screenId !== "S10") return "record";
  return "home";
}

function screenContent(screenId: ScreenId) {
  switch (screenId) {
    case "S00":
      return <SplashScreen />;
    case "S01":
      return <LoginScreen />;
    case "S02":
      return <OnboardingScreen />;
    case "S10":
      return <DashboardScreen />;
    case "S11":
      return <RecordInputScreen />;
    case "S12":
      return <VoiceListeningScreen />;
    case "S13":
      return <SttResultScreen />;
    case "S14":
      return <AiProcessingScreen />;
    case "S15":
      return <AiConfirmationScreen />;
    case "S16":
      return <ClarificationScreen />;
    case "S17":
      return <RecordSavedScreen />;
    case "S20":
      return <AllManagementScreen />;
    case "S21":
      return <ItemDetailScreen />;
    case "S22":
      return <ActivityHistoryScreen />;
    case "S23":
      return <RecordEditScreen />;
    case "S24":
      return <ItemEditScreen />;
    case "S25":
      return <CycleSettingScreen />;
    case "S30":
      return <NotificationLandingScreen />;
    case "S31":
      return <CompleteTodayScreen />;
    case "S32":
      return <CompleteOtherDateScreen />;
    case "S33":
      return <SnoozeScreen />;
    case "S40":
      return <SettingsScreen />;
    case "S41":
      return <DeviceNotificationScreen />;
    case "S50":
      return <ErrorRecoveryScreen />;
  }
}

function SplashScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-5">
        <p className="text-sm font-bold text-[var(--primary)]">
          캘린더는 앞으로 할 일을 기억합니다.
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight">
          LASTLY는 마지막으로 한 일을 기억합니다.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          기록, 기억, 관리, 알림, 재기록으로 이어지는 앱 진입 화면입니다.
        </p>
      </section>
      <StateBlock
        title="Loading state"
        description="세션 확인 중 화면을 fixture로 표시합니다. 실제 세션 검사는 PHASE 2 범위입니다."
      />
      <BottomActionBar>
        <ActionLink href="/screens/S01" tone="primary">
          로그인 화면으로
        </ActionLink>
        <ActionLink href="/screens/S10">Fixture 홈 보기</ActionLink>
      </BottomActionBar>
    </div>
  );
}

function LoginScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <label className="block text-sm font-bold">
          이메일
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            defaultValue="fixture@example.com"
            readOnly
          />
        </label>
        <label className="mt-4 block text-sm font-bold">
          비밀번호
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            defaultValue="fixture-only"
            readOnly
            type="password"
          />
        </label>
        <button
          className="mt-4 min-h-12 w-full rounded-md border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-slate-500"
          disabled
          type="button"
        >
          Runtime 연결 전
        </button>
      </section>
      <StateBlock
        title="Disabled state"
        description="실제 Supabase Auth는 구현하지 않았습니다. 이 화면은 진입 구조 확인용입니다."
      />
      <BottomActionBar>
        <ActionLink href="/screens/S02" tone="primary">
          온보딩 fixture로 이동
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function OnboardingScreen() {
  return (
    <div className="space-y-4">
      <StateBlock
        title="Empty state"
        description="아직 관리 항목이 없을 때 첫 기록을 유도하는 화면입니다."
      />
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <h2 className="text-base font-bold">처음 기록해볼까요?</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          “오늘 이불 빨았어”처럼 이미 한 일을 남기면 이후 관리 흐름으로 이어집니다.
        </p>
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S11" tone="primary">
          첫 기록 시작
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="space-y-4">
      <section className="space-y-3">
        {dashboardFixtures.map((item) => (
          <ManagementItemCard href="/screens/S21" item={item} key={item.id} />
        ))}
      </section>
      <StateBlock
        title="Dashboard filter"
        description="Dashboard에는 DUE, UPCOMING, NORMAL만 표시합니다. NO_HISTORY, NO_CYCLE, ARCHIVED는 제외됩니다."
      />
      <BottomActionBar>
        <ActionLink href="/screens/S11" tone="primary">
          기록하기
        </ActionLink>
        <ActionLink href="/screens/S20">전체 관리 보기</ActionLink>
      </BottomActionBar>
    </div>
  );
}

function RecordInputScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <label className="block text-sm font-bold">
          생활관리 행동
          <textarea
            className="focus-ring mt-2 min-h-32 w-full resize-none rounded-md border border-[var(--line)] p-4 text-base leading-7"
            defaultValue="오늘 이불 빨았어"
            maxLength={500}
            readOnly
          />
        </label>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
          Fixture 입력값입니다. 실제 저장은 발생하지 않습니다.
        </p>
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S12">음성으로 입력</ActionLink>
        <ActionLink href="/screens/S14" tone="primary">
          Text 분석 fixture
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function VoiceListeningScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-5 text-center">
        <p className="text-xs font-bold text-[var(--primary)]">Listening</p>
        <h2 className="mt-2 text-2xl font-bold">말하는 중...</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          실제 STT Provider 없이 녹음 중 상태만 fixture로 표시합니다.
        </p>
      </section>
      <StateBlock
        title="Permission/error state"
        description="마이크 권한 거부 시 Text fallback으로 돌아가는 구조를 확인합니다."
      />
      <BottomActionBar>
        <ActionLink href="/screens/S13" tone="primary">
          STT 결과 fixture
        </ActionLink>
        <ActionLink href="/screens/S11">Text로 입력</ActionLink>
      </BottomActionBar>
    </div>
  );
}

function SttResultScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <h2 className="text-base font-bold">음성 인식 결과</h2>
        <p className="mt-3 rounded-md border border-[var(--line)] bg-[var(--background)] p-3 text-base leading-7">
          오늘 이불 빨았어
        </p>
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S11">수정하기</ActionLink>
        <ActionLink href="/screens/S14" tone="primary">
          분석하기
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function AiProcessingScreen() {
  return (
    <div className="space-y-4">
      <StateBlock
        title="Loading state"
        description="AI 분석 중 화면입니다. 실제 AI API 호출 없이 다음 확인 화면으로 이어집니다."
      />
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <h2 className="text-base font-bold">검증 대기 항목</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          완료 여부, 범위, 행동, 날짜가 저장 가능 조건을 만족하는지 확인합니다.
        </p>
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S15" tone="primary">
          확인 결과 보기
        </ActionLink>
        <ActionLink href="/screens/S16">추가 확인 필요</ActionLink>
      </BottomActionBar>
    </div>
  );
}

function AiConfirmationScreen() {
  return (
    <div className="space-y-4">
      <AIResultCard result={aiConfirmationFixture} />
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <h2 className="text-base font-bold">Item Matching ambiguity</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Parser clarification enum이 아니라 UI 선택 상태로만 표현합니다.
        </p>
        <div className="mt-3 grid gap-2">
          {itemMatchingCandidates.map((candidate) => (
            <button
              className="min-h-11 rounded-md border border-[var(--line)] bg-white px-3 text-left text-sm font-semibold"
              key={candidate}
              type="button"
            >
              {candidate}
            </button>
          ))}
        </div>
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S17" tone="primary">
          Confirm
        </ActionLink>
        <ActionLink href="/screens/S16">Edit</ActionLink>
      </BottomActionBar>
    </div>
  );
}

function ClarificationScreen() {
  return (
    <div className="space-y-3">
      {clarificationFixtures.map((clarification) => (
        <ClarificationPanel key={clarification.type} {...clarification} />
      ))}
      <BottomActionBar>
        <ActionLink href="/screens/S15" tone="primary">
          확인 결과로 돌아가기
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function RecordSavedScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-bold">기록 확인 완료</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          DB 저장 성공을 의미하지 않는 PHASE 1 fixture 완료 화면입니다.
        </p>
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S10" tone="primary">
          Dashboard
        </ActionLink>
        <ActionLink href="/screens/S21">관리 항목 보기</ActionLink>
      </BottomActionBar>
    </div>
  );
}

function AllManagementScreen() {
  return (
    <div className="space-y-4">
      <section className="space-y-3">
        {activeManagementFixtures.map((item) => (
          <ManagementItemCard href="/screens/S21" item={item} key={item.id} />
        ))}
      </section>
      <StateBlock
        title="Lifecycle coverage"
        description="Active 목록에서 NO_HISTORY와 NO_CYCLE을 확인할 수 있습니다. ARCHIVED는 별도 보관 fixture로 분리됩니다."
      />
      {archivedManagementFixtures.map((item) => (
        <ManagementItemCard item={item} key={item.id} />
      ))}
    </div>
  );
}

function ItemDetailScreen() {
  const item = managementFixtures[0];

  return (
    <div className="space-y-4">
      <ManagementItemCard item={item} />
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <h2 className="text-base font-bold">최근 기록</h2>
        <ActivityRow activity={activityFixtures[0]} />
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S22">이력 보기</ActionLink>
        <ActionLink href="/screens/S24">항목 수정</ActionLink>
        <ActionLink href="/screens/S25" tone="primary">
          주기 설정
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function ActivityHistoryScreen() {
  return (
    <div className="space-y-3">
      {activityFixtures.map((activity) => (
        <ActivityRow activity={activity} editable key={activity.id} />
      ))}
      <StateBlock
        title="History source"
        description="Activity History가 source of truth이며 last date 하나로 대체하지 않습니다."
      />
    </div>
  );
}

function RecordEditScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <label className="block text-sm font-bold">
          수행일
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            defaultValue="2026-08-01"
            readOnly
          />
        </label>
        <label className="mt-4 block text-sm font-bold">
          관리 항목
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            defaultValue="이불 세탁"
            readOnly
          />
        </label>
      </section>
      <StateBlock
        title="Editable scope"
        description="일반 수정 대상은 performed_date와 동일 사용자 소유 관리 항목 이동입니다."
      />
      <BottomActionBar>
        <ActionLink href="/screens/S21" tone="primary">
          저장 fixture
        </ActionLink>
        <ActionLink href="/screens/S50" tone="danger">
          오류 상태 보기
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function ItemEditScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <label className="block text-sm font-bold">
          항목 이름
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            defaultValue="이불 세탁"
            readOnly
          />
        </label>
        <label className="mt-4 block text-sm font-bold">
          별칭
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            defaultValue="침구 빨래"
            readOnly
          />
        </label>
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S25">주기 설정</ActionLink>
        <ActionLink href="/screens/S21" tone="primary">
          저장 fixture
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function CycleSettingScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <h2 className="text-base font-bold">사용자 설정 주기</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["7일", "30일", "90일"].map((label) => (
            <button
              className="min-h-12 rounded-md border border-[var(--line)] bg-white text-sm font-bold"
              key={label}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          AI가 건강이나 안전 주기를 권위적으로 확정하지 않습니다.
        </p>
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S21" tone="primary">
          저장 fixture
        </ActionLink>
        <ActionLink href="/screens/S41">이 기기 알림 설정</ActionLink>
      </BottomActionBar>
    </div>
  );
}

function NotificationLandingScreen() {
  return (
    <div className="space-y-4">
      <ManagementItemCard item={managementFixtures[0]} />
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

function CompleteTodayScreen() {
  return (
    <div className="space-y-4">
      <StateBlock
        title="오늘 했어요"
        description="오늘 날짜로 재기록하는 fixture 화면입니다. 실제 Activity 저장은 수행하지 않습니다."
      />
      <BottomActionBar>
        <ActionLink href="/screens/S17" tone="primary">
          확인 fixture
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function CompleteOtherDateScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <label className="block text-sm font-bold">
          완료 날짜
          <input
            className="focus-ring mt-2 min-h-12 w-full rounded-md border border-[var(--line)] px-3"
            defaultValue="2026-09-01"
            readOnly
            type="date"
          />
        </label>
      </section>
      <StateBlock
        title="Future date guard"
        description="미래 completed Activity 금지는 이후 UI/API/DB 보호 계층에서 검증합니다."
      />
      <BottomActionBar>
        <ActionLink href="/screens/S17" tone="primary">
          확인 fixture
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function SnoozeScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <h2 className="text-base font-bold">나중에 알려줘</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["1일", "3일", "7일"].map((label) => (
            <button
              className="min-h-12 rounded-md border border-[var(--line)] bg-white text-sm font-bold"
              key={label}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      <StateBlock
        title="Snooze state"
        description="Snooze는 Activity를 만들지 않는 fixture 상태입니다."
      />
      <BottomActionBar>
        <ActionLink href="/screens/S30" tone="primary">
          알림 화면으로
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function SettingsScreen() {
  return (
    <div className="space-y-4">
      <Link
        className="focus-ring block rounded-md border border-[var(--line)] bg-white p-4"
        href="/screens/S41"
      >
        <h2 className="text-base font-bold">이 기기에서 알림 받기</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Device/Browser 단위 설정 화면으로 이동합니다.
        </p>
      </Link>
      <StateBlock
        title="Settings scope"
        description="서비스 전체 Global Notification Boolean처럼 표현하지 않습니다."
      />
    </div>
  );
}

function DeviceNotificationScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">이 기기에서 알림 받기</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              현재 브라우저와 기기에만 적용되는 fixture 설정입니다.
            </p>
          </div>
          <button
            className="min-h-11 rounded-md border border-[var(--line)] bg-white px-4 text-sm font-bold"
            type="button"
          >
            꺼짐
          </button>
        </div>
      </section>
      <StateBlock
        title="Runtime not implemented"
        description="실제 Push, VAPID, Notification Worker, subscription 저장은 PHASE 7 범위입니다."
      />
      <BottomActionBar>
        <ActionLink href="/screens/S40" tone="primary">
          설정으로
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

function ErrorRecoveryScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-red-200 bg-white p-4">
        <p className="text-xs font-bold text-[var(--danger)]">Error state</p>
        <h2 className="mt-1 text-xl font-bold">다시 시도할 수 있어요</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Raw DB, stack, secret은 사용자에게 노출하지 않는 복구 화면 fixture입니다.
        </p>
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S11" tone="primary">
          입력으로 돌아가기
        </ActionLink>
        <ActionLink href="/screens/S10">Dashboard</ActionLink>
      </BottomActionBar>
    </div>
  );
}

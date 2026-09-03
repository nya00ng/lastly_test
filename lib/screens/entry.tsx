import { ActionLink } from "@/components/ActionLink";
import { BottomActionBar } from "@/components/BottomActionBar";
import { FixtureStateTabs } from "@/components/FixtureStateTabs";
import { StateBlock } from "@/components/StateBlock";
import { toVariants } from "./shared";

export function SplashScreen() {
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
          앱을 열었을 때 로그인 상태와 첫 화면을 확인합니다.
        </p>
      </section>
      <FixtureStateTabs
        title="App Entry states"
        variants={toVariants([
          {
            id: "SESSION_VALID_DATA",
            label: "Data",
            title: "유효 Session + 데이터 있음",
            description: "Dashboard로 이동합니다.",
            primaryHref: "/screens/S10",
            primaryLabel: "Dashboard",
          },
          {
            id: "SESSION_VALID_EMPTY",
            label: "Empty",
            title: "유효 Session + 기록 없음",
            description: "첫 기록을 위한 Empty 화면으로 이동합니다.",
            primaryHref: "/screens/S02",
            primaryLabel: "Onboarding",
          },
          {
            id: "SESSION_NONE",
            label: "Login",
            title: "Session 없음",
            description: "로그인/가입 화면으로 이동합니다.",
            primaryHref: "/screens/S01",
            primaryLabel: "Login",
          },
          {
            id: "SESSION_ERROR",
            label: "Error",
            title: "Session 복구 실패",
            description: "입력 없이 복구 가능한 에러 화면으로 이동합니다.",
            primaryHref: "/screens/S50",
            primaryLabel: "Error",
          },
        ])}
      />
    </div>
  );
}

export function LoginScreen() {
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
          Auth Runtime 연결 전
        </button>
      </section>
      <FixtureStateTabs
        title="Auth fixture states"
        variants={toVariants([
          {
            id: "AUTH_LOADING",
            label: "Loading",
            title: "인증 처리 중",
            description: "중복 Submit을 막는 Disabled 상태입니다.",
            details: ["실제 Supabase Auth 없음", "다른 사용자 데이터 노출 없음"],
          },
          {
            id: "VALIDATION_ERROR",
            label: "Error",
            title: "입력 오류",
            description: "입력값을 유지하고 다시 시도할 수 있게 합니다.",
            details: ["Form Label 존재", "Focus visible 적용"],
          },
        ])}
      />
      <BottomActionBar>
        <ActionLink href="/screens/S02" tone="primary">
          온보딩으로 이동
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

export function OnboardingScreen() {
  return (
    <div className="space-y-4">
      <StateBlock
        title="아직 생활기록이 없어요."
        description="오늘 한 생활관리를 한 문장으로 남겨보세요. 예시는 실제 사용자 데이터로 자동 저장하지 않습니다."
      />
      <section className="rounded-md border border-[var(--line)] bg-white p-4">
        <p className="text-sm leading-6 text-[var(--muted)]">
          예: “오늘 이불 빨았어”
        </p>
      </section>
      <BottomActionBar>
        <ActionLink href="/screens/S11" tone="primary">
          첫 기록 남기기
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

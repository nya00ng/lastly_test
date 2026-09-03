import Link from "next/link";
import { ActionLink } from "@/components/ActionLink";
import { BottomActionBar } from "@/components/BottomActionBar";
import { FixtureStateTabs } from "@/components/FixtureStateTabs";
import { StateBlock } from "@/components/StateBlock";
import { notificationPermissionVariants, toVariants } from "./shared";

export function SettingsScreen() {
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

export function DeviceNotificationScreen() {
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
            className="focus-ring min-h-11 rounded-md border border-[var(--line)] bg-white px-4 text-sm font-bold"
            type="button"
          >
            꺼짐
          </button>
        </div>
      </section>
      <FixtureStateTabs
        title="S41 device notification states"
        variants={toVariants(notificationPermissionVariants("S41"))}
      />
      <BottomActionBar>
        <ActionLink href="/screens/S40" tone="primary">
          설정으로
        </ActionLink>
      </BottomActionBar>
    </div>
  );
}

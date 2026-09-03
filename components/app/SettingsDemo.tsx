import Link from "next/link";
import { BellIcon, SettingsIcon } from "./AppIcons";
import { DemoAppShell } from "./DemoAppShell";

export function SettingsDemo() {
  return (
    <DemoAppShell activeRoute="settings" title="설정">
      <section className="space-y-5">
        <div>
          <h1 className="text-[25px] font-semibold leading-8">설정</h1>
          <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
            데모에서는 앱 사용 흐름에 필요한 기본 설정만 보여줍니다.
          </p>
        </div>

        <section className="rounded-[26px] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--mint)] text-[var(--primary)]">
              <BellIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[18px] font-semibold">알림</h2>
              <p className="mt-1 text-[14px] leading-6 text-[var(--muted)]">
                이 기기에서 관리일 알림을 받을 수 있는지 확인합니다.
              </p>
            </div>
          </div>
          <Link
            className="focus-ring mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-[#f2f4ef] text-[15px] font-semibold"
            href="/notification"
          >
            알림 데모 보기
          </Link>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sun)] text-[#705816]">
              <SettingsIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-[18px] font-semibold">기본 관리 설정</h2>
              <p className="mt-1 text-[14px] leading-6 text-[var(--muted)]">
                관리주기는 항목마다 직접 정하는 방향을 유지합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-[18px] font-semibold">앱 정보</h2>
          <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
            LASTLY는 마지막으로 한 생활관리 행동을 기억하고 다음 관리시점까지 이어주는 앱입니다.
          </p>
        </section>
      </section>
    </DemoAppShell>
  );
}

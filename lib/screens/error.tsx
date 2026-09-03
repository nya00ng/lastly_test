import { FixtureStateTabs } from "@/components/FixtureStateTabs";
import { errorStateFixtures } from "@/lib/fixtures";
import { toVariants } from "./shared";

export function ErrorRecoveryScreen() {
  return (
    <div className="space-y-4">
      <section className="rounded-md border border-red-200 bg-white p-4">
        <p className="text-xs font-bold text-[var(--danger)]">Error state</p>
        <h2 className="mt-1 text-xl font-bold">다시 시도할 수 있어요</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          입력한 내용은 가능한 한 유지했어요. Raw DB, stack, secret은 노출하지 않습니다.
        </p>
      </section>
      <FixtureStateTabs
        title="S50 error/recovery states"
        variants={toVariants(
          errorStateFixtures.map((error) => ({
            id: error,
            label: error.replace(" Error", ""),
            title: error,
            description: "복구 Action을 선택할 수 있는 fixture 오류 상태입니다.",
            details: ["다시 시도", "직접 입력", "로그인", "홈으로", "입력 보존 가능"],
            primaryHref:
              error === "Session Expired" ? "/screens/S01" : "/screens/S11",
            primaryLabel: error === "Session Expired" ? "로그인" : "직접 입력",
            secondaryHref: "/screens/S10",
            secondaryLabel: "홈으로",
          })),
        )}
      />
    </div>
  );
}

import { ActionLink } from "@/components/ActionLink";
import { BottomActionBar } from "@/components/BottomActionBar";
import { ManagementItemCard } from "@/components/ManagementItemCard";
import { StateBlock } from "@/components/StateBlock";
import { dashboardFixtures } from "@/lib/fixtures";

export function DashboardScreen() {
  return (
    <div className="space-y-4">
      <section className="space-y-3">
        {dashboardFixtures.map((item) => (
          <ManagementItemCard href="/screens/S21" item={item} key={item.id} />
        ))}
      </section>
      <StateBlock
        title="지금 확인할 항목만 보여줘요."
        description="관리 필요, 곧 관리할 항목, 아직 괜찮은 항목만 홈에 표시합니다. 기록이 없거나 주기가 없는 항목은 전체 관리에서 확인할 수 있어요."
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

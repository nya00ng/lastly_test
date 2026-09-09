"use client";

import { DemoAppShell } from "./DemoAppShell";
import { UnifiedComposer } from "./UnifiedComposer";

export function RecordDemo({ initialItemId }: { initialItemId?: string }) {
  return (
    <DemoAppShell activeRoute="record" title="기록하기">
      <UnifiedComposer initialItemId={initialItemId} mode="page" />
    </DemoAppShell>
  );
}

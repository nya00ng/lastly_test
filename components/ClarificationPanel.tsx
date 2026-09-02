import type { ClarificationType } from "@/lib/types";

type ClarificationPanelProps = {
  type: ClarificationType;
  title: string;
  prompt: string;
  sampleAnswer: string;
};

export function ClarificationPanel({
  type,
  title,
  prompt,
  sampleAnswer,
}: ClarificationPanelProps) {
  return (
    <article className="rounded-md border border-[var(--line)] bg-white p-4">
      <p className="text-xs font-bold text-[var(--primary)]">{type}</p>
      <h3 className="mt-1 text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{prompt}</p>
      <div className="mt-3 rounded-md border border-dashed border-[var(--line)] bg-[var(--background)] p-3 text-sm font-semibold">
        예시 응답: {sampleAnswer}
      </div>
    </article>
  );
}

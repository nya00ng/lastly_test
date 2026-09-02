import type { AiConfirmationFixture } from "@/lib/types";

const rows: Array<[keyof AiConfirmationFixture, string]> = [
  ["originalInput", "Original input"],
  ["parsedIntent", "Parsed Intent"],
  ["parsedScope", "Parsed Scope"],
  ["normalizedAction", "Normalized Action"],
  ["resolvedDate", "Resolved Date"],
  ["dateResolutionSource", "Date Resolution Source"],
  ["itemMatchingCandidate", "Item Matching Candidate"],
];

export function AIResultCard({ result }: { result: AiConfirmationFixture }) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-white p-4">
      <h2 className="text-base font-bold">저장 전 AI 확인 fixture</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        {rows.map(([key, label]) => (
          <div
            className="grid grid-cols-[minmax(100px,42%)_1fr] gap-3"
            key={key}
          >
            <dt className="text-[var(--muted)]">{label}</dt>
            <dd className="font-bold break-words">{result[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

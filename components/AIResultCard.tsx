import type { AiConfirmationFixture } from "@/lib/types";

const rows: Array<[keyof AiConfirmationFixture, string]> = [
  ["originalInput", "내가 입력한 말"],
  ["normalizedAction", "기록할 내용"],
  ["resolvedDate", "수행 날짜"],
  ["itemMatchingCandidate", "기록할 항목"],
  ["parsedIntent", "Dev · Parsed Intent"],
  ["parsedScope", "Dev · Parsed Scope"],
  ["datePrecision", "Dev · Date Precision"],
  ["dateResolutionSource", "Dev · Date Resolution Source"],
];

export function AIResultCard({ result }: { result: AiConfirmationFixture }) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-white p-4">
      <h2 className="text-base font-bold">AI가 이렇게 이해했어요.</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
        확인하고 필요한 부분만 고쳐주세요. 아직 저장되지 않았습니다.
      </p>
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

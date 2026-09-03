type InfoGridProps = {
  rows: Array<{
    label: string;
    value: string;
  }>;
};

export function InfoGrid({ rows }: InfoGridProps) {
  return (
    <dl className="grid gap-3 text-sm">
      {rows.map((row) => (
        <div
          className="grid grid-cols-[minmax(100px,42%)_1fr] gap-3"
          key={row.label}
        >
          <dt className="text-[var(--muted)]">{row.label}</dt>
          <dd className="font-bold break-words">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type StateBlockProps = {
  title: string;
  description: string;
};

export function StateBlock({ title, description }: StateBlockProps) {
  return (
    <section className="rounded-md border border-dashed border-[var(--line)] bg-white px-4 py-5">
      <h2 className="text-base font-bold text-[var(--foreground)]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </section>
  );
}

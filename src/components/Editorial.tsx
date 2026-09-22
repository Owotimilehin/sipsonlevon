import { FadeIn, Reveal } from "@/components/motion";

/** Shared shell for the house's written pages: eyebrow, display title,
 *  and an offset measure so they read as editorial, not as a policy dump. */
export function EditorialPage({
  eyebrow,
  title,
  standfirst,
  children,
}: {
  eyebrow: string;
  title: string;
  standfirst?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-16 md:py-24">
      <FadeIn>
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">{eyebrow}</p>
        <h1 className="serif-display text-5xl md:text-7xl mt-3">{title}</h1>
        {standfirst ? (
          <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-ink/70">{standfirst}</p>
        ) : null}
        <div className="gold-rule mt-12" />
      </FadeIn>
      <div className="mt-14 grid md:grid-cols-12 gap-x-10">
        <div className="md:col-span-8 md:col-start-4 space-y-12">{children}</div>
      </div>
    </div>
  );
}

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section>
        <h2 className="serif text-3xl">{heading}</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink/70">
          {children}
        </div>
      </section>
    </Reveal>
  );
}

/** Two-column spec list — used for shipping rates and size measurements. */
export function Spec({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-6 divide-y divide-border border-y border-border">
      {rows.map(([term, value]) => (
        <div key={term} className="flex justify-between gap-6 py-3">
          <dt className="text-[11px] tracking-[0.18em] uppercase text-ink/60">{term}</dt>
          <dd className="text-sm text-right tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

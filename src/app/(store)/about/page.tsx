import { FadeIn, Reveal, SplitLines } from "@/components/motion";

export const metadata = {
  title: "The House",
  description: "Built on restraint. Small runs, cut properly, in Ikeja, Lagos.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="grain relative h-[56dvh] min-h-[340px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="drift absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="relative z-10 h-full flex items-end max-w-7xl mx-auto px-5 md:px-8 pb-12 text-white">
          <div>
            <FadeIn delay={0.15}>
              <p className="text-[11px] tracking-[0.28em] uppercase text-gold">The house</p>
            </FadeIn>
            <h1 className="serif-display text-5xl md:text-7xl mt-3 tracking-[0.06em]">
              <SplitLines lines={["SIPSONLEVON"]} delay={0.28} />
            </h1>
          </div>
        </div>
      </div>

      {/* Offset column rather than a centered measure — the manifesto sits
          left of centre with the rule running past it. */}
      <div className="mx-auto max-w-5xl px-5 md:px-8 py-24 md:py-32 grid md:grid-cols-12 gap-10">
        <Reveal className="md:col-span-4">
          <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">House note</p>
          <div className="gold-rule mt-4" />
        </Reveal>
        <div className="md:col-span-7 md:col-start-6">
          <Reveal>
            <p className="serif-display text-4xl md:text-5xl">Built on restraint.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-10 text-[17px] leading-relaxed text-ink/70">
              We cut womenswear and unisex tailoring in small runs and refuse seasonal
              noise. Lagos is the studio. The clothes travel.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-[17px] leading-relaxed text-ink/70">
              What you see in the shop is what is on the rail. If a size is gone, it is
              gone.
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

import { listProducts } from "@/lib/db";
import { FadeIn, Reveal } from "@/components/motion";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lookbook",
  description: "The season photographed. Editorial crops of the current rail.",
};

export default async function LookbookPage() {
  const products = await listProducts();
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
      <FadeIn>
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">Editorial</p>
        <h1 className="serif-display text-6xl md:text-8xl mt-3">Lookbook</h1>
      </FadeIn>
      {/* Masonry columns, so the two columns fall out of step with each other
          by construction rather than by a uniform grid. */}
      <div className="mt-16 columns-1 md:columns-2 gap-6">
        {products.map((p, i) => (
          <Reveal key={p.id} className="mb-6 break-inside-avoid" y={32}>
            <Link href={`/product/${p.slug}`} className="group block">
              {/* Alternating ratios keep the masonry from settling into a grid,
                  and reserve the box so nothing shifts as images arrive. */}
              <div
                className={`overflow-hidden bg-sand ${
                  i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-[4/5]" : "aspect-square"
                }`}
              >
                <img
                  src={p.images[i % p.images.length]}
                  alt={p.name}
                  loading={i < 2 ? undefined : "lazy"}
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-(--ease-expo) group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-4 serif text-2xl md:text-3xl">
                <span className="rule-draw inline-block">{p.name}</span>
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

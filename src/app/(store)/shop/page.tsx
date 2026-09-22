import { listProducts } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop",
  description: "The full rail. Live stock by size, priced in naira.",
};

const cats = [
  { id: "", label: "All" },
  { id: "womenswear", label: "Womenswear" },
  { id: "unisex", label: "Unisex" },
  { id: "tailoring", label: "Tailoring" },
  { id: "outerwear", label: "Outerwear" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const all = await listProducts();
  const products = c ? all.filter((p) => p.category === c) : all;

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
      <FadeIn>
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">Collection</p>
        <h1 className="serif-display text-6xl md:text-8xl mt-3">The shop</h1>
        <p className="mt-6 max-w-lg text-ink/60 text-sm leading-relaxed">
          {products.length} pieces available now. What is listed is what we have.
        </p>
      </FadeIn>
      <FadeIn delay={0.12}>
        <div className="mt-10 flex flex-wrap gap-2">
          {cats.map((cat) => {
            const on = (cat.id || undefined) === c || (!c && !cat.id);
            return (
              <Link
                key={cat.label}
                href={cat.id ? `/shop?c=${cat.id}` : "/shop"}
                aria-current={on ? "page" : undefined}
                className={`px-4 py-2 text-[11px] tracking-[0.18em] uppercase border transition-colors duration-(--dur-base) ${
                  on
                    ? "bg-ink text-paper border-ink"
                    : "border-border-strong hover:border-ink"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </FadeIn>
      {/* Key on the filter so the grid re-staggers when the category changes —
          the State job: it shows the rail actually changed. */}
      <Stagger
        key={c ?? "all"}
        count={products.length}
        className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
      >
        {products.map((p) => (
          <StaggerItem key={p.id}>
            <ProductCard product={p} />
          </StaggerItem>
        ))}
      </Stagger>
      {products.length === 0 && (
        <p className="mt-16 text-ink/60">
          Nothing on this rail right now.{" "}
          <Link href="/shop" className="rule-draw">
            See everything
          </Link>
        </p>
      )}
    </div>
  );
}

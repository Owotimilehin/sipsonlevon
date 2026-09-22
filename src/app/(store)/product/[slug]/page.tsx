import { notFound } from "next/navigation";
import { getProduct } from "@/lib/db";
import { naira } from "@/lib/money";
import { FadeIn, Reveal } from "@/components/motion";
import { AddToBag } from "./AddToBag";

export const dynamic = "force-dynamic";

/** Per-garment titles, so every product page is not the same page to a crawler. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: {
      title: `${product.name} · SIPSONLEVON`,
      description: product.description.slice(0, 155),
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.published) notFound();

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-16 grid lg:grid-cols-12 gap-10 lg:gap-20">
      <div className="lg:col-span-7 space-y-4">
        {product.images.map((src, i) =>
          /* The first image is the LCP element: no reveal on it. The rest
             reveal as they enter (animate-workflow, step 5). */
          i === 0 ? (
            <div key={src} className="overflow-hidden bg-sand">
              <img
                src={src}
                alt={product.name}
                fetchPriority="high"
                decoding="async"
                className="w-full object-cover aspect-[3/4]"
              />
            </div>
          ) : (
            <Reveal key={src} y={32}>
              <div className="overflow-hidden bg-sand">
                <img
                  src={src}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover aspect-[3/4]"
                />
              </div>
            </Reveal>
          )
        )}
      </div>
      <div className="lg:col-span-5 lg:sticky lg:top-28 h-fit">
        <FadeIn>
          <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">
            {product.category}
          </p>
          <h1 className="serif-display text-5xl md:text-6xl mt-3">{product.name}</h1>
          <p className="mt-5 text-lg">
            {naira(product.price)}
            {product.compareAt ? (
              <span className="ml-3 text-ink/60 line-through text-base">
                {naira(product.compareAt)}
              </span>
            ) : null}
          </p>
          <div className="gold-rule my-8" />
          <p className="leading-relaxed text-ink/75">{product.description}</p>
          <p className="mt-4 text-sm text-ink/60">{product.fabric}</p>
          <AddToBag product={product} />
        </FadeIn>
      </div>
    </div>
  );
}

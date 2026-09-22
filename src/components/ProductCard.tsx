import Link from "next/link";
import { naira } from "@/lib/money";
import type { Product } from "@/lib/types";
import { SaveButton } from "./SaveButton";

export function ProductCard({ product }: { product: Product }) {
  const sold = Object.values(product.stock).every((n) => n < 1);
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-sand">
        <img
          src={product.images[0]}
          alt={product.name} loading="lazy" decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-(--ease-expo) group-hover:scale-[1.04]"
        />
        {/* Ink wash on hover — opacity, not background-color (motion-library). */}
        <div className="absolute inset-0 bg-ink/10 opacity-0 transition-opacity duration-700 ease-(--ease-expo) group-hover:opacity-100" />
        <SaveButton productId={product.id} name={product.name} floating />
        {sold ? (
          <span className="absolute top-3 left-3 z-10 bg-paper/90 px-2 py-1 text-[10px] tracking-[0.2em] uppercase">
            Sold through
          </span>
        ) : product.compareAt ? (
          <span className="absolute top-3 left-3 z-10 bg-ink text-paper px-2 py-1 text-[10px] tracking-[0.2em] uppercase">
            Archive price
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-[10px] tracking-[0.22em] uppercase text-ink/60">{product.category}</p>
      <h3 className="serif text-[26px] leading-tight mt-1">
        {/* Signature detail: the gold rule draws left-to-right under the name. */}
        <span className="rule-draw inline-block">{product.name}</span>
      </h3>
      <p className="mt-2 text-sm">
        {naira(product.price)}
        {product.compareAt ? (
          <span className="ml-2 text-ink/60 line-through">{naira(product.compareAt)}</span>
        ) : null}
      </p>
    </Link>
  );
}

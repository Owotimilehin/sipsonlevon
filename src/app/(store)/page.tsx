import Link from "next/link";
import { listProducts } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import {
  FadeIn,
  HeroFrame,
  Parallax,
  Reveal,
  ScrollCue,
  SplitLines,
  Stagger,
  StaggerItem,
} from "@/components/motion";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  // absolute: the root template would otherwise append the house name twice.
  title: { absolute: "SIPSONLEVON — Ready-to-wear, cut in Lagos" },
  description:
    "Womenswear and unisex tailoring, cut slowly in Lagos and sold only while it is on the rail.",
};

export default async function HomePage() {
  const all = await listProducts();
  const featured = all.filter((p) => p.featured).slice(0, 4);
  const rest = all.filter((p) => !featured.includes(p)).slice(0, 2);

  return (
    <div>
      {/* Hero. The image is the LCP element, so it animates transform only —
          never opacity. The ken-burns runs in CSS without waiting for JS;
          the parallax layers on once Motion hydrates. */}
      <HeroFrame
        className="grain min-h-[94dvh]"
        image={
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2200&q=80"
            alt=""
            className="drift h-full w-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
        }
      >
        <div>
          <FadeIn delay={0.15}>
            <p className="text-[11px] tracking-[0.38em] uppercase text-gold">
              Autumn collection · Lagos
            </p>
          </FadeIn>
          <h1 className="serif-display mt-5 max-w-4xl text-[38px] xs:text-[46px] sm:text-[64px] md:text-[96px]">
            <SplitLines lines={["Clothes that keep", "their voice down."]} delay={0.3} />
          </h1>
          <FadeIn delay={0.75}>
            <p className="mt-7 max-w-md text-[15px] text-white/75 leading-relaxed">
              Womenswear and unisex tailoring, cut slowly and sold only while it is on
              the rail.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/shop" className={buttonVariants({ variant: "light" })}>
                Shop the season
              </Link>
              <Link
                href="/lookbook"
                className="rule-draw text-[11px] tracking-[0.28em] uppercase text-white/80 hover:text-white"
              >
                View lookbook
              </Link>
            </div>
          </FadeIn>
        </div>
        <ScrollCue />
      </HeroFrame>

      <div className="bg-ink text-paper/80 overflow-hidden py-3 border-y border-white/5">
        <div className="marquee">
          <div className="marquee-track text-[11px] tracking-[0.32em] uppercase">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="px-8">
                SIPSONLEVON · Cut in Lagos · Complimentary delivery from ₦250,000 ·
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-32">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">
                The collection
              </p>
              <h2 className="serif-display text-5xl md:text-7xl mt-3">This season</h2>
            </div>
            <Link
              href="/shop"
              className="rule-draw shrink-0 text-[11px] tracking-[0.22em] uppercase"
            >
              View all
            </Link>
          </div>
        </Reveal>
        <Stagger
          count={featured.length}
          className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14"
        >
          {featured.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard product={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Chapters. 7/5 split with the second tile dropped — asymmetry instead
          of the two-equal-cards default (anti-slop-design, Layout). */}
      <section className="px-5 md:px-8">
        <div className="mx-auto max-w-7xl grid md:grid-cols-12 gap-4">
          <Reveal className="md:col-span-7">
            <Chapter
              href="/shop?c=womenswear"
              eyebrow="Chapter I"
              title="Womenswear"
              src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1400&q=80"
              tall
            />
          </Reveal>
          <Reveal className="md:col-span-5 md:mt-24" delay={0.12}>
            <Chapter
              href="/shop?c=unisex"
              eyebrow="Chapter II"
              title="Unisex tailoring"
              src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1400&q=80"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-ink text-paper mt-24 md:mt-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-32 grid md:grid-cols-12 gap-12 md:gap-20 items-center">
          <div className="md:col-span-5">
            <Parallax distance={50} className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80"
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full aspect-[4/5] object-cover scale-110"
              />
            </Parallax>
          </div>
          <Reveal className="md:col-span-6 md:col-start-7">
            <p className="text-[11px] tracking-[0.28em] uppercase text-gold">The house</p>
            <h2 className="serif-display text-5xl md:text-7xl mt-4">Made to be kept.</h2>
            <p className="mt-8 text-paper/70 leading-relaxed text-[16px] max-w-md">
              Fewer pieces, cut properly. A dress that holds a room. A jacket that does
              not announce itself. If a size is gone, it is gone — we do not pretend
              otherwise.
            </p>
            <Link
              href="/about"
              className="rule-draw mt-10 inline-block text-[11px] tracking-[0.22em] uppercase"
            >
              Read the house note
            </Link>
          </Reveal>
        </div>
      </section>

      {rest.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 md:px-8 py-24">
          <Reveal>
            <h2 className="serif-display text-4xl md:text-5xl">Also on the rail</h2>
          </Reveal>
          <Stagger count={rest.length} className="mt-12 grid sm:grid-cols-2 gap-10">
            {rest.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <section className="mx-auto max-w-xl px-5 pb-24 text-center">
        <Reveal>
          <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">Private list</p>
          <h2 className="serif-display text-4xl md:text-5xl mt-3">
            Be first when a drop lands
          </h2>
          <form className="mt-8 flex border border-border-strong">
            <input
              type="email"
              required
              placeholder="Email address"
              aria-label="Email address"
              className="flex-1 bg-transparent px-4 py-3 text-base sm:text-sm outline-none"
            />
            <button className="bg-ink text-paper px-6 text-[11px] tracking-[0.2em] uppercase transition-colors hover:bg-ink/85">
              Join
            </button>
          </form>
        </Reveal>
      </section>
    </div>
  );
}

function Chapter({
  href,
  eyebrow,
  title,
  src,
  tall,
}: {
  href: string;
  eyebrow: string;
  title: string;
  src: string;
  tall?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden ${tall ? "min-h-[520px]" : "min-h-[420px]"}`}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-(--ease-expo) group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/35 transition-colors duration-700 group-hover:bg-black/25" />
      <div className="absolute bottom-8 left-8 text-white">
        <p className="text-[11px] tracking-[0.28em] uppercase text-gold">{eyebrow}</p>
        <p className="serif-display text-4xl md:text-5xl mt-2">{title}</p>
      </div>
    </Link>
  );
}

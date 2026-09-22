import Link from "next/link";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="min-h-[70dvh] flex items-center px-5 md:px-8">
      <div className="mx-auto max-w-xl w-full">
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">Nothing here</p>
        <h1 className="serif-display text-6xl md:text-8xl mt-4">Off the rail.</h1>
        <p className="mt-8 text-[17px] leading-relaxed text-ink/70 max-w-md">
          This page does not exist, or the piece has left the house. Both happen — we cut in
          small runs and do not keep pages for clothes we no longer have.
        </p>
        <div className="gold-rule my-10" />
        <div className="flex flex-wrap gap-6 text-[11px] tracking-[0.24em] uppercase">
          <Link href="/shop" className="bg-ink text-paper px-8 py-3.5 hover:bg-ink/85 transition-colors">
            See the shop
          </Link>
          <Link href="/" className="rule-draw self-center">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

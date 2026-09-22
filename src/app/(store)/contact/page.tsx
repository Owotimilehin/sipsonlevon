import { FadeIn, Reveal } from "@/components/motion";

export const metadata = {
  title: "Contact",
  description: "Appointments, alterations and private fittings at the Lagos studio.",
};

const field =
  "w-full border border-border-strong bg-transparent px-4 py-3 text-base sm:text-sm outline-none " +
  "transition-colors duration-(--dur-base) focus:border-ink";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-16">
      <FadeIn>
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">Studio</p>
        <h1 className="serif-display text-5xl md:text-6xl mt-3">Write to the house</h1>
        <p className="mt-8 text-ink/65 leading-relaxed max-w-sm">
          Appointments, alterations, and private fittings. We answer within two working
          days.
        </p>
        <div className="gold-rule my-10" />
        <div className="space-y-4 text-sm">
          <p>hello@sipsonlevon.com</p>
          <p>Ikeja, Lagos</p>
          <p className="text-ink/60">Tue–Sat · 11:00–18:00 WAT</p>
        </div>
      </FadeIn>
      <Reveal delay={0.12}>
        <form className="space-y-4">
          <input name="name" required placeholder="Name" aria-label="Name" className={field} />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            aria-label="Email"
            className={field}
          />
          <textarea
            name="note"
            rows={6}
            placeholder="How can we help?"
            aria-label="Message"
            className={field}
          />
          <button className="bg-ink text-paper px-8 py-3.5 text-[11px] tracking-[0.24em] uppercase transition-colors hover:bg-ink/85">
            Send
          </button>
        </form>
      </Reveal>
    </div>
  );
}

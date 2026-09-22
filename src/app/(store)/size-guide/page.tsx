import Link from "next/link";
import { EditorialPage, Section } from "@/components/Editorial";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Size guide" };

const womenswear: [string, string, string, string][] = [
  ["XS", "6", "80–84", "86–90"],
  ["S", "8", "84–88", "90–94"],
  ["M", "10", "88–92", "94–98"],
  ["L", "12", "94–98", "100–104"],
  ["XL", "14", "100–104", "106–110"],
];

const unisex: [string, string, string, string][] = [
  ["XS", "34–36", "86–91", "71–76"],
  ["S", "36–38", "91–96", "76–81"],
  ["M", "38–40", "96–101", "81–86"],
  ["L", "40–42", "101–106", "86–91"],
  ["XL", "42–44", "106–112", "91–97"],
];

export default function SizeGuidePage() {
  return (
    <EditorialPage
      eyebrow="Service"
      title="Size guide"
      standfirst="All measurements are body measurements in centimetres, not garment measurements. Between two sizes, take the larger — tailoring can come in, it cannot go out."
    >
      <Section heading="Womenswear">
        <p>Measured at the fullest point, standing, with the tape level.</p>
      </Section>

      <Reveal>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-y border-border">
            <thead>
              <tr className="text-[10px] tracking-[0.2em] uppercase text-ink/60">
                <th className="py-3 text-left font-normal">Size</th>
                <th className="py-3 text-left font-normal">UK</th>
                <th className="py-3 text-left font-normal">Bust</th>
                <th className="py-3 text-left font-normal">Hip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border tabular-nums">
              {womenswear.map(([size, uk, bust, hip]) => (
                <tr key={size}>
                  <td className="py-3 tracking-[0.15em]">{size}</td>
                  <td className="py-3">{uk}</td>
                  <td className="py-3">{bust}</td>
                  <td className="py-3">{hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Section heading="Unisex tailoring">
        <p>Cut generously through the shoulder. Size down for a close fit.</p>
      </Section>

      <Reveal>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-y border-border">
            <thead>
              <tr className="text-[10px] tracking-[0.2em] uppercase text-ink/60">
                <th className="py-3 text-left font-normal">Size</th>
                <th className="py-3 text-left font-normal">Collar</th>
                <th className="py-3 text-left font-normal">Chest</th>
                <th className="py-3 text-left font-normal">Waist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border tabular-nums">
              {unisex.map(([size, collar, chest, waist]) => (
                <tr key={size}>
                  <td className="py-3 tracking-[0.15em]">{size}</td>
                  <td className="py-3">{collar}</td>
                  <td className="py-3">{chest}</td>
                  <td className="py-3">{waist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Section heading="How to measure">
        <p>
          <strong className="font-normal text-ink">Bust or chest</strong> — around the
          fullest part, tape level under the arms.
        </p>
        <p>
          <strong className="font-normal text-ink">Waist</strong> — at the narrowest point,
          usually just above the navel. Do not hold your breath.
        </p>
        <p>
          <strong className="font-normal text-ink">Hip</strong> — around the fullest part,
          roughly 20cm below the waist.
        </p>
      </Section>

      <Section heading="Still unsure">
        <p>
          Send your measurements to{" "}
          <Link href="/contact" className="rule-draw">
            the studio
          </Link>{" "}
          and we will tell you which size we would cut for you. We would rather advise than
          process a return.
        </p>
      </Section>
    </EditorialPage>
  );
}

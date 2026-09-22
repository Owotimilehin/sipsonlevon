import { EditorialPage, Section } from "@/components/Editorial";

export const metadata = { title: "Garment care" };

export default function CarePage() {
  return (
    <EditorialPage
      eyebrow="The house"
      title="Garment care"
      standfirst="These clothes are made to be kept. Kept things need looking after."
    >
      <Section heading="Wool and tailoring">
        <p>
          Dry clean sparingly — twice a year is plenty for a coat worn weekly. Between
          cleans, brush along the grain with a soft clothes brush and hang on a broad wooden
          hanger so the shoulder holds its shape.
        </p>
        <p>Air a jacket overnight after wearing before returning it to the wardrobe.</p>
      </Section>

      <Section heading="Silk">
        <p>
          Hand wash cold with a pH-neutral detergent, or dry clean. Never wring. Roll in a
          towel to draw out water, then dry flat away from direct sun, which will fade the
          dye.
        </p>
        <p>Iron on the reverse, on the lowest setting, while very slightly damp.</p>
      </Section>

      <Section heading="Cotton shirting">
        <p>
          Machine wash at 30°C on a gentle cycle. Wash with like colours. Hang to dry and
          iron while damp for a flatter collar.
        </p>
      </Section>

      <Section heading="Knitwear">
        <p>
          Fold, never hang — a hanger will pull the shoulders out within a season. Hand wash
          cold, dry flat. De-pill with a comb rather than a razor.
        </p>
      </Section>

      <Section heading="Storage">
        <p>
          Store in breathable cotton, not plastic. Cedar rather than mothballs. If a piece is
          going away for a season, clean it first — moths go for what you have already worn.
        </p>
      </Section>
    </EditorialPage>
  );
}

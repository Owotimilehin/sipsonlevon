import Link from "next/link";
import { EditorialPage } from "@/components/Editorial";
import { Faq } from "@/components/Faq";
import { faq } from "@/lib/faq";

export const metadata = {
  title: "FAQ",
  description: "Stock, payment, delivery, returns and fittings — answered by the house.",
};

export default function FaqPage() {
  return (
    <EditorialPage
      eyebrow="Service"
      title="Questions"
      standfirst="The things people ask most. Anything else goes to the studio and a person answers it."
    >
      <Faq items={faq} defaultOpen={0} />
      <p className="text-[15px] leading-relaxed text-ink/70">
        Not covered here?{" "}
        <Link href="/contact" className="rule-draw">
          Write to the house
        </Link>
        . We answer within two working days.
      </p>
    </EditorialPage>
  );
}

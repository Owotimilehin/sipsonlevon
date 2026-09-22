import Link from "next/link";
import { EditorialPage } from "@/components/Editorial";
import { Faq } from "./Faq";

export const metadata = { title: "FAQ" };

const items = [
  {
    q: "Is what I see actually in stock?",
    a: "Yes. The shop shows live stock by size. If a size is greyed out it is gone, and we do not take orders against stock we do not have.",
  },
  {
    q: "How do I pay?",
    a: "Payment is taken by OPay on their secure page. Card and bank transfer are supported. The house never sees or stores your card details.",
  },
  {
    q: "Do I need an account?",
    a: "No. You can check out as a guest and your SL- number is your receipt. An account simply keeps your order history in one place.",
  },
  {
    q: "When will my order arrive?",
    a: "One to two working days in Lagos, two to five elsewhere in Nigeria. Orders placed before 14:00 WAT on a working day leave the same day.",
  },
  {
    q: "Can I return something?",
    a: "Unworn pieces can be returned within 14 days, tags intact. Write to the studio with your SL- number first. Altered pieces are final sale.",
  },
  {
    q: "Do you ship outside Nigeria?",
    a: "By arrangement. Write to the studio with your city and we will quote a rate and a timeline before you order.",
  },
  {
    q: "Can I book a fitting?",
    a: "Yes. The studio is in Ikeja, Lagos, open Tuesday to Saturday, 11:00 to 18:00 WAT. Ask through the contact page.",
  },
  {
    q: "Will a sold-out piece come back?",
    a: "Usually not. We cut in small runs and move on. If a piece matters to you, save it and write to us — occasionally we cut one to measure.",
  },
];

export default function FaqPage() {
  return (
    <EditorialPage
      eyebrow="Service"
      title="Questions"
      standfirst="The things people ask most. Anything else goes to the studio and a person answers it."
    >
      <Faq items={items} />
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

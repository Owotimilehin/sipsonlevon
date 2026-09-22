import Link from "next/link";
import { EditorialPage, Section, Spec } from "@/components/Editorial";

export const metadata = { title: "Shipping & returns" };

export default function ShippingPage() {
  return (
    <EditorialPage
      eyebrow="Service"
      title="Shipping & returns"
      standfirst="Everything leaves the studio in Ikeja. What follows is what we promise, not what we hope."
    >
      <Section heading="Rates">
        <p>
          Delivery is complimentary across Nigeria on orders of ₦250,000 and above. Below
          that, a flat national rate applies.
        </p>
        <Spec
          rows={[
            ["Orders from ₦250,000", "Complimentary"],
            ["Orders under ₦250,000", "₦8,500"],
            ["Lagos", "1–2 working days"],
            ["Other states", "2–5 working days"],
          ]}
        />
      </Section>

      <Section heading="Dispatch">
        <p>
          Orders placed before 14:00 WAT on a working day leave the same day. Orders placed
          after that, or at the weekend, leave the next working day.
        </p>
        <p>
          You will have an SL- number the moment the order is confirmed. Quote it in any
          message to the studio.
        </p>
      </Section>

      <Section heading="Returns">
        <p>
          Unworn pieces may be returned within 14 days of delivery, with tags intact and in
          their original packaging. Tell us first — write to the studio with your SL- number
          and we will confirm the return before you send anything back.
        </p>
        <p>
          Return postage is yours unless the piece arrived faulty or was not what you
          ordered, in which case it is ours.
        </p>
      </Section>

      <Section heading="Alterations">
        <p>
          Pieces altered at your request are final sale. We would rather get the fit right
          first — book a fitting through{" "}
          <Link href="/contact" className="rule-draw">
            the studio
          </Link>
          .
        </p>
      </Section>

      <Section heading="Outside Nigeria">
        <p>
          We ship internationally by arrangement. Write to the studio with your city and we
          will quote a rate and a timeline before you order.
        </p>
      </Section>
    </EditorialPage>
  );
}

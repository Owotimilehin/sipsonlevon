import Link from "next/link";
import { EditorialPage, Section } from "@/components/Editorial";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <EditorialPage
      eyebrow="Legal"
      title="Terms of sale"
      standfirst="The terms on which the house sells. Placing an order means you accept them."
    >
      <Section heading="Prices">
        <p>
          All prices are in Nigerian naira and include applicable tax. The price charged is
          the price held on our catalogue at the moment the order is placed — never a figure
          submitted by a browser.
        </p>
        <p>
          Where a piece shows an archive price, the struck-through figure is the original
          retail price of that piece at the house.
        </p>
      </Section>

      <Section heading="Stock">
        <p>
          The shop shows live stock by size. Stock is held against your order the moment it
          is placed. If payment is not completed, the units return to the rail and the piece
          becomes available to someone else.
        </p>
      </Section>

      <Section heading="Orders and payment">
        <p>
          An order is an offer to buy. It becomes a contract when payment clears and we
          confirm it against your SL- number. If we cannot fulfil an order — a stock error,
          a pricing error, or a failed payment — we will tell you and refund in full.
        </p>
      </Section>

      <Section heading="Delivery">
        <p>
          Delivery timelines on the{" "}
          <Link href="/shipping" className="rule-draw">
            shipping page
          </Link>{" "}
          are working-day estimates from dispatch, not guarantees. Risk passes to you on
          delivery.
        </p>
      </Section>

      <Section heading="Returns">
        <p>
          Unworn pieces may be returned within 14 days of delivery with tags intact, subject
          to the{" "}
          <Link href="/shipping" className="rule-draw">
            returns process
          </Link>
          . Pieces altered at your request are final sale. Nothing here affects your
          statutory rights in respect of faulty goods.
        </p>
      </Section>

      <Section heading="Accounts">
        <p>
          You are responsible for keeping your password to yourself. Tell us immediately if
          you think someone else has it. We may close an account used fraudulently.
        </p>
      </Section>

      <Section heading="Intellectual property">
        <p>
          The name SIPSONLEVON, the designs, the photography and the text on this site belong
          to the house. Do not reproduce them commercially without written permission.
        </p>
      </Section>

      <Section heading="Governing law">
        <p>
          These terms are governed by the laws of the Federal Republic of Nigeria, and the
          courts of Lagos State have jurisdiction over any dispute.
        </p>
      </Section>
    </EditorialPage>
  );
}

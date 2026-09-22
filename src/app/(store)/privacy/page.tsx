import Link from "next/link";
import { EditorialPage, Section } from "@/components/Editorial";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <EditorialPage
      eyebrow="Legal"
      title="Privacy"
      standfirst="What we hold, why we hold it, and how to make us stop. Written plainly because you should not need a lawyer to read it."
    >
      <Section heading="What we collect">
        <p>
          When you place an order we collect your name, email address, phone number and
          delivery address, together with the pieces and sizes you bought. That is order
          data. We need it to send you clothes.
        </p>
        <p>
          If you create an account we also store your email address and a hashed version of
          your password. We never store the password itself and cannot read it.
        </p>
        <p>
          Your bag and your saved pieces live in your own browser, not on our servers. They
          never reach us unless you check out.
        </p>
      </Section>

      <Section heading="Payment">
        <p>
          Payment is processed by OPay on their own secure page. Card numbers, bank
          credentials and PINs are entered there and never touch this website. We receive
          only a payment reference and whether it succeeded.
        </p>
      </Section>

      <Section heading="What we do not do">
        <p>
          We do not sell your data. We do not share it with advertisers. Order data is order
          data — it does not become marketing data unless you have joined the private list,
          and you can leave that at any time by replying to any message.
        </p>
      </Section>

      <Section heading="How long we keep it">
        <p>
          Order records are kept for as long as we are required to keep trading records.
          Account details are kept until you ask us to close the account, at which point we
          delete them and keep only the minimum order record.
        </p>
      </Section>

      <Section heading="Your rights">
        <p>
          Under the Nigeria Data Protection Act you may ask what we hold about you, ask us to
          correct it, or ask us to delete it. Write to{" "}
          <Link href="/contact" className="rule-draw">
            the studio
          </Link>{" "}
          and we will answer within two working days.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          hello@sipsonlevon.com · Ikeja, Lagos, Nigeria. Address any privacy question to the
          house and mark it for the attention of the data contact.
        </p>
      </Section>
    </EditorialPage>
  );
}

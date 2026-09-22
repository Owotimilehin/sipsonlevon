/**
 * The house's answers, in one place.
 *
 * Shared by /faq and /contact so the two cannot drift. Each entry carries a
 * stable `id` for deep links (/faq#returns-window) — ids must not change when
 * questions are reordered or reworded.
 *
 * `onContact` marks the answers worth surfacing beside the message form: the
 * ones most likely to save someone writing in.
 */
export type FaqItem = {
  id: string;
  q: string;
  a: string;
  onContact?: boolean;
};

export const faq: FaqItem[] = [
  {
    id: "live-stock",
    q: "Is what I see actually in stock?",
    a: "Yes. The shop shows live stock by size. If a size is greyed out it is gone, and we do not take orders against stock we do not have.",
  },
  {
    id: "payment",
    q: "How do I pay?",
    a: "Payment is taken by OPay on their secure page. Card and bank transfer are supported. The house never sees or stores your card details.",
    onContact: true,
  },
  {
    id: "account-needed",
    q: "Do I need an account?",
    a: "No. You can check out as a guest and your SL- number is your receipt. An account simply keeps your order history in one place.",
  },
  {
    id: "delivery-time",
    q: "When will my order arrive?",
    a: "One to two working days in Lagos, two to five elsewhere in Nigeria. Orders placed before 14:00 WAT on a working day leave the same day.",
    onContact: true,
  },
  {
    id: "returns-window",
    q: "Can I return something?",
    a: "Unworn pieces can be returned within 14 days, tags intact. Write to the studio with your SL- number first. Altered pieces are final sale.",
    onContact: true,
  },
  {
    id: "international",
    q: "Do you ship outside Nigeria?",
    a: "By arrangement. Write to the studio with your city and we will quote a rate and a timeline before you order.",
    onContact: true,
  },
  {
    id: "fittings",
    q: "Can I book a fitting?",
    a: "Yes. The studio is in Ikeja, Lagos, open Tuesday to Saturday, 11:00 to 18:00 WAT. Ask through the contact page.",
    onContact: true,
  },
  {
    id: "restock",
    q: "Will a sold-out piece come back?",
    a: "Usually not. We cut in small runs and move on. If a piece matters to you, save it and write to us — occasionally we cut one to measure.",
    onContact: true,
  },
];

export const contactFaq = faq.filter((f) => f.onContact);

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/account";
import { FadeIn } from "@/components/motion";
import { AccountForm } from "./AccountForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in" };

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await getSessionUser()) redirect(next || "/account");

  // Only same-site paths, so `next` cannot be used as an open redirect.
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <FadeIn>
        <p className="text-[11px] tracking-[0.28em] uppercase text-ink/60">The house</p>
        <h1 className="serif-display text-5xl mt-3">Your account</h1>
        <div className="gold-rule my-10" />
        <AccountForm next={target} />
      </FadeIn>
    </div>
  );
}

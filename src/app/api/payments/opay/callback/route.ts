import { NextResponse } from "next/server";
import { settle } from "@/lib/settle";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const reference =
      body?.payload?.reference ?? body?.reference ?? body?.data?.reference ?? null;

    if (!reference) {
      return NextResponse.json({ error: "No reference in callback" }, { status: 400 });
    }

    const result = await settle(String(reference));
    // Always 200 on a handled callback so OPay stops retrying.
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Callback failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import Link from "next/link";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAdmin();
  return (
    <div className="min-h-screen bg-[#0c0b0a] text-[#f6f1e8]">
      {ok ? (
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center gap-6 text-[11px] tracking-[0.2em] uppercase">
            <Link href="/admin" className="serif text-xl tracking-[0.2em] normal-case">
              SL Atelier
            </Link>
            <Link href="/admin/products">Products</Link>
            <Link href="/admin/inventory">Inventory</Link>
            <Link href="/admin/orders">Orders</Link>
            <Link href="/" className="ml-auto text-white/40">
              View house
            </Link>
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}

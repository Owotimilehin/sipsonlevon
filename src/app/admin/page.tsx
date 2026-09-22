import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listOrders, listProducts, stockTotal } from "@/lib/db";
import { naira } from "@/lib/money";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [products, orders] = await Promise.all([listProducts({ all: true }), listOrders()]);
  const units = products.reduce((a, p) => a + stockTotal(p), 0);
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((a, o) => a + o.total, 0);
  const low = products.filter((p) => stockTotal(p) <= 4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="serif text-4xl">Dashboard</h1>
      <div className="mt-10 grid sm:grid-cols-3 gap-6">
        {[
          ["Live SKUs", String(products.length)],
          ["Units on hand", String(units)],
          ["Order book", naira(revenue)],
        ].map(([l, v]) => (
          <div key={l} className="border border-white/10 p-6">
            <p className="text-[11px] tracking-[0.2em] uppercase text-white/40">{l}</p>
            <p className="serif text-3xl mt-2">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 grid lg:grid-cols-2 gap-12">
        <div>
          <div className="flex justify-between items-baseline">
            <h2 className="serif text-2xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-[11px] tracking-[0.2em] uppercase text-white/40">
              All
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-white/10">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="py-3 flex justify-between text-sm">
                <span>
                  {o.id} · {o.customer.name}
                </span>
                <span className="text-white/50">
                  {o.status} · {naira(o.total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="serif text-2xl">Low stock</h2>
          <ul className="mt-4 divide-y divide-white/10">
            {low.map((p) => (
              <li key={p.id} className="py-3 flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-amber-200/80">{stockTotal(p)} left</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/db";
import { naira } from "@/lib/money";
import { OrderStatus } from "./OrderStatus";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const orders = await listOrders();
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="serif text-4xl">Orders</h1>
      <div className="mt-8 space-y-6">
        {orders.map((o) => (
          <div key={o.id} className="border border-white/10 p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="serif text-2xl">{o.id}</p>
                <p className="text-sm text-white/60 mt-1">
                  {o.customer.name} · {o.customer.email} · {o.customer.city}
                </p>
              </div>
              <p className="serif text-2xl">{naira(o.total)}</p>
            </div>
            <ul className="mt-4 text-sm text-white/70 space-y-1">
              {o.items.map((i) => (
                <li key={`${i.productId}-${i.size}`}>
                  {i.name} · {i.size} × {i.qty}
                </li>
              ))}
            </ul>
            <OrderStatus id={o.id} status={o.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listProducts, stockTotal } from "@/lib/db";
import { naira } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  if (!(await isAdmin())) redirect("/admin/login");
  const products = await listProducts({ all: true });
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-end justify-between">
        <h1 className="serif text-4xl">Products</h1>
        <Link href="/admin/products/new" className="border border-white/20 px-4 py-2 text-[11px] tracking-[0.2em] uppercase">
          New piece
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] tracking-[0.18em] uppercase text-white/40">
            <tr>
              <th className="py-3">Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Live</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="py-3">
                  <Link href={`/admin/products/${p.id}`} className="hover:text-gold">
                    {p.name}
                  </Link>
                </td>
                <td>{p.category}</td>
                <td>{naira(p.price)}</td>
                <td>{stockTotal(p)}</td>
                <td>{p.published ? "Yes" : "Draft"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

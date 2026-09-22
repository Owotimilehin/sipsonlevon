import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { listProducts, stockTotal } from "@/lib/db";
import { InventoryEditor } from "./InventoryEditor";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const products = await listProducts({ all: true });
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="serif text-4xl">Inventory</h1>
      <p className="mt-2 text-sm text-white/50">{products.reduce((a, p) => a + stockTotal(p), 0)} units across the house.</p>
      <InventoryEditor products={products} />
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getProduct } from "@/lib/db";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="serif text-4xl">Edit {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}

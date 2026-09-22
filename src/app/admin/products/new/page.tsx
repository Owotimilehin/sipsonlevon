import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { ProductForm } from "../ProductForm";

export default async function NewProduct() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="serif text-4xl">New piece</h1>
      <ProductForm />
    </div>
  );
}

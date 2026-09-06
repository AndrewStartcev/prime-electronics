import { redirect } from "next/navigation";

export default function CatalogIndexPage() {
  // Redirect to categories page as the default catalog landing
  redirect("/categories");
}

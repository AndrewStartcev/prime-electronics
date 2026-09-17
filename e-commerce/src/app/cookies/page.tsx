import type { Metadata } from "next";
import {
  buildManagedPageMetadata,
  renderManagedPage,
} from "@/widgets/StaticPageBuilder/managedPage";

export const dynamic = "force-dynamic";
const PAGE_PATH = "/cookies";

export function generateMetadata(): Promise<Metadata> {
  return buildManagedPageMetadata(PAGE_PATH, "Политика использования cookie");
}

export default function CookiesPage() {
  return renderManagedPage(PAGE_PATH);
}

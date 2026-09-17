import type { Metadata } from "next";
import {
  buildManagedPageMetadata,
  renderManagedPage,
} from "@/widgets/StaticPageBuilder/managedPage";

export const dynamic = "force-dynamic";
const PAGE_PATH = "/about";

export function generateMetadata(): Promise<Metadata> {
  return buildManagedPageMetadata(PAGE_PATH, "О компании");
}

export default function AboutPage() {
  return renderManagedPage(PAGE_PATH);
}

import type { Metadata } from "next";
import {
  buildManagedPageMetadata,
  renderManagedPage,
} from "@/widgets/StaticPageBuilder/managedPage";

export const dynamic = "force-dynamic";
const PAGE_PATH = "/promotions";

export function generateMetadata(): Promise<Metadata> {
  return buildManagedPageMetadata(PAGE_PATH, "Акции и специальные предложения");
}

export default function PromotionsPage() {
  return renderManagedPage(PAGE_PATH);
}

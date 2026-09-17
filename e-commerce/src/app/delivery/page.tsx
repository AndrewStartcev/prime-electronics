import type { Metadata } from "next";
import {
  buildManagedPageMetadata,
  renderManagedPage,
} from "@/widgets/StaticPageBuilder/managedPage";

export const dynamic = "force-dynamic";
const PAGE_PATH = "/delivery";

export function generateMetadata(): Promise<Metadata> {
  return buildManagedPageMetadata(PAGE_PATH, "Доставка и самовывоз");
}

export default function DeliveryPage() {
  return renderManagedPage(PAGE_PATH);
}

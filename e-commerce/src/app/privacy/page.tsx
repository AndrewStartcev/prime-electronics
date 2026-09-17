import type { Metadata } from "next";
import {
  buildManagedPageMetadata,
  renderManagedPage,
} from "@/widgets/StaticPageBuilder/managedPage";

export const dynamic = "force-dynamic";
const PAGE_PATH = "/privacy";

export function generateMetadata(): Promise<Metadata> {
  return buildManagedPageMetadata(PAGE_PATH, "Политика конфиденциальности");
}

export default function PrivacyPage() {
  return renderManagedPage(PAGE_PATH);
}

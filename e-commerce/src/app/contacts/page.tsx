import type { Metadata } from "next";
import { JsonLd, buildStoreStructuredData } from "@/shared/lib/structuredData";
import {
  buildManagedPageMetadata,
  renderManagedPage,
} from "@/widgets/StaticPageBuilder/managedPage";

export const dynamic = "force-dynamic";
const PAGE_PATH = "/contacts";

export function generateMetadata(): Promise<Metadata> {
  return buildManagedPageMetadata(PAGE_PATH, "Контакты");
}

export default async function ContactsPage() {
  return (
    <>
      <JsonLd data={buildStoreStructuredData()} />
      {await renderManagedPage(PAGE_PATH)}
    </>
  );
}

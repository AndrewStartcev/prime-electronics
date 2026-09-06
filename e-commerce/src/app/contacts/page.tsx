import type { Metadata } from "next";
import ContactsClient from "./ContactsClient";
import {
  generateStaticPageMetadata,
  resolveStaticPageSeo,
} from "@/shared/lib/seoMetadata";
import { JsonLd, buildStoreStructuredData } from "@/shared/lib/structuredData";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("/contacts", "Контакты");
}

export default async function ContactsPage() {
  const seo = await resolveStaticPageSeo("/contacts", "Контакты");

  return (
    <>
      <JsonLd data={buildStoreStructuredData()} />
      <ContactsClient initialH1={seo.h1} />
    </>
  );
}

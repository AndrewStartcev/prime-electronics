"use client";

import { use } from "react";
import { AiProductDescriptionPanel } from "./AiProductDescriptionPanel";

export default function ProductEditLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <>
      <AiProductDescriptionPanel productId={id} />
      {children}
    </>
  );
}

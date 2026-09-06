"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/widgets/Sidebar";
import { Header } from "@/widgets/Header";

const publicRoutes = ["/login"];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="lg:ml-64 min-h-screen">
        <Header />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </>
  );
}

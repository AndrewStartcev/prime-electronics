"use client";

import { Breadcrumb } from "@/shared/ui";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { usePathname } from "next/navigation";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const isFavoritesPage = pathname === "/account/favorites";

  // Hide breadcrumbs on favorites page for unauthenticated users
  if (isFavoritesPage && !isAuthenticated) {
    return (
      <main className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[16px] md:py-[20px] lg:py-[30px] xl:py-[40px] 2xl:py-[50px]">
        {/* Content without breadcrumbs */}
        {children}
      </main>
    );
  }

  return (
    <main className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] py-[16px] md:py-[20px] lg:py-[30px] xl:py-[40px] 2xl:py-[50px]">
      <Breadcrumb
        items={[{ label: "Главная", href: "/" }, { label: "Личный кабинет" }]}
      />

      <div className="mt-[16px] md:mt-[20px] lg:mt-[24px] xl:mt-[30px]">
        {children}
      </div>
    </main>
  );
}

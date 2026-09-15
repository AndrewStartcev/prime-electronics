import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import { Header } from "@/widgets/Header";
import { Footer } from "@/widgets/Footer";
import { MobileBottomMenu } from "@/widgets/MobileBottomMenu";
import { CookieConsent } from "@/widgets/CookieConsent";
import { UisCounterScript } from "@/widgets/UisCounterScript/UisCounterScript";
import {
  YandexMetrikaCounter,
  YandexMetrikaPageViews,
} from "@/widgets/YandexMetrika";
import { StaticPageOverride } from "@/widgets/StaticPageBuilder/StaticPageOverride";
import { Providers } from "./providers";
import { ScreenSizeIndicator } from "@/shared/ui/ScreenSizeIndicator";
import { CartNotification } from "@/shared/ui/CartNotification";
import { BasketNavigationFallback } from "@/shared/ui/BasketNavigationFallback";
import { SITE_URL } from "@/shared/lib/seoMetadata";

const interTight = Inter_Tight({
  variable: "--font-primary",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Prime Electronics",
  description: "Интернет-бутик премиальной электроники",
  verification: {
    yandex: "786ee46423d8293f",
    google: "Zb4UOuiOkAC4nY1wxn-sd60VcPEE0wSr46P4GYj2x_Q",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${interTight.variable} antialiased`}>
        <YandexMetrikaCounter />
        <Suspense fallback={null}>
          <YandexMetrikaPageViews />
        </Suspense>
        <UisCounterScript />
        <Providers>
          <BasketNavigationFallback />
          <ScreenSizeIndicator />
          <Header />
          <StaticPageOverride>{children}</StaticPageOverride>
          <Footer />
          {/* Spacer so content isn't hidden behind fixed mobile nav */}
          <div className="h-[64px] md:hidden" />
          <MobileBottomMenu />
          <CartNotification />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}

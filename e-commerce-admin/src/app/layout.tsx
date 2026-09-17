import type { Metadata } from "next";
import "./globals.css";
import { AuthLayout } from "@/shared/ui/AuthLayout";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "E-Commerce Admin",
  description: "Панель управления интернет-магазином",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className="antialiased bg-secondary-gray"
        suppressHydrationWarning
      >
        <Providers>
          <AuthLayout>{children}</AuthLayout>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { assetPath } from "@/lib/site-path";

export const metadata: Metadata = {
  title: { default: "Kevin Lin · Computer Engineering", template: "%s · Kevin Lin" },
  description: "I am a Northwestern Computer Engineering BS/MS student working across embedded systems, digital design, physiological sensing, and data analysis.",
  icons: { icon: assetPath("/favicon.svg"), shortcut: assetPath("/favicon.svg") },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

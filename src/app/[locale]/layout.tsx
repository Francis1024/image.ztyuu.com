import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { I18nProviderClient } from "@/i18n/client";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Francis's Journey",
  description: "这是一个关于Francis的旅程。/ This is a journey about Francis.",
  openGraph: {
    title: "Francis's Journey",
    description:
      "这是一个关于Francis的旅程。/ This is a journey about Francis.",
    url: "https://ztyuu.com",
    siteName: "Francis's Journey", // 添加 og:site_name
    images: [
      {
        url: "https://mp9tsqs9pinprjrv.public.blob.vercel-storage.com/%E4%B8%8B%E8%BD%BD-Om3YrcBEFnZlgWg05C7kT19GzUI83y.png",
        width: 800,
        height: 600,
        alt: "网站 Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Francis's Journey",
    description:
      "这是一个关于Francis的旅程。/ This is a journey about Francis.",
    images: [
      "https://mp9tsqs9pinprjrv.public.blob.vercel-storage.com/%E4%B8%8B%E8%BD%BD-Om3YrcBEFnZlgWg05C7kT19GzUI83y.png",
    ],
  },
};

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <I18nProviderClient locale={params.locale}>
          <Header />
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
          <Toaster />
        </I18nProviderClient>
      </ThemeProvider>
    </div>
  );
}

export function CheckerboardBackground() {
  return <div className="absolute inset-0 bg-checkerboard opacity-50" />;
}

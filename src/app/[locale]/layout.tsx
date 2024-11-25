import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
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
  title: "PixelPulse - AI Background Remover",
  description:
    "Remove image backgrounds instantly with AI technology. Fast, free, and easy to use.",
  openGraph: {
    title: "PixelPulse - AI Background Remover",
    description:
      "Transform your images instantly with our AI-powered background removal tool. No signup required.",
    url: "https://pixelpulse.ztyuu.com",
    siteName: "PixelPulse",
    images: [
      {
        url: "https://mp9tsqs9pinprjrv.public.blob.vercel-storage.com/remove-b83wdTVaIhYV2q8XTOp2CQPEQEMOre.jpg",
        width: 1200,
        height: 630,
        alt: "PixelPulse - AI Background Remover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PixelPulse - AI Background Remover",
    description:
      "Transform your images instantly with our AI-powered background removal tool. No signup required.",
    images: [
      "https://mp9tsqs9pinprjrv.public.blob.vercel-storage.com/remove-b83wdTVaIhYV2q8XTOp2CQPEQEMOre.jpg",
    ],
  },
  keywords: [
    "background remover",
    "AI image tool",
    "remove background",
    "image editing",
    "online photo editor",
    "free background remover",
  ],
  authors: [
    {
      name: "PixelPulse",
      url: "https://pixelpulse.ztyuu.com",
    },
  ],
  creator: "PixelPulse",
  icons: {
    icon: "/images/logo.svg",
    apple: "/images/logo.svg",
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
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
          <Toaster />
        </I18nProviderClient>
      </ThemeProvider>
    </div>
  );
}

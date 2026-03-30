import type { Metadata, Viewport } from "next";
import { FloatingSiteChrome } from "@/components/floating-site-chrome";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
    { media: "(prefers-color-scheme: dark)", color: "#060608" },
  ],
};

export const metadata: Metadata = {
  title: "Warung Agent — Conversational commerce",
  description:
    "Natural-language shopping: structured product options, order confirmation, and in-thread payment flow.",
  icons: {
    icon: "/favicon.ico?v=2",
    shortcut: "/favicon.ico?v=2",
    apple: "/favicon.ico?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrains.variable} font-sans min-h-dvh antialiased`}
      >
        <ThemeProvider>
          {children}
          <FloatingSiteChrome />
        </ThemeProvider>
      </body>
    </html>
  );
}

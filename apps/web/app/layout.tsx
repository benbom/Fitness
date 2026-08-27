import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vera — träning på kroppens villkor",
  description:
    "En träningsapp för kvinnor 25–55, byggd runt cykel- och livsfasanpassad periodisering, styrka som första princip och en community fri från kaloriskam.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

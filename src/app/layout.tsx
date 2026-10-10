import type { Metadata } from "next";
import { Manrope, DM_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "BudgetBuddy AI — Your Intelligent Money Companion",
  description:
    "Track every expense, understand your spending, and achieve your financial goals with the power of AI. A premium personal finance companion.",
  keywords: [
    "BudgetBuddy AI",
    "personal finance",
    "budget tracking",
    "AI finance assistant",
    "expense tracker",
    "savings goals",
  ],
  authors: [{ name: "BudgetBuddy AI" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "BudgetBuddy AI — Your Intelligent Money Companion",
    description: "Track every expense, understand your spending, and achieve your financial goals with the power of AI.",
    siteName: "BudgetBuddy AI",
    type: "website",
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
        className={`${manrope.variable} ${dmMono.variable} ${playfair.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

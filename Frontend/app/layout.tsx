import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/store/store";
import { Toaster } from "sonner";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Spendly — Personal Expense Tracker",
  description:
    "Track your daily expenses, analyze spending patterns, and take control of your finances.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${dmSans.variable} font-dm antialiased`}
      >
        <StoreProvider>
          {children}
          <Toaster richColors position="top-right" />
        </StoreProvider>
      </body>
    </html>
  );
}

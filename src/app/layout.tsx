import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PDFPro - Free Online PDF Tools | 100% Private & Secure",
  description:
    "Transform your PDFs with our free, privacy-first tools. Merge, split, compress, convert, and edit PDFs directly in your browser. No uploads, no servers - your files never leave your device.",
  keywords: [
    "PDF tools",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "PDF converter",
    "free PDF",
    "online PDF",
    "GDPR compliant",
    "private PDF",
  ],
  authors: [{ name: "PDFPro" }],
  openGraph: {
    title: "PDFPro - Free Online PDF Tools | 100% Private",
    description:
      "Transform your PDFs with our free, privacy-first tools. Your files never leave your device.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFPro - Free Online PDF Tools | 100% Private",
    description:
      "Transform your PDFs with our free, privacy-first tools. Your files never leave your device.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <div className="flex min-h-screen flex-col" style={{ background: '#050510' }}>
          <Header />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

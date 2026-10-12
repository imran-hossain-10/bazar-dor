import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import Navbar from "@/components/Navbar";
import PriceTicker from "@/components/PriceTicker";
import Footer from "@/components/Footer";

import "./globals.css";

export const metadata: Metadata = {
  title: "বাজার দর | নিত্যপ্রয়োজনীয় পণ্যের দাম",
  description:
    "বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের দাম, বাজারভিত্তিক তুলনা এবং দৈনিক মূল্য পরিবর্তন এক নজরে দেখুন।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#f8faf7] text-gray-900 antialiased">

        {/* Fixed Navbar + PriceTicker */}
        <div className="fixed inset-x-0 top-0 z-[9999] bg-white shadow-md">
          <Navbar />
          <PriceTicker />
        </div>

        {/* Main Content */}
        <div className="pt-[180px] sm:pt-[170px]">
          <main className="min-h-[60vh]">
            {children}
          </main>

          <Footer />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
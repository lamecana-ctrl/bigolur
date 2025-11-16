// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "biG⚽Lur",
  description: "biG⚽Lur – Akıllı gol tahminleri",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-[#020817] text-white flex items-center justify-center">
        <div className="w-full max-w-md min-h-screen sm:min-h-[700px] sm:my-6 sm:rounded-3xl sm:border sm:border-[#1f2937] sm:bg-[#020617] shadow-2xl overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}

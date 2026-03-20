import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OzFest — Australian Events",
  description: "Discover events happening around Australia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex" style={{ backgroundColor: "var(--background)" }}>
        {/* Desktop sidebar */}
        <div className="hidden lg:flex h-screen sticky top-0">
          <Sidebar />
        </div>

        {/* Main area */}
        <div className="flex flex-col flex-1 min-h-screen min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediCare Plus | Your Health, Our Priority",
  description:
    "MediCare Plus is your trusted partner for modern healthcare. Book appointments, access health records, and connect with top-rated doctors — all in one place.",
  keywords: ["healthcare", "doctors", "appointments", "medical records", "telehealth"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

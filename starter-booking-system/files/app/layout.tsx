import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Booking System",
  description:
    "Appointment booking system with calendar view and availability management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <header className="border-b bg-white">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <a href="/" className="text-xl font-bold text-primary">
              BookingHub
            </a>
            <nav className="flex items-center gap-6">
              <a
                href="/book"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Book Appointment
              </a>
              <a
                href="/admin"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Admin
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

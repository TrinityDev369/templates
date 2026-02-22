import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SocialHub",
  description: "Social network with feeds, profiles, and messaging",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              SocialHub
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                Feed
              </Link>
              <Link
                href="/explore"
                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                Explore
              </Link>
              <Link
                href="/messages"
                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
              >
                Messages
              </Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

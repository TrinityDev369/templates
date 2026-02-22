import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow - Project Management",
  description: "Project management with tasks, boards, and timelines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
            <div className="p-6 border-b border-gray-800">
              <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
              <p className="text-xs text-gray-400 mt-1">Project Management</p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Projects
              </Link>
              <Link
                href="/projects/new"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </Link>
            </nav>
            <div className="p-4 border-t border-gray-800">
              <p className="text-xs text-gray-500">TaskFlow v0.1.0</p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

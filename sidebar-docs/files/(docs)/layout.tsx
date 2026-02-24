import { DocsSidebar } from "@/components/docs-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DocsSidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}

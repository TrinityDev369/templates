import { SettingsSidebar } from "@/components/settings-sidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden border-r bg-background md:block">
        <SettingsSidebar />
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>
      </main>
    </div>
  );
}

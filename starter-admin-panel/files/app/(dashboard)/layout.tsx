import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { SessionProvider } from "@/lib/session-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <DashboardShell session={session}>{children}</DashboardShell>
    </SessionProvider>
  );
}

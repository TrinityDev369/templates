import { requirePermission } from "@/lib/require-permission";
import { AuditLogViewer } from "./audit-log-viewer";
import { getAuditLogs } from "@/lib/audit";

export default async function AuditPage() {
  await requirePermission("audit:view");
  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">
          Track all user actions and system events.
        </p>
      </div>
      <AuditLogViewer initialLogs={logs} />
    </div>
  );
}

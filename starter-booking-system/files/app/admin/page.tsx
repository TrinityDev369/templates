import { AdminDashboard } from "@/components/admin-dashboard";

export default function AdminPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        View and manage upcoming bookings.
      </p>
      <div className="mt-8">
        <AdminDashboard />
      </div>
    </div>
  );
}

import { KpiCard } from "@/components/kpi-card";
import type { KpiCard as KpiCardType } from "@/types";

const kpis: KpiCardType[] = [
  {
    title: "Total Users",
    value: "2,420",
    change: 12.5,
    changeLabel: "from last month",
    data: [
      { value: 186 }, { value: 205 }, { value: 237 }, { value: 273 },
      { value: 209 }, { value: 214 }, { value: 242 },
    ],
  },
  {
    title: "Active Sessions",
    value: "1,210",
    change: -3.2,
    changeLabel: "from last month",
    data: [
      { value: 320 }, { value: 302 }, { value: 301 }, { value: 334 },
      { value: 290 }, { value: 298 }, { value: 310 },
    ],
  },
  {
    title: "Revenue",
    value: "$45,231",
    change: 20.1,
    changeLabel: "from last month",
    data: [
      { value: 400 }, { value: 430 }, { value: 448 }, { value: 470 },
      { value: 540 }, { value: 580 }, { value: 620 },
    ],
  },
  {
    title: "Conversion Rate",
    value: "3.2%",
    change: 0.4,
    changeLabel: "from last month",
    data: [
      { value: 28 }, { value: 30 }, { value: 29 }, { value: 31 },
      { value: 30 }, { value: 32 }, { value: 32 },
    ],
  },
];

const recentActivity = [
  { id: "1", user: "Admin User", action: "Updated settings", time: "2 min ago" },
  { id: "2", user: "Jane Cooper", action: "Created new report", time: "1 hour ago" },
  { id: "3", user: "Editor User", action: "Edited user profile", time: "3 hours ago" },
  { id: "4", user: "Bob Wilson", action: "Logged in", time: "5 hours ago" },
  { id: "5", user: "Admin User", action: "Added new user", time: "1 day ago" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your application metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-sm font-medium">{item.user}</p>
                <p className="text-sm text-muted-foreground">{item.action}</p>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

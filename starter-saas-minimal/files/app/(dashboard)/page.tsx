"use client";

import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DashboardStats, Order } from "@/types";

const stats: DashboardStats = {
  revenue: 45231.89,
  revenueTrend: 20.1,
  orders: 2350,
  ordersTrend: 12.5,
  customers: 12234,
  customersTrend: 5.2,
  conversionRate: 3.2,
  conversionTrend: -0.4,
};

const revenueData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }),
  revenue: Math.floor(800 + ((i * 47) % 1200) + i * 20),
}));

const recentOrders: Pick<Order, "id" | "customer" | "status" | "total" | "createdAt">[] = [
  { id: "ORD-001", customer: "Alice Johnson", status: "delivered", total: 129.99, createdAt: "2024-01-15" },
  { id: "ORD-002", customer: "Bob Smith", status: "shipped", total: 79.5, createdAt: "2024-01-15" },
  { id: "ORD-003", customer: "Carol White", status: "processing", total: 349.0, createdAt: "2024-01-14" },
  { id: "ORD-004", customer: "Dan Brown", status: "pending", total: 52.0, createdAt: "2024-01-14" },
  { id: "ORD-005", customer: "Eve Davis", status: "delivered", total: 199.99, createdAt: "2024-01-13" },
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  delivered: "default",
  shipped: "secondary",
  processing: "outline",
  pending: "outline",
  cancelled: "destructive",
};

function TrendIndicator({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span className={`flex items-center gap-1 text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
      {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  );
}

export default function DashboardOverview() {
  const kpis = [
    { title: "Revenue", value: formatCurrency(stats.revenue), trend: stats.revenueTrend, icon: DollarSign },
    { title: "Orders", value: stats.orders.toLocaleString(), trend: stats.ordersTrend, icon: ShoppingCart },
    { title: "Customers", value: stats.customers.toLocaleString(), trend: stats.customersTrend, icon: Users },
    { title: "Conversion", value: `${stats.conversionRate}%`, trend: stats.conversionTrend, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <TrendIndicator value={kpi.trend} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value: number) => [`$${value}`, "Revenue"]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="url(#revenueGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Total</th>
                  <th className="pb-3 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{order.id}</td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant[order.status] ?? "outline"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">{formatCurrency(order.total)}</td>
                    <td className="py-3 text-right">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

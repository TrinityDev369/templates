"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Download, MoreHorizontal, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const orders: Order[] = [
  { id: "ORD-1001", customer: "Alice Johnson", email: "alice@example.com", status: "delivered", total: 129.99, items: [], createdAt: "2024-01-15" },
  { id: "ORD-1002", customer: "Bob Smith", email: "bob@example.com", status: "shipped", total: 79.5, items: [], createdAt: "2024-01-15" },
  { id: "ORD-1003", customer: "Carol White", email: "carol@example.com", status: "processing", total: 349.0, items: [], createdAt: "2024-01-14" },
  { id: "ORD-1004", customer: "Dan Brown", email: "dan@example.com", status: "pending", total: 52.0, items: [], createdAt: "2024-01-14" },
  { id: "ORD-1005", customer: "Eve Davis", email: "eve@example.com", status: "delivered", total: 199.99, items: [], createdAt: "2024-01-13" },
  { id: "ORD-1006", customer: "Frank Miller", email: "frank@example.com", status: "cancelled", total: 89.0, items: [], createdAt: "2024-01-13" },
  { id: "ORD-1007", customer: "Grace Lee", email: "grace@example.com", status: "shipped", total: 445.0, items: [], createdAt: "2024-01-12" },
  { id: "ORD-1008", customer: "Henry Wilson", email: "henry@example.com", status: "processing", total: 167.5, items: [], createdAt: "2024-01-12" },
  { id: "ORD-1009", customer: "Iris Chen", email: "iris@example.com", status: "delivered", total: 299.99, items: [], createdAt: "2024-01-11" },
  { id: "ORD-1010", customer: "Jack Taylor", email: "jack@example.com", status: "pending", total: 75.0, items: [], createdAt: "2024-01-11" },
];

const statusVariant: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  delivered: "default",
  shipped: "secondary",
  processing: "outline",
  pending: "outline",
  cancelled: "destructive",
  refunded: "destructive",
};

export default function OrdersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [statusFilter]);

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
            Order ID <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-medium">{row.getValue("id")}</span>,
      },
      {
        accessorKey: "customer",
        header: "Customer",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as OrderStatus;
          return <Badge variant={statusVariant[status]}>{status}</Badge>;
        },
      },
      {
        accessorKey: "total",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()} className="justify-end">
            Total <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("total"))}</div>,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => formatDate(row.getValue("createdAt")),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Update status</DropdownMenuItem>
              <DropdownMenuItem>Send invoice</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Orders</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-48 pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="pb-3 text-left font-medium text-muted-foreground">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

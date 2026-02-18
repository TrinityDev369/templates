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
import { ArrowUpDown, MoreHorizontal, Plus, Search } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

const products: Product[] = [
  { id: "1", name: "Wireless Headphones", description: "", price: 79.99, category: "Electronics", stock: 124, status: "active", rating: 4.5, reviewCount: 89, createdAt: "2024-01-01" },
  { id: "2", name: "Cotton T-Shirt", description: "", price: 24.99, category: "Clothing", stock: 350, status: "active", rating: 4.2, reviewCount: 156, createdAt: "2024-01-02" },
  { id: "3", name: "Running Shoes", description: "", price: 129.99, category: "Sports", stock: 67, status: "active", rating: 4.8, reviewCount: 234, createdAt: "2024-01-03" },
  { id: "4", name: "Coffee Maker", description: "", price: 89.99, category: "Home", stock: 45, status: "active", rating: 4.3, reviewCount: 78, createdAt: "2024-01-04" },
  { id: "5", name: "Yoga Mat", description: "", price: 34.99, category: "Sports", stock: 200, status: "active", rating: 4.6, reviewCount: 112, createdAt: "2024-01-05" },
  { id: "6", name: "Desk Lamp", description: "", price: 49.99, category: "Home", stock: 0, status: "draft", rating: 4.1, reviewCount: 45, createdAt: "2024-01-06" },
  { id: "7", name: "Bluetooth Speaker", description: "", price: 59.99, category: "Electronics", stock: 88, status: "active", rating: 4.4, reviewCount: 167, createdAt: "2024-01-07" },
  { id: "8", name: "Leather Wallet", description: "", price: 44.99, category: "Accessories", stock: 150, status: "active", rating: 4.7, reviewCount: 93, createdAt: "2024-01-08" },
  { id: "9", name: "Vintage Poster", description: "", price: 19.99, category: "Home", stock: 0, status: "archived", rating: 3.9, reviewCount: 22, createdAt: "2024-01-09" },
  { id: "10", name: "Smartwatch", description: "", price: 199.99, category: "Electronics", stock: 32, status: "active", rating: 4.6, reviewCount: 301, createdAt: "2024-01-10" },
];

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
};

const PLACEHOLDER_COLORS = [
  "bg-blue-100 dark:bg-blue-900",
  "bg-green-100 dark:bg-green-900",
  "bg-purple-100 dark:bg-purple-900",
  "bg-orange-100 dark:bg-orange-900",
  "bg-pink-100 dark:bg-pink-900",
];

export default function ProductsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        id: "image",
        header: "",
        cell: ({ row }) => (
          <div
            className={`h-10 w-10 rounded-md ${PLACEHOLDER_COLORS[parseInt(row.original.id) % PLACEHOLDER_COLORS.length]}`}
          />
        ),
        size: 48,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
            Name <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()} className="justify-end">
            Price <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue("price"))}</div>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => {
          const stock = row.getValue("stock") as number;
          return (
            <span className={stock === 0 ? "text-destructive" : stock < 50 ? "text-yellow-600" : ""}>
              {stock}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return <Badge variant={statusVariant[status] ?? "outline"}>{status}</Badge>;
        },
      },
      {
        id: "actions",
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: products,
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button className="gap-1">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Catalog</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-56 pl-8"
              />
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

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} product(s)
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

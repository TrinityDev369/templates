"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MoreHorizontal,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { OrderStatusBadge } from "./order-status-badge";
import type { Order } from "./types";

/* ---------- placeholder data ---------- */

const ORDERS: Order[] = [
  {
    id: "1", orderNumber: "ORD-1234", date: "2026-02-15", status: "delivered", total: 259.97,
    items: [
      { id: "i1", name: "Wireless Headphones", price: 129.99, quantity: 1 },
      { id: "i2", name: "USB-C Cable 2-Pack", price: 14.99, quantity: 2 },
      { id: "i3", name: "Phone Case", price: 99.99, quantity: 1 },
    ],
    shippingAddress: { name: "Alice Johnson", street: "123 Elm St", city: "Portland", state: "OR", zip: "97201", country: "US" },
    trackingNumber: "1Z999AA10123456784",
  },
  {
    id: "2", orderNumber: "ORD-1235", date: "2026-02-13", status: "shipped", total: 49.99,
    items: [{ id: "i4", name: "Bluetooth Speaker", price: 49.99, quantity: 1 }],
    shippingAddress: { name: "Alice Johnson", street: "123 Elm St", city: "Portland", state: "OR", zip: "97201", country: "US" },
    trackingNumber: "9400111899223100001",
  },
  {
    id: "3", orderNumber: "ORD-1236", date: "2026-02-10", status: "processing", total: 184.50,
    items: [
      { id: "i5", name: "Running Shoes", price: 149.50, quantity: 1 },
      { id: "i6", name: "Athletic Socks 3-Pack", price: 17.50, quantity: 2 },
    ],
    shippingAddress: { name: "Bob Smith", street: "456 Oak Ave", city: "Seattle", state: "WA", zip: "98101", country: "US" },
  },
  {
    id: "4", orderNumber: "ORD-1237", date: "2026-02-08", status: "pending", total: 34.99,
    items: [{ id: "i7", name: "Book: Design Patterns", price: 34.99, quantity: 1 }],
    shippingAddress: { name: "Carol White", street: "789 Pine Rd", city: "Denver", state: "CO", zip: "80201", country: "US" },
  },
  {
    id: "5", orderNumber: "ORD-1238", date: "2026-02-05", status: "delivered", total: 599.99,
    items: [{ id: "i8", name: "Mechanical Keyboard", price: 199.99, quantity: 1 }, { id: "i9", name: "Ergonomic Mouse", price: 89.99, quantity: 1 }, { id: "i10", name: "Monitor Stand", price: 310.01, quantity: 1 }],
    shippingAddress: { name: "Dan Lee", street: "321 Maple Dr", city: "Austin", state: "TX", zip: "73301", country: "US" },
    trackingNumber: "1Z999BB20123456785",
  },
  {
    id: "6", orderNumber: "ORD-1239", date: "2026-01-29", status: "cancelled", total: 79.00,
    items: [{ id: "i11", name: "Yoga Mat", price: 45.00, quantity: 1 }, { id: "i12", name: "Water Bottle", price: 34.00, quantity: 1 }],
    shippingAddress: { name: "Eve Adams", street: "654 Birch Ln", city: "Chicago", state: "IL", zip: "60601", country: "US" },
  },
  {
    id: "7", orderNumber: "ORD-1240", date: "2026-01-22", status: "delivered", total: 1249.00,
    items: [{ id: "i13", name: "Laptop Stand Pro", price: 249.00, quantity: 1 }, { id: "i14", name: "Webcam 4K", price: 199.00, quantity: 1 }, { id: "i15", name: "Docking Station", price: 801.00, quantity: 1 }],
    shippingAddress: { name: "Frank Miller", street: "111 Cedar Ct", city: "San Francisco", state: "CA", zip: "94102", country: "US" },
    trackingNumber: "9261290100130435082866",
  },
  {
    id: "8", orderNumber: "ORD-1241", date: "2026-01-18", status: "shipped", total: 67.48,
    items: [{ id: "i16", name: "Notebook 3-Pack", price: 22.49, quantity: 3 }],
    shippingAddress: { name: "Grace Kim", street: "222 Walnut St", city: "Boston", state: "MA", zip: "02101", country: "US" },
    trackingNumber: "92748999985493512004877",
  },
  {
    id: "9", orderNumber: "ORD-1242", date: "2026-01-10", status: "delivered", total: 159.98,
    items: [{ id: "i17", name: "Smart Watch Band", price: 29.99, quantity: 2 }, { id: "i18", name: "Screen Protector", price: 9.99, quantity: 2 }, { id: "i19", name: "Charging Pad", price: 80.01, quantity: 1 }],
    shippingAddress: { name: "Hank Brown", street: "333 Spruce Way", city: "Miami", state: "FL", zip: "33101", country: "US" },
    trackingNumber: "1Z999CC30123456786",
  },
  {
    id: "10", orderNumber: "ORD-1243", date: "2026-01-03", status: "processing", total: 449.97,
    items: [{ id: "i20", name: "Noise-Cancelling Earbuds", price: 149.99, quantity: 3 }],
    shippingAddress: { name: "Ivy Chen", street: "444 Aspen Blvd", city: "New York", state: "NY", zip: "10001", country: "US" },
  },
];

const PAGE_SIZE = 5;

interface OrderHistoryProps {
  /** Callback when user clicks "Re-order" */
  onReorder?: (order: Order) => void;
  /** Callback when user clicks "View Details" */
  onViewDetails?: (order: Order) => void;
  /** Callback when user clicks "Download Invoice" */
  onDownloadInvoice?: (order: Order) => void;
  /** Callback for empty-state CTA */
  onStartShopping?: () => void;
}

export function OrderHistory({
  onReorder,
  onViewDetails,
  onDownloadInvoice,
  onStartShopping,
}: OrderHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeFrom, setActiveFrom] = useState("");
  const [activeTo, setActiveTo] = useState("");

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  const filtered = useMemo(() => {
    return ORDERS.filter((o) => {
      if (activeFrom && o.date < activeFrom) return false;
      if (activeTo && o.date > activeTo) return false;
      return true;
    });
  }, [activeFrom, activeTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleFilter() {
    setActiveFrom(dateFrom);
    setActiveTo(dateTo);
    setPage(1);
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground/30" />
        <div>
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm text-muted-foreground">
            When you place an order, it will appear here.
          </p>
        </div>
        <Button onClick={onStartShopping}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-end gap-2">
          <div className="grid gap-1">
            <label htmlFor="date-from" className="text-xs text-muted-foreground">
              From
            </label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 w-36"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="date-to" className="text-xs text-muted-foreground">
              To
            </label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 w-36"
            />
          </div>
          <Button size="sm" variant="secondary" className="h-9" onClick={handleFilter}>
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((order) => {
              const isOpen = expandedId === order.id;
              return (
                <Collapsible key={order.id} open={isOpen} onOpenChange={() => toggleExpand(order.id)} asChild>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-center">{order.items.length}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium">{fmt(order.total)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onViewDetails?.(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onReorder?.(order)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Re-order
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onDownloadInvoice?.(order)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>

                    <CollapsibleContent asChild>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={7} className="p-0">
                          <div className="px-6 py-4 space-y-4">
                            {/* Items */}
                            <div>
                              <p className="mb-2 text-sm font-semibold">Items</p>
                              <div className="divide-y rounded-md border bg-background">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gradient-to-br from-muted/60 to-muted">
                                      <Package className="h-4 w-4 text-muted-foreground/40" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {item.quantity} x {fmt(item.price)}
                                      </p>
                                    </div>
                                    <p className="text-sm font-medium">{fmt(item.price * item.quantity)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping + Tracking */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
                              <div>
                                <p className="mb-1 text-sm font-semibold">Shipping Address</p>
                                <div className="text-sm text-muted-foreground leading-relaxed">
                                  <p>{order.shippingAddress.name}</p>
                                  <p>{order.shippingAddress.street}</p>
                                  <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                    {order.shippingAddress.zip}
                                  </p>
                                  <p>{order.shippingAddress.country}</p>
                                </div>
                              </div>
                              {order.trackingNumber && (
                                <div>
                                  <p className="mb-1 text-sm font-semibold">Tracking Number</p>
                                  <p className="font-mono text-sm text-muted-foreground">
                                    {order.trackingNumber}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(safePage - 1) * PAGE_SIZE + 1}
          {"\u2013"}
          {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

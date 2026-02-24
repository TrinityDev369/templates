"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  RefreshCw,
  CalendarDays,
  Users,
} from "lucide-react";
import { cn, formatDate, formatDateShort, formatTime } from "@/lib/utils";
import type { BookingWithSlot } from "@/lib/types";

export function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingWithSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchBookings() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch bookings");
        return;
      }

      setBookings(data.bookings || []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  // Group bookings by date
  const bookingsByDate = bookings.reduce<Record<string, BookingWithSlot[]>>(
    (acc, booking) => {
      const date = booking.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(booking);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(bookingsByDate).sort();

  // Stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = bookingsByDate[todayStr]?.length || 0;
  const totalUpcoming = bookings.length;
  const uniqueCustomers = new Set(bookings.map((b) => b.customer_email)).size;

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold">{todayCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold">{totalUpcoming}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Customers</p>
              <p className="text-2xl font-bold">{uniqueCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent",
            loading && "cursor-not-allowed opacity-50"
          )}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="mt-3 h-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <div className="mt-4 rounded-lg border border-dashed bg-muted/30 px-4 py-12 text-center">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-sm font-medium">No upcoming bookings</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            When customers book appointments, they will appear here.
          </p>
        </div>
      )}

      {/* Bookings List */}
      {!loading && sortedDates.length > 0 && (
        <div className="mt-4 space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4 text-primary" />
                {date === todayStr ? (
                  <span>
                    Today &mdash; {formatDateShort(date)}
                  </span>
                ) : (
                  formatDate(date)
                )}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {bookingsByDate[date].length}
                </span>
              </h3>

              <div className="space-y-2">
                {bookingsByDate[date].map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {booking.customer_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">
                            {booking.customer_name}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {booking.customer_email}
                            </span>
                            {booking.customer_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {booking.customer_phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          {formatTime(booking.start_time)}
                        </span>
                        <span className="text-muted-foreground">-</span>
                        <span className="font-medium">
                          {formatTime(booking.end_time)}
                        </span>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        {booking.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

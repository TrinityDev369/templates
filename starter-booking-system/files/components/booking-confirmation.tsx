"use client";

import { CheckCircle, Calendar, Clock, User, Mail, Phone } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import type { BookingWithSlot } from "@/lib/types";

interface BookingConfirmationProps {
  booking: BookingWithSlot;
  onBookAnother: () => void;
}

export function BookingConfirmation({
  booking,
  onBookAnother,
}: BookingConfirmationProps) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle className="h-8 w-8" />
      </div>

      <h2 className="mt-4 text-2xl font-bold">Booking Confirmed!</h2>
      <p className="mt-2 text-muted-foreground">
        Your appointment has been successfully booked. A confirmation will be
        sent to your email.
      </p>

      {/* Booking Details */}
      <div className="mx-auto mt-8 max-w-md rounded-lg border bg-muted/30 p-6 text-left">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Booking Details
        </h3>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-medium">{formatDate(booking.date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="text-sm font-medium">
                {formatTime(booking.start_time)} -{" "}
                {formatTime(booking.end_time)}
              </p>
            </div>
          </div>

          <hr className="border-border" />

          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{booking.customer_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{booking.customer_email}</p>
            </div>
          </div>

          {booking.customer_phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{booking.customer_phone}</p>
              </div>
            </div>
          )}

          {booking.notes && (
            <div className="mt-2 rounded-md bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="mt-1 text-sm">{booking.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-md bg-primary/5 px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">Booking ID</p>
          <p className="font-mono text-xs font-medium text-primary">
            {booking.id}
          </p>
        </div>
      </div>

      <button
        onClick={onBookAnother}
        className="mt-8 inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        Book Another Appointment
      </button>
    </div>
  );
}

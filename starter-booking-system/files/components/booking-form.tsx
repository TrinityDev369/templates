"use client";

import { useState } from "react";
import { User, Mail, Phone, FileText } from "lucide-react";
import { cn, formatDate, formatTime } from "@/lib/utils";
import type { TimeSlot, BookingFormData } from "@/lib/types";

interface BookingFormProps {
  date: string;
  slot: TimeSlot;
  onSubmit: (data: BookingFormData) => void;
  isSubmitting: boolean;
}

export function BookingForm({
  date,
  slot,
  onSubmit,
  isSubmitting,
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "Name is required";
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  }

  function handleChange(
    field: keyof BookingFormData,
    value: string
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      {/* Booking Summary */}
      <div className="mb-6 rounded-lg bg-primary/5 p-4">
        <h3 className="text-sm font-medium text-primary">Booking Summary</h3>
        <p className="mt-1 text-sm">
          <span className="font-medium">{formatDate(date)}</span>
          <span className="mx-2 text-muted-foreground">&bull;</span>
          <span>
            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
          </span>
        </p>
      </div>

      <h2 className="text-lg font-semibold">Your Details</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Please provide your contact information to complete the booking.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 flex items-center gap-2 text-sm font-medium"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            Full Name <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.customer_name}
            onChange={(e) => handleChange("customer_name", e.target.value)}
            placeholder="John Doe"
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              errors.customer_name && "border-destructive focus:ring-destructive"
            )}
          />
          {errors.customer_name && (
            <p className="mt-1 text-xs text-destructive">
              {errors.customer_name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 flex items-center gap-2 text-sm font-medium"
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email Address <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.customer_email}
            onChange={(e) => handleChange("customer_email", e.target.value)}
            placeholder="john@example.com"
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              errors.customer_email && "border-destructive focus:ring-destructive"
            )}
          />
          {errors.customer_email && (
            <p className="mt-1 text-xs text-destructive">
              {errors.customer_email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 flex items-center gap-2 text-sm font-medium"
          >
            <Phone className="h-4 w-4 text-muted-foreground" />
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.customer_phone}
            onChange={(e) => handleChange("customer_phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="mb-1.5 flex items-center gap-2 text-sm font-medium"
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Any special requests or information..."
            rows={3}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isSubmitting && "cursor-not-allowed opacity-70"
          )}
        >
          {isSubmitting ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}

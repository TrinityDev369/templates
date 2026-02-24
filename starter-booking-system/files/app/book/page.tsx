"use client";

import { useState } from "react";
import { CalendarView } from "@/components/calendar-view";
import { TimeSlots } from "@/components/time-slots";
import { BookingForm } from "@/components/booking-form";
import { BookingConfirmation } from "@/components/booking-confirmation";
import type { TimeSlot, BookingWithSlot, BookingFormData } from "@/lib/types";

type BookingStep = "date" | "time" | "form" | "confirmation";

export default function BookPage() {
  const [step, setStep] = useState<BookingStep>("date");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState<BookingWithSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setError(null);
    setStep("time");
  }

  function handleSlotSelect(slot: TimeSlot) {
    setSelectedSlot(slot);
    setError(null);
    setStep("form");
  }

  async function handleBookingSubmit(data: BookingFormData) {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_id: selectedSlot.id,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create booking");
        return;
      }

      setBooking(result.booking);
      setStep("confirmation");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStartOver() {
    setStep("date");
    setSelectedDate(null);
    setSelectedSlot(null);
    setBooking(null);
    setError(null);
  }

  const steps = [
    { key: "date", label: "Select Date" },
    { key: "time", label: "Choose Time" },
    { key: "form", label: "Your Details" },
    { key: "confirmation", label: "Confirmed" },
  ] as const;

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Book an Appointment</h1>
      <p className="mt-2 text-muted-foreground">
        Follow the steps below to schedule your appointment.
      </p>

      {/* Progress Steps */}
      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                i <= currentStepIndex
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-px w-8 ${
                  i < currentStepIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="mt-8">
        {step === "date" && <CalendarView onDateSelect={handleDateSelect} />}

        {step === "time" && selectedDate && (
          <div>
            <button
              onClick={() => setStep("date")}
              className="mb-4 text-sm text-primary hover:underline"
            >
              &larr; Back to calendar
            </button>
            <TimeSlots date={selectedDate} onSlotSelect={handleSlotSelect} />
          </div>
        )}

        {step === "form" && selectedSlot && selectedDate && (
          <div>
            <button
              onClick={() => setStep("time")}
              className="mb-4 text-sm text-primary hover:underline"
            >
              &larr; Back to time slots
            </button>
            <BookingForm
              date={selectedDate}
              slot={selectedSlot}
              onSubmit={handleBookingSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {step === "confirmation" && booking && (
          <BookingConfirmation
            booking={booking}
            onBookAnother={handleStartOver}
          />
        )}
      </div>
    </div>
  );
}

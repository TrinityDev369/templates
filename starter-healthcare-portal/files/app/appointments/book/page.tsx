"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  UserRound,
  CalendarDays,
  ClipboardCheck,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { DepartmentCard } from "@/components/department-card";
import { DoctorCard } from "@/components/doctor-card";
import { TimeSlotPicker } from "@/components/time-slot-picker";
import { departments, doctors, timeSlots } from "@/lib/data";
import { cn } from "@/lib/utils";
import Link from "next/link";

const steps = [
  { id: 1, label: "Department", icon: Building2 },
  { id: 2, label: "Doctor", icon: UserRound },
  { id: 3, label: "Date & Time", icon: CalendarDays },
  { id: 4, label: "Confirm", icon: ClipboardCheck },
];

export default function BookAppointmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedDeptData = departments.find((d) => d.id === selectedDepartment);
  const selectedDocData = doctors.find((d) => d.id === selectedDoctor);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedDepartment !== null;
      case 2:
        return selectedDoctor !== null;
      case 3:
        return selectedDate !== "" && selectedTime !== null;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="section-padding">
        <div className="container-page">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Appointment Booked!
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Your appointment has been successfully scheduled.
            </p>
            <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 text-left">
              <h3 className="font-semibold text-gray-900">
                Appointment Details
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Department</dt>
                  <dd className="font-medium text-gray-900">
                    {selectedDeptData?.name}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Doctor</dt>
                  <dd className="font-medium text-gray-900">
                    {selectedDocData?.name}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Date</dt>
                  <dd className="font-medium text-gray-900">{selectedDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Time</dt>
                  <dd className="font-medium text-gray-900">{selectedTime}</dd>
                </div>
                {notes && (
                  <div className="border-t border-gray-200 pt-3">
                    <dt className="text-gray-500">Notes</dt>
                    <dd className="mt-1 font-medium text-gray-900">{notes}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/appointments" className="btn-primary">
                <CalendarCheck className="h-5 w-5" />
                View Appointments
              </Link>
              <Link href="/" className="btn-secondary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-page">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="heading-primary">Book Appointment</h1>
          <p className="mt-2 text-gray-600">
            Schedule a visit with one of our specialists in a few easy steps.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                        isCompleted
                          ? "border-brand-600 bg-brand-600 text-white"
                          : isActive
                            ? "border-brand-600 bg-white text-brand-600"
                            : "border-gray-300 bg-white text-gray-400"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-xs font-medium",
                        isActive || isCompleted
                          ? "text-brand-600"
                          : "text-gray-400"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 mb-6 h-0.5 flex-1",
                        currentStep > step.id
                          ? "bg-brand-600"
                          : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Step 1: Select Department */}
          {currentStep === 1 && (
            <div>
              <h2 className="heading-secondary">Select a Department</h2>
              <p className="mt-2 text-gray-600">
                Choose the medical department for your visit.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map((department) => (
                  <button
                    key={department.id}
                    type="button"
                    onClick={() => setSelectedDepartment(department.id)}
                    className={cn(
                      "rounded-xl border-2 p-0 text-left transition-all",
                      selectedDepartment === department.id
                        ? "border-brand-600 ring-2 ring-brand-100"
                        : "border-transparent"
                    )}
                  >
                    <DepartmentCard department={department} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Doctor */}
          {currentStep === 2 && (
            <div>
              <h2 className="heading-secondary">Select a Doctor</h2>
              <p className="mt-2 text-gray-600">
                Choose your preferred specialist
                {selectedDeptData && (
                  <span>
                    {" "}
                    in <strong>{selectedDeptData.name}</strong>
                  </span>
                )}
                .
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className={cn(
                      "rounded-xl border-2 p-0 text-left transition-all",
                      selectedDoctor === doctor.id
                        ? "border-brand-600 ring-2 ring-brand-100"
                        : "border-transparent"
                    )}
                  >
                    <DoctorCard doctor={doctor} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {currentStep === 3 && (
            <div>
              <h2 className="heading-secondary">Select Date & Time</h2>
              <p className="mt-2 text-gray-600">
                Pick a convenient date and time for your appointment
                {selectedDocData && (
                  <span>
                    {" "}
                    with <strong>{selectedDocData.name}</strong>
                  </span>
                )}
                .
              </p>
              <div className="mt-6 grid gap-8 lg:grid-cols-2">
                {/* Date Selection */}
                <div>
                  <label
                    htmlFor="appointment-date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Appointment Date
                  </label>
                  <input
                    id="appointment-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  {selectedDocData && (
                    <p className="mt-2 text-xs text-gray-500">
                      Available days:{" "}
                      {selectedDocData.availableDays.join(", ")}
                    </p>
                  )}
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Appointment Time
                  </label>
                  <div className="mt-2">
                    <TimeSlotPicker
                      slots={timeSlots}
                      onSelect={setSelectedTime}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {currentStep === 4 && (
            <div>
              <h2 className="heading-secondary">Confirm Appointment</h2>
              <p className="mt-2 text-gray-600">
                Review your appointment details and add any notes for your
                doctor.
              </p>

              <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Appointment Summary
                </h3>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-gray-500">Department</dt>
                    <dd className="mt-1 font-medium text-gray-900">
                      {selectedDeptData?.name ?? "Not selected"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Doctor</dt>
                    <dd className="mt-1 font-medium text-gray-900">
                      {selectedDocData?.name ?? "Not selected"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Date</dt>
                    <dd className="mt-1 font-medium text-gray-900">
                      {selectedDate || "Not selected"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Time</dt>
                    <dd className="mt-1 font-medium text-gray-900">
                      {selectedTime ?? "Not selected"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Additional Notes{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe your symptoms or reason for the visit..."
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
                currentStep === 1
                  ? "cursor-not-allowed text-gray-300"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors",
                  canProceed()
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                )}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

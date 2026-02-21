import Link from "next/link";
import { CalendarPlus, CalendarCheck, CalendarX, CheckCircle2 } from "lucide-react";
import { AppointmentCard } from "@/components/appointment-card";
import { getAppointmentsByStatus } from "@/lib/data";

export default function AppointmentsPage() {
  const upcoming = getAppointmentsByStatus("upcoming");
  const completed = getAppointmentsByStatus("completed");
  const cancelled = getAppointmentsByStatus("cancelled");

  const sections = [
    {
      title: "Upcoming",
      icon: CalendarCheck,
      appointments: upcoming,
      color: "text-brand-600",
      bgColor: "bg-brand-50",
      borderColor: "border-brand-200",
      emptyText: "No upcoming appointments. Book one to get started!",
    },
    {
      title: "Completed",
      icon: CheckCircle2,
      appointments: completed,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      emptyText: "No completed appointments yet.",
    },
    {
      title: "Cancelled",
      icon: CalendarX,
      appointments: cancelled,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      emptyText: "No cancelled appointments.",
    },
  ];

  return (
    <div className="section-padding">
      <div className="container-page">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="heading-primary">My Appointments</h1>
            <p className="mt-2 text-gray-600">
              View and manage all your medical appointments in one place.
            </p>
          </div>
          <Link href="/appointments/book" className="btn-primary">
            <CalendarPlus className="h-5 w-5" />
            Book Appointment
          </Link>
        </div>

        {/* Tab-like Section Headers */}
        <div className="mt-10 flex gap-4 border-b border-gray-200 pb-0">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className={`flex items-center gap-2 border-b-2 px-4 pb-3 ${section.borderColor}`}
              >
                <Icon className={`h-4 w-4 ${section.color}`} />
                <span className="text-sm font-semibold text-gray-900">
                  {section.title}
                </span>
                <span
                  className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium ${section.bgColor} ${section.color}`}
                >
                  {section.appointments.length}
                </span>
              </div>
            );
          })}
        </div>

        {/* Appointment Sections */}
        <div className="mt-8 space-y-12">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title}>
                <div className="mb-4 flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${section.color}`} />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {section.title}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${section.bgColor} ${section.color}`}
                  >
                    {section.appointments.length}
                  </span>
                </div>

                {section.appointments.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {section.appointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className={`rounded-lg border-2 border-dashed ${section.borderColor} p-8 text-center`}
                  >
                    <Icon
                      className={`mx-auto h-10 w-10 ${section.color} opacity-40`}
                    />
                    <p className="mt-3 text-sm text-gray-500">
                      {section.emptyText}
                    </p>
                    {section.title === "Upcoming" && (
                      <Link
                        href="/appointments/book"
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        <CalendarPlus className="h-4 w-4" />
                        Book now
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Calendar, Clock, Video, MapPin, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types";

interface AppointmentCardProps {
  appointment: Appointment;
}

const statusConfig: Record<
  Appointment["status"],
  { label: string; className: string }
> = {
  upcoming: {
    label: "Upcoming",
    className: "bg-brand-50 text-brand-700 border-brand-200",
  },
  completed: {
    label: "Completed",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

const typeConfig: Record<
  Appointment["type"],
  { label: string; icon: typeof Video }
> = {
  telehealth: { label: "Telehealth", icon: Video },
  "in-person": { label: "In-Person", icon: MapPin },
};

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const status = statusConfig[appointment.status];
  const type = typeConfig[appointment.type];
  const TypeIcon = type.icon;

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* Header: Status + Type */}
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            status.className
          )}
        >
          {status.label}
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          <TypeIcon className="h-3.5 w-3.5" />
          {type.label}
        </span>
      </div>

      {/* Doctor info */}
      <div className="mt-4">
        <h3 className="font-semibold text-gray-900">
          {appointment.doctorName}
        </h3>
        <p className="mt-0.5 text-sm text-brand-600">{appointment.specialty}</p>
      </div>

      {/* Date & Time */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
          <span>{appointment.date}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Clock className="h-4 w-4 shrink-0 text-gray-400" />
          <span>{appointment.time}</span>
        </div>
      </div>

      {/* Notes preview */}
      {appointment.notes && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 p-3">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <p className="line-clamp-2 text-sm text-gray-500">
            {appointment.notes}
          </p>
        </div>
      )}
    </article>
  );
}

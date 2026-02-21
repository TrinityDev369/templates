import { FileText, TestTube, Pill, Shield, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthRecord } from "@/types";

interface RecordCardProps {
  record: HealthRecord;
}

const typeConfig: Record<
  HealthRecord["type"],
  { label: string; icon: typeof FileText; iconColor: string }
> = {
  "visit-summary": {
    label: "Visit Summary",
    icon: FileText,
    iconColor: "text-blue-500 bg-blue-50",
  },
  "lab-result": {
    label: "Lab Result",
    icon: TestTube,
    iconColor: "text-purple-500 bg-purple-50",
  },
  prescription: {
    label: "Prescription",
    icon: Pill,
    iconColor: "text-brand-500 bg-brand-50",
  },
  immunization: {
    label: "Immunization",
    icon: Shield,
    iconColor: "text-green-500 bg-green-50",
  },
};

const statusConfig: Record<
  HealthRecord["status"],
  { label: string; dotColor: string }
> = {
  normal: {
    label: "Normal",
    dotColor: "bg-green-500",
  },
  attention: {
    label: "Needs Attention",
    dotColor: "bg-amber-500",
  },
  critical: {
    label: "Critical",
    dotColor: "bg-red-500",
  },
};

export function RecordCard({ record }: RecordCardProps) {
  const type = typeConfig[record.type];
  const status = statusConfig[record.status];
  const TypeIcon = type.icon;

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="flex items-start gap-4">
        {/* Type icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            type.iconColor
          )}
        >
          <TypeIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          {/* Header: Title + Status */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">{record.title}</h3>
              <span className="mt-0.5 inline-block text-xs font-medium text-gray-400">
                {type.label}
              </span>
            </div>

            {/* Status indicator */}
            <div className="flex shrink-0 items-center gap-1.5">
              <span
                className={cn("h-2 w-2 rounded-full", status.dotColor)}
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-gray-500">
                {status.label}
              </span>
            </div>
          </div>

          {/* Meta: Date + Doctor */}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span>{record.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <User className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span>{record.doctor}</span>
            </div>
          </div>

          {/* Summary preview */}
          {record.summary && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
              {record.summary}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

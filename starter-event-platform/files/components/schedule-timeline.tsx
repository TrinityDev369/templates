import { cn } from "@/lib/utils";
import type { ScheduleSlot } from "@/types";

const typeBadgeStyles: Record<string, string> = {
  keynote: "bg-purple-100 text-purple-700",
  talk: "bg-blue-100 text-blue-700",
  workshop: "bg-green-100 text-green-700",
  break: "bg-gray-100 text-gray-600",
  networking: "bg-amber-100 text-amber-700",
};

const typeDotStyles: Record<string, string> = {
  keynote: "bg-purple-500",
  talk: "bg-blue-500",
  workshop: "bg-green-500",
  break: "bg-gray-400",
  networking: "bg-amber-500",
};

function formatTime(timeStr: string): string {
  // Accepts "HH:MM" or ISO strings
  if (timeStr.includes("T")) {
    return new Date(timeStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ScheduleTimeline({ slots }: { slots: ScheduleSlot[] }) {
  if (!slots || slots.length === 0) {
    return (
      <p className="py-12 text-center text-gray-400">
        No schedule items to display.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[7.5rem] top-0 hidden h-full w-px bg-purple-100 sm:block" />

      <div className="space-y-4">
        {slots.map((slot, index) => {
          const type = slot.type?.toLowerCase() ?? "talk";
          const badgeClass =
            typeBadgeStyles[type] ?? "bg-gray-100 text-gray-600";
          const dotClass = typeDotStyles[type] ?? "bg-gray-400";

          return (
            <div
              key={slot.id ?? index}
              className="group relative flex flex-col gap-3 sm:flex-row sm:gap-0"
            >
              {/* Time column */}
              <div className="flex w-full flex-shrink-0 items-start sm:w-[7.5rem]">
                <span className="text-sm font-semibold text-gray-500">
                  {formatTime(slot.time)}
                </span>
              </div>

              {/* Timeline dot (desktop) */}
              <div className="relative hidden flex-shrink-0 sm:flex sm:w-8 sm:justify-center">
                <div
                  className={cn(
                    "mt-1.5 h-3 w-3 rounded-full ring-4 ring-white transition-transform duration-200 group-hover:scale-125",
                    dotClass
                  )}
                />
              </div>

              {/* Content card */}
              <div
                className={cn(
                  "flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200",
                  type !== "break" && "group-hover:border-purple-100 group-hover:shadow-md"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4
                      className={cn(
                        "font-semibold",
                        type === "break"
                          ? "text-gray-500"
                          : "text-gray-900"
                      )}
                    >
                      {slot.title}
                    </h4>

                    {slot.speaker && (
                      <p className="mt-1 text-sm text-gray-500">
                        {slot.speaker}
                      </p>
                    )}

                    {slot.room && (
                      <p className="mt-1 text-xs text-gray-400">
                        {slot.room}
                      </p>
                    )}
                  </div>

                  {/* Type badge */}
                  <span
                    className={cn(
                      "flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      badgeClass
                    )}
                  >
                    {type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

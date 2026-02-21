import { FileText, FlaskConical, Pill, ClipboardList, Syringe } from "lucide-react";
import { RecordCard } from "@/components/record-card";
import { healthRecords, getRecordsByType } from "@/lib/data";
import type { HealthRecord } from "@/types";

const filterTabs: {
  label: string;
  type: HealthRecord["type"] | "all";
  icon: typeof FileText;
}[] = [
  { label: "All Records", type: "all", icon: FileText },
  { label: "Lab Results", type: "lab-result", icon: FlaskConical },
  { label: "Prescriptions", type: "prescription", icon: Pill },
  { label: "Visit Summaries", type: "visit-summary", icon: ClipboardList },
  { label: "Immunizations", type: "immunization", icon: Syringe },
];

function getRecordCountByType(type: HealthRecord["type"] | "all"): number {
  if (type === "all") return healthRecords.length;
  return getRecordsByType(type).length;
}

export default function RecordsPage() {
  return (
    <div className="section-padding">
      <div className="container-page">
        {/* Page Header */}
        <div>
          <h1 className="heading-primary">Health Records</h1>
          <p className="mt-2 text-gray-600">
            Access and review your complete medical history, lab results,
            prescriptions, and more.
          </p>
        </div>

        {/* Filter Tabs (visual only, all records shown) */}
        <div className="mt-8 flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const count = getRecordCountByType(tab.type);
            const isActive = tab.type === "all";

            return (
              <div
                key={tab.type}
                className={`inline-flex cursor-default items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span
                  className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium ${
                    isActive
                      ? "bg-brand-100 text-brand-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Records List */}
        <div className="mt-8">
          {healthRecords.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {healthRecords.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No records found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Your health records will appear here after your first visit.
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 rounded-xl bg-gray-50 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Records Summary
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {filterTabs
              .filter((tab) => tab.type !== "all")
              .map((tab) => {
                const Icon = tab.icon;
                const count = getRecordCountByType(tab.type);
                return (
                  <div
                    key={tab.type}
                    className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                      <Icon className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {count}
                      </p>
                      <p className="text-xs text-gray-500">{tab.label}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

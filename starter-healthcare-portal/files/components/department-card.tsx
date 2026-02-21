import {
  Heart,
  Brain,
  Bone,
  Baby,
  Microscope,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Department } from "@/types";

interface DepartmentCardProps {
  department: Department;
}

const departmentIcons: Record<string, LucideIcon> = {
  Cardiology: Heart,
  Neurology: Brain,
  Orthopedics: Bone,
  Pediatrics: Baby,
  Dermatology: Microscope,
  "General Medicine": Stethoscope,
  General: Stethoscope,
};

export function DepartmentCard({ department }: DepartmentCardProps) {
  const Icon = departmentIcons[department.name] ?? Stethoscope;

  return (
    <article className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-lg">
      {/* Icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 transition-colors duration-300 group-hover:bg-brand-500">
        <Icon className="h-6 w-6 text-brand-600 transition-colors duration-300 group-hover:text-white" />
      </div>

      {/* Name */}
      <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-brand-700">
        {department.name}
      </h3>

      {/* Description */}
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500">
        {department.description}
      </p>

      {/* Doctor count */}
      <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-400">
        <Users className="h-4 w-4" />
        <span>
          {department.doctorCount}{" "}
          {department.doctorCount === 1 ? "Doctor" : "Doctors"}
        </span>
      </div>
    </article>
  );
}

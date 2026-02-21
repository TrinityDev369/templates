import { Dumbbell } from "lucide-react";
import { gymClasses } from "@/lib/data";
import { ClassCard } from "@/components/class-card";

const categories = [
  "all",
  "strength",
  "cardio",
  "yoga",
  "hiit",
  "boxing",
  "cycling",
] as const;

export const metadata = {
  title: "Classes | Iron Peak Fitness",
  description:
    "Explore 50+ weekly classes including strength training, HIIT, yoga, boxing, cycling, and more. Find the perfect workout for every fitness level.",
};

export default function ClassesPage() {
  return (
    <section className="py-20 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <span className="text-brand-500 font-semibold tracking-wider uppercase text-sm">
            Push Your Limits
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mt-2">
            Our Classes
          </h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            From high-intensity interval training to mindful yoga sessions, we
            have something for every body and every goal. All classes are led by
            certified trainers.
          </p>
        </div>

        {/* Category Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <span
              key={category}
              className={`rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                category === "all"
                  ? "bg-brand-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {category}
            </span>
          ))}
        </div>

        {/* Class Grid */}
        {gymClasses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gymClasses.map((gymClass) => (
              <ClassCard key={gymClass.id} gymClass={gymClass} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-xl border border-gray-800 bg-gray-900">
            <Dumbbell className="h-12 w-12 text-gray-600 mx-auto" />
            <p className="mt-4 text-gray-500">
              No classes available at the moment. Check back soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

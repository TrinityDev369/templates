import { trainers } from "@/lib/data";
import { TrainerCard } from "@/components/trainer-card";

export const metadata = {
  title: "Trainers | Iron Peak Fitness",
  description:
    "Meet our team of certified fitness professionals. Each trainer brings years of experience and specialized expertise to help you reach your goals.",
};

export default function TrainersPage() {
  return (
    <section className="py-20 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="text-brand-500 font-semibold tracking-wider uppercase text-sm">
            The Iron Peak Team
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mt-2">
            Meet Our Trainers
          </h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Our certified trainers are passionate about helping you reach your
            full potential. Each one brings a unique approach to fitness, ensuring
            you get the guidance and motivation you need.
          </p>
        </div>

        {/* Trainer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      </div>
    </section>
  );
}

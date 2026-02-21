import { NeighborhoodCard } from "@/components/neighborhood-card";
import { neighborhoods } from "@/lib/data";

export const metadata = {
  title: "Our Neighborhoods | Homestead",
  description:
    "Explore vibrant communities and quiet retreats. Find the perfect neighborhood for your lifestyle with Homestead.",
};

export default function NeighborhoodsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Our Neighborhoods
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-500">
          Every neighborhood has its own personality. Whether you are looking for
          walkable urban streets, tree-lined suburban lanes, or a lakeside
          retreat, we have listings in communities that match the way you want to
          live. Explore the areas we serve and discover your next address.
        </p>
      </div>

      {/* Neighborhood Grid */}
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {neighborhoods.map((neighborhood) => (
          <NeighborhoodCard key={neighborhood.id} neighborhood={neighborhood} />
        ))}
      </div>
    </section>
  );
}

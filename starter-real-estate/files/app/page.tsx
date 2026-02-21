import Link from "next/link";
import { ArrowRight, Home, Users, UserCheck, MapPin } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { PropertyCard } from "@/components/property-card";
import { NeighborhoodCard } from "@/components/neighborhood-card";
import { properties, neighborhoods } from "@/lib/data";

const stats = [
  { icon: Home, label: "Properties", value: "500+" },
  { icon: Users, label: "Happy Clients", value: "200+" },
  { icon: UserCheck, label: "Expert Agents", value: "50+" },
  { icon: MapPin, label: "Neighborhoods", value: "15+" },
];

export default function HomePage() {
  const featuredProperties = properties.slice(0, 4);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-500 text-white">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Find Your Dream Home
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-brand-100 sm:text-xl">
            Discover the perfect property from our curated collection of homes,
            apartments, condos, and townhouses across the most desirable
            neighborhoods.
          </p>
          <div className="mx-auto mt-10 max-w-3xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* ── Featured Properties ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Featured Properties
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Hand-picked listings that represent the best value and quality in
            today&apos;s market.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            View All Properties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Neighborhoods ─────────────────────────────────────── */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Explore Neighborhoods
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
              From bustling downtown districts to quiet suburban retreats, find
              the community that fits your lifestyle.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {neighborhoods.slice(0, 6).map((neighborhood) => (
              <NeighborhoodCard
                key={neighborhood.id}
                neighborhood={neighborhood}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="bg-brand-700">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Find Your Home?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            Whether you&apos;re buying your first home or searching for a luxury
            property, our team is here to help every step of the way.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
            >
              Browse Properties
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Contact an Agent
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

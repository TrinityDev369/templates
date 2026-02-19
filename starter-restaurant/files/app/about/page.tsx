import type { Metadata } from "next";
import { UtensilsCrossed, Award } from "lucide-react";
import { chefs, stats } from "@/lib/data";

export const metadata: Metadata = {
  title: "About | Savoria",
};

const values = [
  {
    title: "Fresh Ingredients",
    description:
      "We source locally grown, seasonal produce to ensure every dish bursts with natural flavor.",
  },
  {
    title: "Culinary Excellence",
    description:
      "Our chefs bring technique and passion to every plate, elevating dining into an art form.",
  },
  {
    title: "Warm Hospitality",
    description:
      "From the moment you walk in, we are dedicated to making every guest feel at home.",
  },
];

export default function AboutPage() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Our Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center">
            <UtensilsCrossed className="h-16 w-16 text-muted-foreground/30" />
          </div>
          <div>
            <span className="uppercase text-primary tracking-wider text-sm font-medium">
              Our Story
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2">
              A Legacy of Flavor
            </h1>
            <p className="text-muted-foreground mt-4">
              Since 2009, Savoria has been a cornerstone of the local dining
              scene. What started as a small family kitchen has grown into one of
              the city&apos;s most beloved restaurants, where timeless recipes
              meet modern culinary creativity.
            </p>
            <p className="text-muted-foreground mt-4">
              We are committed to locally sourced ingredients, honoring the
              family recipes passed down through generations while embracing
              innovation. Every dish tells a story of dedication, heritage, and
              an unwavering pursuit of flavor.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-serif font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Chef Team */}
        <div className="mt-20">
          <div className="text-center">
            <span className="uppercase text-primary tracking-wider text-sm font-medium">
              Our Team
            </span>
            <h2 className="font-serif text-3xl mt-2">
              Meet the Culinary Artists
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {chefs.map((chef) => (
              <div
                key={chef.id}
                className="rounded-xl border bg-card overflow-hidden"
              >
                <div className="h-64 bg-muted flex items-center justify-center">
                  <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold">
                    {chef.name}
                  </h3>
                  <p className="text-primary text-sm font-medium">
                    {chef.role}
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    {chef.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mt-20 text-center">
          <h2 className="font-serif text-3xl">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {values.map((value) => (
              <div key={value.title}>
                <Award className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-semibold mt-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

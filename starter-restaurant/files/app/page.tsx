import Link from "next/link";
import { Star, Clock, UtensilsCrossed, ArrowRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { featuredDishes, testimonials, offers, stats } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Section 1 — Hero                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Welcome to Savoria
          </span>

          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight mt-4">
            Savor the Taste of Perfection
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            From sizzling appetizers to signature desserts, every dish is
            crafted with passion and the finest ingredients to delight your
            senses.
          </p>

          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/menu"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-3 font-medium inline-flex items-center gap-2"
            >
              <UtensilsCrossed className="h-4 w-4" />
              View Our Menu
            </Link>
            <Link
              href="/reservations"
              className="border border-primary text-primary hover:bg-primary/10 rounded-md px-6 py-3 font-medium inline-flex items-center gap-2"
            >
              Book a Table
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 2 — Featured Dishes                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              Popular Dishes
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mt-2">
              Our Favorite Creations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDishes.map((dish) => (
              <div
                key={dish.id}
                className="rounded-lg overflow-hidden border bg-card"
              >
                {/* Image placeholder */}
                <div className="h-48 bg-muted flex items-center justify-center">
                  <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" />
                </div>

                {/* Card content */}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{dish.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 whitespace-nowrap">
                      {dish.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {dish.description}
                  </p>
                  <p className="font-serif text-lg text-primary font-bold mt-3">
                    ${dish.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 3 — About Teaser                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left — image placeholder */}
          <div className="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center">
            <UtensilsCrossed className="h-16 w-16 text-muted-foreground/30" />
          </div>

          {/* Right — copy and stats */}
          <div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              About Us
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mt-2">
              Our Story &amp; Achievements
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              For over a decade, Savoria has been a cornerstone of fine dining
              in the heart of downtown. What began as a small family kitchen
              has grown into an award-winning destination where tradition meets
              innovation. Our chefs source the freshest seasonal ingredients
              to create dishes that honor culinary heritage while pushing
              creative boundaries.
            </p>

            {/* Stats 2x2 grid */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-serif font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-1 text-primary font-medium mt-8 hover:underline"
            >
              Learn more about us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 4 — Testimonials                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              Testimonials
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mt-2">
              What Our Guests Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-lg border bg-card p-6"
              >
                <Quote className="h-8 w-8 text-primary/20" />
                <p className="mt-4 italic text-muted-foreground leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex gap-0.5 mt-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="font-semibold mt-3">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 5 — Offers                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              Special Offers
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mt-2">
              Explore Our Offerings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-lg overflow-hidden border bg-background"
              >
                {/* Image placeholder */}
                <div className="h-40 bg-muted flex items-center justify-center">
                  <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" />
                </div>

                {/* Content */}
                <div className="p-4">
                  {offer.badge && (
                    <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                      {offer.badge}
                    </span>
                  )}
                  <h3 className={cn("font-semibold text-lg", offer.badge && "mt-2")}>
                    {offer.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {offer.description}
                  </p>
                  {offer.price && (
                    <p className="font-serif text-xl text-primary font-bold mt-3">
                      {offer.price}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Section 6 — CTA Banner                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
            Ready to Experience Savoria?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Reserve your table today and let us take you on a culinary journey
            you won&apos;t forget. Walk-ins welcome, but reservations are
            recommended for the best experience.
          </p>
          <Link
            href="/reservations"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-8 py-3 font-medium inline-flex items-center gap-2 mt-8"
          >
            <Clock className="h-4 w-4" />
            Reserve a Table
          </Link>
        </div>
      </section>
    </>
  );
}

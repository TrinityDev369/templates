"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChefHat, Flame, Leaf, Wheat } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MenuItem {
  name: string;
  description: string;
  price: number;
  dietary: ("V" | "VG" | "GF" | "spicy")[];
  featured: boolean;
}

interface Category {
  id: string;
  label: string;
  items: MenuItem[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const RESTAURANT_NAME = "Trattoria del Sole";
const RESTAURANT_TAGLINE = "Authentic Italian cuisine crafted with passion since 1987";

const CATEGORIES: Category[] = [
  {
    id: "appetizers",
    label: "Appetizers",
    items: [
      {
        name: "Bruschetta Classica",
        description:
          "Toasted sourdough topped with vine-ripened tomatoes, fresh basil, garlic, and aged balsamic reduction.",
        price: 12,
        dietary: ["V", "VG"],
        featured: false,
      },
      {
        name: "Burrata con Prosciutto",
        description:
          "Creamy burrata cheese draped with San Daniele prosciutto, arugula, and truffle honey.",
        price: 18,
        dietary: [],
        featured: true,
      },
      {
        name: "Carpaccio di Manzo",
        description:
          "Paper-thin slices of prime beef tenderloin with capers, shaved Parmigiano, and lemon-olive oil dressing.",
        price: 16,
        dietary: ["GF"],
        featured: false,
      },
      {
        name: "Arancini al Ragù",
        description:
          "Golden-fried risotto balls stuffed with slow-cooked beef ragù and melted mozzarella.",
        price: 14,
        dietary: [],
        featured: false,
      },
    ],
  },
  {
    id: "mains",
    label: "Mains",
    items: [
      {
        name: "Ossobuco alla Milanese",
        description:
          "Braised veal shank in a rich saffron and white wine sauce, served with creamy risotto.",
        price: 34,
        dietary: ["GF"],
        featured: true,
      },
      {
        name: "Branzino al Forno",
        description:
          "Whole oven-roasted Mediterranean sea bass with roasted cherry tomatoes, olives, and capers.",
        price: 32,
        dietary: ["GF"],
        featured: false,
      },
      {
        name: "Pollo alla Parmigiana",
        description:
          "Pan-fried chicken breast layered with San Marzano tomato sauce, mozzarella, and fresh basil.",
        price: 26,
        dietary: [],
        featured: false,
      },
      {
        name: "Melanzane alla Norma",
        description:
          "Roasted eggplant with ricotta salata, cherry tomatoes, and basil on a bed of polenta.",
        price: 22,
        dietary: ["V", "GF"],
        featured: false,
      },
    ],
  },
  {
    id: "pasta",
    label: "Pasta",
    items: [
      {
        name: "Cacio e Pepe",
        description:
          "House-made tonnarelli tossed in a silky emulsion of Pecorino Romano and cracked black pepper.",
        price: 20,
        dietary: ["V"],
        featured: false,
      },
      {
        name: "Pappardelle al Cinghiale",
        description:
          "Wide ribbons of fresh pasta with slow-braised wild boar ragù and a hint of juniper.",
        price: 26,
        dietary: [],
        featured: true,
      },
      {
        name: "Ravioli di Zucca",
        description:
          "Handmade butternut squash ravioli with brown butter, sage, toasted pine nuts, and amaretti crumble.",
        price: 24,
        dietary: ["V"],
        featured: false,
      },
      {
        name: "Spaghetti all'Arrabbiata",
        description:
          "Al dente spaghetti in a fiery San Marzano tomato sauce with garlic and Calabrian chili.",
        price: 18,
        dietary: ["V", "VG", "spicy"],
        featured: false,
      },
      {
        name: "Linguine ai Frutti di Mare",
        description:
          "Fresh linguine with clams, mussels, prawns, and calamari in a light white wine and garlic broth.",
        price: 28,
        dietary: [],
        featured: false,
      },
    ],
  },
  {
    id: "grill",
    label: "Grill",
    items: [
      {
        name: "Bistecca alla Fiorentina",
        description:
          "Dry-aged T-bone steak grilled over oak charcoal, seasoned with sea salt, rosemary, and extra virgin olive oil. Serves two.",
        price: 62,
        dietary: ["GF"],
        featured: true,
      },
      {
        name: "Tagliata di Manzo",
        description:
          "Sliced grilled ribeye over a bed of wild arugula with shaved Parmigiano and balsamic.",
        price: 36,
        dietary: ["GF"],
        featured: false,
      },
      {
        name: "Gamberi alla Griglia",
        description:
          "Chargrilled king prawns marinated in garlic, lemon, and chili, served with grilled polenta.",
        price: 30,
        dietary: ["GF", "spicy"],
        featured: false,
      },
      {
        name: "Costolette d'Agnello",
        description:
          "Herb-crusted lamb chops with a rosemary and red wine jus, roasted potatoes, and seasonal vegetables.",
        price: 38,
        dietary: ["GF"],
        featured: false,
      },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    items: [
      {
        name: "Tiramisù della Casa",
        description:
          "Our signature tiramisù with mascarpone cream, espresso-soaked ladyfingers, and Marsala wine.",
        price: 14,
        dietary: ["V"],
        featured: true,
      },
      {
        name: "Panna Cotta al Limoncello",
        description:
          "Silky vanilla panna cotta infused with limoncello, topped with candied lemon zest.",
        price: 12,
        dietary: ["V", "GF"],
        featured: false,
      },
      {
        name: "Affogato al Caffè",
        description:
          "Double shot of hot espresso poured over a scoop of house-made vanilla gelato.",
        price: 10,
        dietary: ["V", "GF"],
        featured: false,
      },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    items: [
      {
        name: "Aperol Spritz",
        description:
          "The classic Italian aperitivo — Aperol, Prosecco, and a splash of soda with an orange slice.",
        price: 14,
        dietary: ["V", "VG", "GF"],
        featured: false,
      },
      {
        name: "Negroni",
        description:
          "Equal parts gin, Campari, and sweet vermouth, stirred and served over a large ice cube.",
        price: 16,
        dietary: ["V", "VG", "GF"],
        featured: false,
      },
      {
        name: "Limonata Fresca",
        description:
          "House-made sparkling lemonade with fresh mint and a hint of elderflower.",
        price: 8,
        dietary: ["V", "VG", "GF"],
        featured: false,
      },
      {
        name: "Espresso Martini",
        description:
          "Freshly pulled espresso shaken with vodka, coffee liqueur, and a touch of vanilla.",
        price: 18,
        dietary: ["V", "VG", "GF"],
        featured: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DietaryBadge({ tag }: { tag: MenuItem["dietary"][number] }) {
  const config: Record<
    MenuItem["dietary"][number],
    { label: string; bg: string; text: string; icon?: React.ReactNode }
  > = {
    V: {
      label: "Vegetarian",
      bg: "bg-green-900/60",
      text: "text-green-300",
      icon: <Leaf className="h-3 w-3" />,
    },
    VG: {
      label: "Vegan",
      bg: "bg-emerald-900/60",
      text: "text-emerald-300",
      icon: <Leaf className="h-3 w-3" />,
    },
    GF: {
      label: "Gluten Free",
      bg: "bg-amber-900/60",
      text: "text-amber-300",
      icon: <Wheat className="h-3 w-3" />,
    },
    spicy: {
      label: "Spicy",
      bg: "bg-red-900/60",
      text: "text-red-400",
      icon: <Flame className="h-3 w-3" />,
    },
  };

  const c = config[tag];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${c.bg} ${c.text}`}
      title={c.label}
      aria-label={c.label}
    >
      {c.icon}
      {tag === "spicy" ? "Spicy" : tag}
    </span>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <article
      className={`group relative rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-900/10 ${
        item.featured
          ? "border-amber-700/60 bg-gradient-to-br from-amber-950/40 to-stone-900/80"
          : "border-stone-800 bg-stone-900/60 hover:border-stone-700"
      }`}
    >
      {/* Chef's Special badge */}
      {item.featured && (
        <div className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-amber-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-100 shadow-md">
          <ChefHat className="h-3.5 w-3.5" />
          Chef&apos;s Special
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h3 className="font-serif text-lg font-semibold text-stone-100 transition-colors group-hover:text-amber-300">
            {item.name}
          </h3>
          <p className="text-sm leading-relaxed text-stone-400">
            {item.description}
          </p>
          {item.dietary.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.dietary.map((tag) => (
                <DietaryBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>
        <span className="shrink-0 font-serif text-xl font-bold text-amber-400">
          ${item.price}
        </span>
      </div>
    </article>
  );
}

function CategoryNav({
  categories,
  activeId,
  onSelect,
}: {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const navRef = useRef<HTMLDivElement>(null);

  // Keep the active pill scrolled into view
  useEffect(() => {
    if (!navRef.current) return;
    const activeBtn = navRef.current.querySelector(
      `[data-category="${activeId}"]`
    );
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeId]);

  return (
    <nav
      ref={navRef}
      aria-label="Menu categories"
      className="no-scrollbar flex gap-2 overflow-x-auto px-1 py-2"
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            data-category={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-amber-700 text-amber-50 shadow-md shadow-amber-900/30"
                : "bg-stone-800/80 text-stone-400 hover:bg-stone-700 hover:text-stone-200"
            }`}
            aria-current={isActive ? "true" : undefined}
          >
            {cat.label}
          </button>
        );
      })}
    </nav>
  );
}

function HeroDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-amber-700/60" />
      <span className="text-amber-600 opacity-60">&#10045;</span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-amber-700/60" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function RestaurantMenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>(
    CATEGORIES[0].id
  );
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // ---- Intersection Observer for active category tracking ----
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((section, id) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveCategory(id);
          }
        },
        {
          rootMargin: "-20% 0px -60% 0px",
          threshold: 0,
        }
      );
      observer.observe(section);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // ---- Scroll to category section ----
  const scrollToCategory = useCallback((id: string) => {
    const section = sectionRefs.current.get(id);
    if (section) {
      const yOffset = -100; // offset for sticky nav
      const y =
        section.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  // ---- Register section refs ----
  const registerRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) {
        sectionRefs.current.set(id, el);
      } else {
        sectionRefs.current.delete(id);
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      {/* Background pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(217 119 6) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      {/* Hero */}
      <header className="relative overflow-hidden pb-6 pt-16 text-center">
        {/* Warm glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-amber-800/20 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-2xl px-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
            Est. 1987
          </p>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-50 sm:text-5xl md:text-6xl">
            {RESTAURANT_NAME}
          </h1>
          <HeroDivider />
          <p className="mx-auto max-w-md text-base leading-relaxed text-stone-400">
            {RESTAURANT_TAGLINE}
          </p>
        </div>
      </header>

      {/* Sticky Category Nav */}
      <div className="sticky top-0 z-30 border-b border-stone-800/60 bg-stone-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4">
          <CategoryNav
            categories={CATEGORIES}
            activeId={activeCategory}
            onSelect={scrollToCategory}
          />
        </div>
      </div>

      {/* Menu Sections */}
      <main className="relative mx-auto max-w-4xl px-4 pb-24 pt-8">
        {CATEGORIES.map((category) => (
          <section
            key={category.id}
            ref={registerRef(category.id)}
            id={`menu-${category.id}`}
            aria-labelledby={`heading-${category.id}`}
            className="mb-14"
          >
            <h2
              id={`heading-${category.id}`}
              className="mb-6 border-b border-stone-800 pb-3 font-serif text-2xl font-bold text-stone-100"
            >
              {category.label}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {category.items.map((item) => (
                <MenuCard key={item.name} item={item} />
              ))}
            </div>
          </section>
        ))}

        {/* Footer note */}
        <footer className="mt-16 border-t border-stone-800 pt-8 text-center">
          <p className="text-xs leading-relaxed text-stone-500">
            Please inform your server of any allergies or dietary requirements.
            <br />
            All prices are in USD and include applicable taxes.
            <br />A discretionary service charge of 18% is added for parties of
            six or more.
          </p>
        </footer>
      </main>

      {/* Hide scrollbar on nav */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

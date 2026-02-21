import { UtensilsCrossed } from "lucide-react";
import type { MenuItem } from "@/types";

export function DishCard({ item }: { item: MenuItem }) {
  const isVegetarian = item.tags?.includes("vegetarian");

  return (
    <div className="rounded-lg overflow-hidden border bg-card hover:shadow-lg transition-shadow">
      {/* Image placeholder */}
      <div className="relative h-48 bg-muted flex items-center justify-center">
        <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" />
        {isVegetarian && (
          <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
            Vegetarian
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Name and price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{item.name}</h3>
          <span className="text-primary font-serif font-bold text-lg">
            ${item.price}
          </span>
        </div>

        {/* Category badge */}
        <div>
          <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 capitalize">
            {item.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>

        {/* Calories */}
        {item.calories && (
          <p className="text-xs text-muted-foreground">{item.calories} kcal</p>
        )}
      </div>
    </div>
  );
}

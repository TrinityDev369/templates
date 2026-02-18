"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Review } from "./types";

interface ReviewListProps {
  reviews: Review[];
  onWriteReview?: () => void;
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews, onWriteReview }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="space-y-4 py-4 text-center">
        <p className="text-muted-foreground">No reviews yet. Be the first!</p>
        <Button variant="outline" onClick={onWriteReview}>
          Write a Review
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, i) => (
        <div key={review.id}>
          {i > 0 && <Separator className="mb-4" />}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ReviewStars rating={review.rating} />
                <span className="text-sm font-medium">{review.author}</span>
              </div>
              <span className="text-xs text-muted-foreground">{review.date}</span>
            </div>
            <p className="text-sm text-muted-foreground">{review.text}</p>
          </div>
        </div>
      ))}

      <Separator />
      <div className="pt-2">
        <Button variant="outline" onClick={onWriteReview}>
          Write a Review
        </Button>
      </div>
    </div>
  );
}

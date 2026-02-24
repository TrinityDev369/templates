"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MobileNavTriggerProps {
  /** Callback fired when the trigger is pressed. Toggle sidebar open state here. */
  onClick: () => void;
  /** Additional CSS classes applied to the trigger button. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Hamburger menu button that opens the mobile sidebar.
 *
 * Usage:
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <MobileNavTrigger onClick={() => setOpen(true)} />
 * <MobileSidebar open={open} onOpenChange={setOpen} />
 * ```
 */
export function MobileNavTrigger({ onClick, className }: MobileNavTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9 md:hidden", className)}
      onClick={onClick}
      aria-label="Open navigation menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

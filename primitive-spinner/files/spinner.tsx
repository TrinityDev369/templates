import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs:      "h-3 w-3",
      sm:      "h-4 w-4",
      default: "h-6 w-6",
      lg:      "h-8 w-8",
      xl:      "h-12 w-12",
    },
    variant: {
      default: "text-primary",
      muted:   "text-muted-foreground",
      white:   "text-white",
      current: "text-current",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
})

interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, variant, label = "Loading...", ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={cn(spinnerVariants({ size, variant }), className)}
      aria-label={label}
      role="status"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
)
Spinner.displayName = "Spinner"

export { Spinner, spinnerVariants }
export type { SpinnerProps }

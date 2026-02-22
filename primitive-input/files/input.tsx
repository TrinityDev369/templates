import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leadingIcon, trailingIcon, error = false, ...props }, ref) => {
    const baseClass = cn(
      "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      error ? "border-destructive focus-visible:ring-destructive" : "border-input",
      leadingIcon && "pl-9",
      trailingIcon && "pr-9",
      className
    )

    if (leadingIcon || trailingIcon) {
      return (
        <div className="relative flex items-center">
          {leadingIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
              {leadingIcon}
            </div>
          )}
          <input
            type={type}
            className={baseClass}
            ref={ref}
            aria-invalid={error}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute right-3 flex items-center text-muted-foreground">
              {trailingIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={baseClass}
        ref={ref}
        aria-invalid={error}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

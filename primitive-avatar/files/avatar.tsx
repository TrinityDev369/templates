"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

type AvatarSize = "xs" | "sm" | "default" | "lg" | "xl"
type AvatarStatus = "online" | "offline" | "busy" | "away"

const sizeClasses: Record<AvatarSize, string> = {
  xs:      "h-6 w-6",
  sm:      "h-8 w-8",
  default: "h-10 w-10",
  lg:      "h-12 w-12",
  xl:      "h-16 w-16",
}

const dotSizeClasses: Record<AvatarSize, string> = {
  xs:      "h-1.5 w-1.5",
  sm:      "h-2 w-2",
  default: "h-2.5 w-2.5",
  lg:      "h-2.5 w-2.5",
  xl:      "h-3 w-3",
}

const statusColors: Record<AvatarStatus, string> = {
  online:  "bg-emerald-500",
  offline: "bg-gray-400",
  busy:    "bg-red-500",
  away:    "bg-amber-400",
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    status?: AvatarStatus
    size?: AvatarSize
  }
>(({ className, status, size = "default", ...props }, ref) => (
  <div className="relative inline-flex">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn("relative flex shrink-0 overflow-hidden rounded-full", sizeClasses[size], className)}
      {...props}
    />
    {status && (
      <span
        className={cn(
          "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
          dotSizeClasses[size],
          statusColors[status]
        )}
        aria-label={status}
      />
    )}
  </div>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  className?: string
}

function AvatarGroup({ children, max, className }: AvatarGroupProps) {
  const childArray = React.Children.toArray(children)
  const shown = max ? childArray.slice(0, max) : childArray
  const overflow = max && childArray.length > max ? childArray.length - max : 0

  return (
    <div className={cn("flex -space-x-2", className)}>
      {shown.map((child, i) => (
        <div key={i} className="ring-2 ring-background rounded-full">
          {child}
        </div>
      ))}
      {overflow > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-background bg-muted text-muted-foreground text-xs font-medium">
          +{overflow}
        </div>
      )}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup }

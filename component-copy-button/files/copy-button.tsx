"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CopyButtonProps {
  /** The text content to copy to the clipboard. */
  text: string
  /** Visual variant passed through to the shadcn Button. */
  variant?: "default" | "outline" | "ghost"
  /** Size variant passed through to the shadcn Button. */
  size?: "sm" | "default" | "lg"
  /** Whether to wrap the button in a tooltip showing "Copy" / "Copied!". */
  showTooltip?: boolean
  /** Optional visible label rendered next to the icon. */
  label?: string
  /** Callback fired after a copy attempt with its success status. */
  onCopy?: (success: boolean) => void
  /** Additional class names merged onto the root button element. */
  className?: string
}

const CONFIRMATION_DURATION_MS = 2000

function CopyButton({
  text,
  variant = "ghost",
  size = "default",
  showTooltip = true,
  label,
  onCopy,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up the reset timer on unmount to prevent state updates on
  // an unmounted component.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onCopy?.(true)
    } catch {
      // Clipboard API can fail in non-secure contexts or when denied.
      // Fall back to the legacy execCommand approach.
      try {
        const textarea = document.createElement("textarea")
        textarea.value = text
        textarea.setAttribute("readonly", "")
        textarea.style.position = "absolute"
        textarea.style.left = "-9999px"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
        setCopied(true)
        onCopy?.(true)
      } catch {
        onCopy?.(false)
        return
      }
    }

    // Clear any existing timer so rapid clicks don't leave stale timeouts.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setCopied(false)
      timeoutRef.current = null
    }, CONFIRMATION_DURATION_MS)
  }, [text, onCopy])

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4"

  const button = (
    <Button
      variant={variant}
      size={label ? size : "icon"}
      className={cn(
        "relative",
        !label && size === "sm" && "h-7 w-7",
        !label && size === "default" && "h-8 w-8",
        !label && size === "lg" && "h-10 w-10",
        className
      )}
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      <span className="relative inline-flex items-center justify-center">
        {/* Copy icon — fades out when copied */}
        <Copy
          className={cn(
            iconSize,
            "transition-all duration-200 ease-in-out",
            copied
              ? "scale-0 opacity-0"
              : "scale-100 opacity-100"
          )}
        />
        {/* Check icon — fades in when copied, absolutely positioned to overlap */}
        <Check
          className={cn(
            iconSize,
            "absolute transition-all duration-200 ease-in-out text-emerald-500",
            copied
              ? "scale-100 opacity-100"
              : "scale-0 opacity-0"
          )}
        />
      </span>
      {label && (
        <span className="ml-1.5">{copied ? "Copied!" : label}</span>
      )}
    </Button>
  )

  if (!showTooltip) {
    return button
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Copy"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { CopyButton }
export type { CopyButtonProps }

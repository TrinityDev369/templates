"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Toast as ToastType,
  ToastAction,
  ToastContextValue,
  ToastPosition,
  ToastVariant,
} from "./toast.types";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const ToastContext = createContext<ToastContextValue | null>(null);

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const MAX_VISIBLE = 5;

function toastReducer(state: ToastType[], action: ToastAction): ToastType[] {
  switch (action.type) {
    case "ADD_TOAST": {
      const next = [...state, action.toast];
      // Enforce stack limit — keep only the newest MAX_VISIBLE toasts
      if (next.length > MAX_VISIBLE) {
        return next.slice(next.length - MAX_VISIBLE);
      }
      return next;
    }
    case "DISMISS_TOAST":
      return state.filter((t) => t.id !== action.id);
    case "DISMISS_ALL":
      return [];
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Variant config
// ---------------------------------------------------------------------------

const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; className: string; iconClassName: string }
> = {
  success: {
    icon: CheckCircle2,
    className:
      "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
    iconClassName: "text-green-600 dark:text-green-400",
  },
  error: {
    icon: XCircle,
    className:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
    iconClassName: "text-red-600 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
  info: {
    icon: Info,
    className:
      "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
    iconClassName: "text-blue-600 dark:text-blue-400",
  },
};

// ---------------------------------------------------------------------------
// Position classes
// ---------------------------------------------------------------------------

const positionClasses: Record<ToastPosition, string> = {
  "top-right": "top-4 right-4 items-end",
  "top-left": "top-4 left-4 items-start",
  "bottom-right": "bottom-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

// Mobile: override to desktop-specific positioning via sm: breakpoint
const mobilePositionClasses: Record<ToastPosition, string> = {
  "top-right": "sm:top-4 sm:right-4 sm:left-auto sm:items-end",
  "top-left": "sm:top-4 sm:left-4 sm:right-auto sm:items-start",
  "bottom-right": "sm:bottom-4 sm:right-4 sm:left-auto sm:items-end",
  "bottom-left": "sm:bottom-4 sm:left-4 sm:right-auto sm:items-start",
  "top-center":
    "sm:top-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:items-center",
  "bottom-center":
    "sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:items-center",
};

// ---------------------------------------------------------------------------
// Single Toast component
// ---------------------------------------------------------------------------

interface ToastItemProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef<number>(toast.duration ?? 5000);
  const lastTickRef = useRef<number>(Date.now());

  const duration = toast.duration ?? 5000;
  const dismissible = toast.dismissible !== false;
  const config = variantConfig[toast.variant];
  const IconComponent = config.icon;

  // Handle exit animation then dismiss
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    // Wait for animation to complete before removing from state
    setTimeout(() => {
      onDismiss(toast.id);
    }, 200);
  }, [onDismiss, toast.id]);

  // Auto-dismiss timer with pause support
  useEffect(() => {
    if (duration <= 0) return;

    const startTimer = () => {
      lastTickRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastTickRef.current;
        lastTickRef.current = now;

        remainingRef.current -= elapsed;
        const pct = Math.max(0, (remainingRef.current / duration) * 100);
        setProgress(pct);

        if (remainingRef.current <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleDismiss();
        }
      }, 50);
    };

    if (!isPaused) {
      startTimer();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, duration, handleDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "pointer-events-auto relative w-full overflow-hidden rounded-lg border shadow-lg",
        "transition-all duration-200",
        isExiting
          ? "animate-out fade-out slide-out-to-right duration-200"
          : "animate-in slide-in-from-right fade-in duration-300",
        config.className
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <IconComponent
          className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClassName)}
          aria-hidden="true"
        />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold leading-none">{toast.title}</p>
          {toast.description && (
            <p className="text-sm opacity-80">{toast.description}</p>
          )}
          {toast.action && (
            <button
              type="button"
              onClick={toast.action.onClick}
              className={cn(
                "mt-2 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium",
                "ring-1 ring-inset ring-current/20",
                "hover:bg-black/5 dark:hover:bg-white/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              )}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            className={cn(
              "shrink-0 rounded-md p-1",
              "opacity-60 hover:opacity-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "transition-opacity"
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="h-1 w-full bg-black/5 dark:bg-white/10">
          <div
            className={cn(
              "h-full transition-all duration-100 ease-linear",
              toast.variant === "success" && "bg-green-500 dark:bg-green-400",
              toast.variant === "error" && "bg-red-500 dark:bg-red-400",
              toast.variant === "warning" && "bg-amber-500 dark:bg-amber-400",
              toast.variant === "info" && "bg-blue-500 dark:bg-blue-400"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toaster -- renders the stacked toast list
// ---------------------------------------------------------------------------

interface ToasterProps {
  position?: ToastPosition;
}

export function Toaster({ position = "bottom-right" }: ToasterProps) {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("Toaster must be used within a <ToastProvider>");
  }

  const { toasts, dismiss } = context;

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        // Mobile: fixed full-width at bottom
        "fixed bottom-0 left-0 right-0 z-[100] flex flex-col gap-2 p-4",
        "sm:p-0 sm:max-w-[420px]",
        // Desktop: position-based
        "sm:fixed",
        positionClasses[position],
        mobilePositionClasses[position]
      )}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToastProvider
// ---------------------------------------------------------------------------

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const toast = useCallback((input: Omit<ToastType, "id">): string => {
    const id = generateId();
    const newToast: ToastType = {
      ...input,
      id,
      dismissible: input.dismissible !== false,
    };
    dispatch({ type: "ADD_TOAST", toast: newToast });
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: "DISMISS_TOAST", id });
  }, []);

  const dismissAll = useCallback(() => {
    dispatch({ type: "DISMISS_ALL" });
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({ toasts, toast, dismiss, dismissAll }),
    [toasts, toast, dismiss, dismissAll]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

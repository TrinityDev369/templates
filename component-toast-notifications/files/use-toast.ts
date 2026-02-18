"use client";

import { useContext } from "react";
import { ToastContext } from "./toast";
import type { ToastVariant, Toast } from "./toast.types";

type ToastInput = Omit<Toast, "id">;

type ToastFunction = ((input: ToastInput) => string) & {
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
};

interface UseToastReturn {
  toast: ToastFunction;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

function createVariantHelper(
  baseFn: (input: ToastInput) => string,
  variant: ToastVariant
) {
  return (title: string, description?: string): string => {
    return baseFn({ title, description, variant });
  };
}

export function useToast(): UseToastReturn {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }

  const toastFn = ((input: ToastInput) => {
    return context.toast(input);
  }) as ToastFunction;

  toastFn.success = createVariantHelper(toastFn, "success");
  toastFn.error = createVariantHelper(toastFn, "error");
  toastFn.warning = createVariantHelper(toastFn, "warning");
  toastFn.info = createVariantHelper(toastFn, "info");

  return {
    toast: toastFn,
    dismiss: context.dismiss,
    dismissAll: context.dismissAll,
  };
}

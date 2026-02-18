"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import type { FormFieldConfig } from "./form-builder.types";

/* -- Props ----------------------------------------------------------------- */

export interface FormFieldRendererProps {
  /** Field configuration describing what to render. */
  config: FormFieldConfig;

  /** The react-hook-form instance for the current step. */
  form: UseFormReturn<Record<string, unknown>>;

  /** Whether the field should be disabled (e.g. during submission). */
  disabled?: boolean;
}

/* -- Component ------------------------------------------------------------- */

/**
 * Renders a single form field based on its `FieldType`.
 *
 * Wraps each field in shadcn Form primitives (FormField, FormItem,
 * FormLabel, FormControl, FormDescription, FormMessage) for consistent
 * styling, validation display, and accessibility.
 */
export function FormFieldRenderer({
  config,
  form,
  disabled = false,
}: FormFieldRendererProps) {
  const { name, label, type, placeholder, description, options } = config;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={type === "checkbox" ? "flex flex-row items-start space-x-3 space-y-0" : undefined}
        >
          {/* Checkbox renders label after the control */}
          {type !== "checkbox" && <FormLabel>{label}</FormLabel>}

          <FormControl>
            {type === "text" || type === "email" || type === "password" ? (
              <Input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
              />
            ) : type === "number" ? (
              <Input
                type="number"
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                value={typeof field.value === "number" ? field.value : (field.value ?? "")}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === "" ? "" : Number(val));
                }}
              />
            ) : type === "textarea" ? (
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                rows={4}
                {...field}
                value={typeof field.value === "string" ? field.value : ""}
              />
            ) : type === "select" ? (
              <Select
                onValueChange={field.onChange}
                defaultValue={typeof field.value === "string" ? field.value : undefined}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholder ?? "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                  {(options ?? []).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === "checkbox" ? (
              <Checkbox
                checked={typeof field.value === "boolean" ? field.value : false}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            ) : null}
          </FormControl>

          {/* Checkbox label comes after the control */}
          {type === "checkbox" && (
            <div className="space-y-1 leading-none">
              <FormLabel className="cursor-pointer">{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
            </div>
          )}

          {/* Description and error for non-checkbox fields */}
          {type !== "checkbox" && description && (
            <FormDescription>{description}</FormDescription>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

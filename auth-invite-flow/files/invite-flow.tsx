"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Send, Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  bulkInviteSchema,
  type InviteFormData,
  type InviteFlowProps,
  type RoleOption,
} from "./invite-flow.types";

// ---------------------------------------------------------------------------
// Default role options
// ---------------------------------------------------------------------------

const DEFAULT_ROLES: RoleOption[] = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

// ---------------------------------------------------------------------------
// InviteFlow component
// ---------------------------------------------------------------------------

/**
 * Team member invitation form with dynamic field array.
 *
 * Allows adding up to `maxInvites` email + role rows, validates all fields
 * with zod, and delegates submission to the parent via `onInvite`.
 *
 * @example
 * ```tsx
 * <InviteFlow
 *   onInvite={async (data) => {
 *     await api.sendInvitations(data.invites);
 *   }}
 *   maxInvites={5}
 * />
 * ```
 */
export function InviteFlow({
  onInvite,
  roles,
  maxInvites = 10,
}: InviteFlowProps) {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );

  const roleOptions = roles ?? DEFAULT_ROLES;

  const form = useForm<InviteFormData>({
    resolver: zodResolver(bulkInviteSchema),
    defaultValues: {
      invites: [{ email: "", role: "member" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "invites",
  });

  const isSubmitting = form.formState.isSubmitting;
  const canAddMore = fields.length < maxInvites;

  function handleAddRow() {
    if (canAddMore) {
      append({ email: "", role: "member" });
    }
  }

  function handleRemoveRow(index: number) {
    if (fields.length > 1) {
      remove(index);
    }
  }

  async function handleSubmit(data: InviteFormData) {
    setFormError(null);
    setSuccessMessage(null);
    try {
      await onInvite(data);
      const count = data.invites.length;
      setSuccessMessage(
        `${count} invitation${count === 1 ? "" : "s"} sent successfully!`
      );
      form.reset({ invites: [{ email: "", role: "member" }] });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send invitations. Please try again.";
      setFormError(message);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              Invite Team Members
            </CardTitle>
            <CardDescription className="mt-0.5">
              Send email invitations with role assignments to add people to your
              team.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Success message */}
        {successMessage && (
          <div
            role="status"
            className="mb-4 rounded-md border border-emerald-500/50 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-200"
          >
            {successMessage}
          </div>
        )}

        {/* Form-level error */}
        {formError && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {formError}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Column headers (visible on sm+) */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_160px_40px] sm:gap-3">
              <Label className="text-xs text-muted-foreground">
                Email address
              </Label>
              <Label className="text-xs text-muted-foreground">Role</Label>
              <span />
            </div>

            {/* Dynamic invite rows */}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_160px_40px] sm:items-start sm:gap-3"
                >
                  {/* Email field */}
                  <FormField
                    control={form.control}
                    name={`invites.${index}.email`}
                    render={({ field: emailField }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="sm:sr-only">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="colleague@example.com"
                            autoComplete="email"
                            disabled={isSubmitting}
                            {...emailField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role select */}
                  <FormField
                    control={form.control}
                    name={`invites.${index}.role`}
                    render={({ field: roleField }) => (
                      <FormItem>
                        <FormLabel className="sm:sr-only">Role</FormLabel>
                        <Select
                          onValueChange={roleField.onChange}
                          value={roleField.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full sm:w-[160px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roleOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Remove button */}
                  <div className="flex items-center sm:pt-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveRow(index)}
                      disabled={fields.length <= 1 || isSubmitting}
                      aria-label={`Remove invitation row ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add another button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              disabled={!canAddMore || isSubmitting}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Add another
              {!canAddMore && (
                <span className="ml-1 text-xs text-muted-foreground">
                  (max {maxInvites})
                </span>
              )}
            </Button>

            {/* Invite count indicator */}
            <p className="text-xs text-muted-foreground">
              {fields.length} of {maxInvites} invitations
            </p>
          </form>
        </Form>
      </CardContent>

      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          onClick={form.handleSubmit(handleSubmit)}
        >
          {isSubmitting ? (
            <>
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              Sending invitations...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              Send {fields.length > 1 ? `${fields.length} invitations` : "invitation"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

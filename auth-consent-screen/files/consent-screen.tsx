"use client";

import * as React from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { ConsentScreenProps, OAuthScope, ScopeRisk } from "./consent-screen.types";

/* -------------------------------------------------------------------------- */
/*  Risk-level visual configuration                                           */
/* -------------------------------------------------------------------------- */

const RISK_CONFIG: Record<
  ScopeRisk,
  {
    icon: React.FC<{ className?: string }>;
    badgeClass: string;
    label: string;
  }
> = {
  low: {
    icon: ShieldCheck,
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    label: "Low risk",
  },
  medium: {
    icon: Shield,
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
    label: "Medium risk",
  },
  high: {
    icon: ShieldAlert,
    badgeClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    label: "High risk",
  },
};

/* -------------------------------------------------------------------------- */
/*  ScopeRow                                                                  */
/* -------------------------------------------------------------------------- */

function ScopeRow({ scope }: { scope: OAuthScope }) {
  const config = RISK_CONFIG[scope.risk];
  const IconComponent = config.icon;

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5 shrink-0">
        <IconComponent className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium leading-none">{scope.name}</p>
          <Badge variant="outline" className={config.badgeClass}>
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{scope.description}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ConsentScreen                                                             */
/* -------------------------------------------------------------------------- */

export function ConsentScreen({
  app,
  scopes,
  user,
  onAllow,
  onDeny,
}: ConsentScreenProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const appInitials = app.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasHighRiskScopes = scopes.some((s) => s.risk === "high");

  async function handleAllow() {
    setError(null);
    setIsLoading(true);
    try {
      await onAllow();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Authorization failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        {/* ---- Header ---- */}
        <CardHeader className="text-center">
          {/* App avatar/logo */}
          <div className="mx-auto mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={app.logoUrl} alt={app.name} />
              <AvatarFallback className="text-lg font-semibold">
                {appInitials}
              </AvatarFallback>
            </Avatar>
          </div>

          <CardTitle className="text-xl font-bold tracking-tight">
            {app.name} wants to access your account
          </CardTitle>
          <CardDescription className="mt-1">{app.description}</CardDescription>

          {/* Developer attribution */}
          {app.developerName && (
            <p className="mt-2 text-xs text-muted-foreground">
              Developed by {app.developerName}
            </p>
          )}

          {/* App website link */}
          {app.websiteUrl && (
            <a
              href={app.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {app.websiteUrl.replace(/^https?:\/\//, "")}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardHeader>

        {/* ---- Body ---- */}
        <CardContent className="space-y-5">
          {/* Signed-in user info */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-sm">
              <p className="font-medium">
                Signed in as {user.name}{" "}
                <span className="font-normal text-muted-foreground">
                  ({user.email})
                </span>
              </p>
              <a
                href="#"
                className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Not {user.name}? Sign in with a different account
              </a>
            </div>
          </div>

          {/* High-risk warning */}
          {hasHighRiskScopes && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                This application is requesting access to sensitive permissions.
                Review the scopes below carefully before authorizing.
              </p>
            </div>
          )}

          {/* Scopes header */}
          <div>
            <p className="mb-3 text-sm font-medium">
              This will allow{" "}
              <span className="font-semibold">{app.name}</span> to:
            </p>

            {/* Scope list */}
            <div className="space-y-2">
              {scopes.map((scope) => (
                <ScopeRow key={scope.id} scope={scope} />
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}
        </CardContent>

        {/* ---- Footer ---- */}
        <CardFooter className="flex gap-3 border-t pt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onDeny}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Deny
          </Button>
          <Button
            className="flex-1"
            onClick={handleAllow}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authorizing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Allow
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export type {
  ConsentScreenProps,
  OAuthApp,
  OAuthScope,
  ScopeRisk,
} from "./consent-screen.types";

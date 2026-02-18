"use client";

import { ConsentScreen } from "./consent-screen";
import type { OAuthApp, OAuthScope } from "./consent-screen.types";

/* -------------------------------------------------------------------------- */
/*  Example data — replace with real OAuth parameter parsing                  */
/* -------------------------------------------------------------------------- */

const EXAMPLE_APP: OAuthApp = {
  name: "Acme Dashboard",
  logoUrl: "https://ui-avatars.com/api/?name=Acme&background=6366f1&color=fff&size=128",
  description:
    "Acme Dashboard helps you monitor and manage your projects with real-time analytics and team collaboration tools.",
  websiteUrl: "https://acme.example.com",
  developerName: "Acme Corp",
};

const EXAMPLE_SCOPES: OAuthScope[] = [
  {
    id: "read:profile",
    name: "Read your profile",
    description:
      "View your name, email address, and profile picture.",
    risk: "low",
  },
  {
    id: "read:repos",
    name: "Read your repositories",
    description:
      "List and read the contents of repositories you have access to.",
    risk: "low",
  },
  {
    id: "write:repos",
    name: "Write to your repositories",
    description:
      "Create, update, and delete files in your repositories.",
    risk: "medium",
  },
  {
    id: "admin:org",
    name: "Manage organization settings",
    description:
      "Update organization settings, manage members, and configure billing.",
    risk: "high",
  },
];

const EXAMPLE_USER = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  avatarUrl: "",
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ConsentPage() {
  async function handleAllow() {
    // Simulate authorization delay — replace with your OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // e.g. redirect to: /api/oauth/authorize?code=...
    console.log("Authorization granted");
  }

  function handleDeny() {
    // Redirect back to the requesting app with error=access_denied
    console.log("Authorization denied");
  }

  return (
    <ConsentScreen
      app={EXAMPLE_APP}
      scopes={EXAMPLE_SCOPES}
      user={EXAMPLE_USER}
      onAllow={handleAllow}
      onDeny={handleDeny}
    />
  );
}

"use client"

import * as React from "react"

import { Sidebar } from "@/components/sidebar"
import type { SidebarUser } from "@/components/sidebar-user-menu"
import { DEFAULT_NAVIGATION } from "@/components/sidebar-nav"

/* -------------------------------------------------------------------------- */
/*  Placeholder user — replace with your auth provider                        */
/* -------------------------------------------------------------------------- */

const DEMO_USER: SidebarUser = {
  name: "Jane Cooper",
  email: "jane@example.com",
  avatar: "",
}

/* -------------------------------------------------------------------------- */
/*  Dashboard Layout                                                          */
/* -------------------------------------------------------------------------- */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        navigation={DEFAULT_NAVIGATION}
        user={DEMO_USER}
        appName="Dashboard"
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

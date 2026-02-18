"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Search, ChevronsLeft, LogOut, Settings, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: NavItem[]
}

export interface DashboardUser {
  name: string
  email: string
  avatar?: string
}

interface DashboardShellProps {
  children: React.ReactNode
  navigation: NavItem[]
  user: DashboardUser
}

/* -------------------------------------------------------------------------- */
/*  Sidebar nav link                                                          */
/* -------------------------------------------------------------------------- */

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.title : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sidebar content (shared between desktop fixed + mobile sheet)             */
/* -------------------------------------------------------------------------- */

function SidebarContent({
  navigation,
  collapsed,
}: {
  navigation: NavItem[]
  collapsed: boolean
}) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div
        className={cn(
          "flex h-14 items-center border-b px-4 font-semibold",
          collapsed && "justify-center px-2"
        )}
      >
        {collapsed ? "D" : "Dashboard"}
      </div>
      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </ScrollArea>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Breadcrumbs derived from pathname                                         */
/* -------------------------------------------------------------------------- */

function PathBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/")
          const label = segment.charAt(0).toUpperCase() + segment.slice(1).replaceAll("-", " ")
          const isLast = idx === segments.length - 1
          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/* -------------------------------------------------------------------------- */
/*  DashboardShell                                                            */
/* -------------------------------------------------------------------------- */

export function DashboardShell({ children, navigation, user }: DashboardShellProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)

  /* Command+K shortcut */
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ---- Desktop sidebar ---- */}
      <aside
        className={cn(
          "hidden border-r bg-card transition-all duration-200 md:flex md:flex-col",
          collapsed ? "md:w-16" : "md:w-64"
        )}
      >
        <SidebarContent navigation={navigation} collapsed={collapsed} />
        <Separator />
        <div className={cn("flex items-center p-2", collapsed ? "justify-center" : "justify-end")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronsLeft
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            />
          </Button>
        </div>
      </aside>

      {/* ---- Main area ---- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ---- Top bar ---- */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
          {/* Mobile sidebar trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent navigation={navigation} collapsed={false} />
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs */}
          <div className="hidden md:block">
            <PathBreadcrumbs />
          </div>

          <div className="flex-1" />

          {/* Global search trigger */}
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 text-muted-foreground sm:flex"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Search...</span>
            <kbd className="pointer-events-none ml-2 hidden select-none rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </Button>

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* ---- Command dialog (global search) ---- */}
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem key={item.href} onSelect={() => setCommandOpen(false)}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {/* ---- Content area ---- */}
        <ScrollArea className="flex-1">
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </ScrollArea>
      </div>
    </div>
  )
}

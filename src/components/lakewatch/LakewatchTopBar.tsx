"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DbIcon } from "@/components/ui/db-icon"
import {
  SidebarOpenIcon,
  SidebarClosedIcon,
  GenieCodeIcon,
  ChevronDownIcon,
  MenuIcon,
} from "@/components/icons"
import { cn } from "@/lib/utils"
import { DatabricksLogo } from "@/components/shell/DatabricksLogo"
import { AppSwitcher } from "@/components/shell/AppSwitcher"

interface LakewatchTopBarProps {
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
  onMobileMenuToggle?: () => void
  onToggleGenie?: () => void
  genieOpen?: boolean
  workspace?: string
  userInitial?: string
  className?: string
}

export function LakewatchTopBar({
  sidebarOpen = true,
  onToggleSidebar,
  onMobileMenuToggle,
  onToggleGenie,
  genieOpen = false,
  workspace = "Production",
  userInitial = "J",
  className,
}: LakewatchTopBarProps) {
  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center gap-2 bg-transparent px-3 md:pl-5 md:pr-2",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onMobileMenuToggle}
          aria-label="Open menu"
        >
          <MenuIcon size={16} className="text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden md:flex"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <SidebarOpenIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <SidebarClosedIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Link href="/lakewatch/datasources" className="shrink-0">
          <DatabricksLogo height={18} />
        </Link>
        <span className="hidden h-4 w-px shrink-0 bg-border md:block" aria-hidden />
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-normal leading-4 text-foreground/80">Lakewatch</span>
          <span className="inline-flex h-5 items-center rounded bg-blue-700/60 px-1 text-sm leading-5 text-blue-100">
            Beta
          </span>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" className="hidden gap-1 px-2 font-normal md:flex">
          <span className="text-sm text-foreground">{workspace}</span>
          <ChevronDownIcon size={16} className="text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open Genie"
          onClick={onToggleGenie}
          className={cn("bg-ai-gradient-subtle", genieOpen && "ring-2 ring-primary/20")}
        >
          <DbIcon icon={GenieCodeIcon} color="ai" size={16} />
        </Button>
        <AppSwitcher />
        <Avatar size="sm" className="ml-0.5 cursor-pointer hover:opacity-90">
          <AvatarFallback className="bg-teal-600 text-xs font-semibold text-white">
            {userInitial}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

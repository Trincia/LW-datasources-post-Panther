"use client"

import * as React from "react"
import { LakewatchTopBar } from "./LakewatchTopBar"
import { LakewatchSidebar } from "./LakewatchSidebar"
import { GenieCodePanel } from "@/components/shell/GenieCodePanel"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

type LakewatchNavId = React.ComponentProps<typeof LakewatchSidebar>["activeItem"]

interface LakewatchAppShellProps {
  activeItem?: LakewatchNavId
  workspace?: string
  userInitial?: string
  children: React.ReactNode
  className?: string
  mainClassName?: string
  sidebarOpen?: boolean
  onSidebarOpenChange?: (open: boolean) => void
}

export function LakewatchAppShell({
  activeItem,
  workspace,
  userInitial,
  children,
  className,
  mainClassName,
  sidebarOpen: sidebarOpenProp,
  onSidebarOpenChange,
}: LakewatchAppShellProps) {
  const [sidebarOpenState, setSidebarOpenState] = React.useState(true)
  const sidebarOpen = sidebarOpenProp ?? sidebarOpenState
  const setSidebarOpen = (updater: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof updater === "function" ? updater(sidebarOpen) : updater
    onSidebarOpenChange?.(next)
    if (sidebarOpenProp === undefined) setSidebarOpenState(next)
  }
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [genieOpen, setGenieOpen] = React.useState(false)

  return (
    <div
      className={cn(
        "flex h-dvh flex-col overflow-hidden rounded-md border-b border-l border-r border-grey-700",
        "bg-gradient-to-b from-[#04355d] to-grey-800",
        className
      )}
    >
      <LakewatchTopBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onMobileMenuToggle={() => setMobileOpen((v) => !v)}
        onToggleGenie={() => setGenieOpen((v) => !v)}
        genieOpen={genieOpen}
        workspace={workspace}
        userInitial={userInitial}
      />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[220px] border-r-0 bg-gradient-to-b from-[#04355d] to-grey-800 p-0"
        >
          <LakewatchSidebar open activeItem={activeItem} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 flex-1 flex-row gap-1 overflow-hidden px-1 pb-1 pt-0 md:px-1 md:pb-2">
        <div className="hidden md:contents">
          <LakewatchSidebar open={sidebarOpen} activeItem={activeItem} />
        </div>

        <main
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto rounded-md border border-border bg-background shadow-[var(--shadow-db-sm)]",
            genieOpen ? "mr-0.5" : "mr-0 md:mr-2",
            !sidebarOpen && "md:ml-2",
            mainClassName
          )}
        >
          {children}
        </main>

        {genieOpen ? (
          <GenieCodePanel
            open={genieOpen}
            onClose={() => setGenieOpen(false)}
            className="mb-2 mr-2 rounded-md border border-border"
          />
        ) : null}
      </div>
      <Toaster position="top-right" />
    </div>
  )
}

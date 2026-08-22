"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { DbIcon } from "@/components/ui/db-icon"
import { SegmentedControl, SegmentedItem } from "@/components/ui/segmented-control"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  GridIcon,
  DatasourceNavIcon,
  SchemasNavIcon,
  NormalizersNavIcon,
  DetectionNavIcon,
  GearIcon,
  LakewatchAlertIcon,
  WarningIcon,
  VisibleIcon,
  SearchDataIcon,
  DataIcon,
  BarChartIcon,
  NotebookIcon,
  NewWindowIcon,
  StorefrontIcon,
  GenieCodeIcon,
} from "@/components/icons"

export type LakewatchNavId =
  | "overview"
  | "genie"
  | "marketplace"
  | "datasources"
  | "schemas"
  | "normalizers"
  | "detection"
  | "settings"
  | "security-cases"
  | "system-cases"
  | "observables"
  | "query"

interface LakewatchSidebarProps {
  open?: boolean
  activeItem?: LakewatchNavId
  className?: string
  prototypeVariation?: "p0" | "p1"
  onPrototypeVariationChange?: (variation: "p0" | "p1") => void
  p1Unlocked?: boolean
  onUnlockP1?: (password: string) => boolean
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-6 items-center px-3 py-2">
      <span className="text-hint text-muted-foreground">{children}</span>
    </div>
  )
}

function NavRow({
  href,
  icon: Icon,
  children,
  active,
  useAiIcon,
}: {
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
  active?: boolean
  useAiIcon?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-7 items-center gap-2 rounded px-3 text-sm leading-5 transition-colors",
        active
          ? "bg-primary/10 font-semibold text-primary"
          : "text-foreground hover:bg-muted-foreground/10"
      )}
    >
      {useAiIcon ? (
        <DbIcon icon={GenieCodeIcon} color="ai" size={16} className="shrink-0" />
      ) : (
        <Icon size={16} className={cn("shrink-0 text-muted-foreground", active && "text-primary")} />
      )}
      {children}
    </Link>
  )
}

function LakehouseRow({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex h-8 items-center gap-2 rounded-md px-2 text-sm text-foreground hover:bg-muted-foreground/10"
    >
      <Icon size={16} className="shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <NewWindowIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  )
}

export function LakewatchSidebar({
  open = true,
  activeItem = "datasources",
  className,
  prototypeVariation = "p0",
  onPrototypeVariationChange,
  p1Unlocked = false,
  onUnlockP1,
}: LakewatchSidebarProps) {
  const [passwordOpen, setPasswordOpen] = React.useState(false)
  const [password, setPassword] = React.useState("")
  const [passwordError, setPasswordError] = React.useState(false)

  const handleVariationChange = (value: "p0" | "p1") => {
    if (value === "p1" && !p1Unlocked) {
      setPassword("")
      setPasswordError(false)
      setPasswordOpen(true)
      return
    }
    onPrototypeVariationChange?.(value)
  }

  const submitPassword = () => {
    const ok = onUnlockP1?.(password) ?? false
    if (ok) {
      setPasswordOpen(false)
      setPassword("")
      setPasswordError(false)
      onPrototypeVariationChange?.("p1")
    } else {
      setPasswordError(true)
    }
  }

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden bg-transparent transition-all duration-200",
        open ? "w-[200px]" : "w-0",
        className
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-1.5 py-2">
        <NavRow href="/lakewatch" icon={GridIcon} active={activeItem === "overview"}>
          Overview
        </NavRow>
        <NavRow href="/lakewatch" icon={GenieCodeIcon} useAiIcon active={activeItem === "genie"}>
          Genie
        </NavRow>
        <NavRow
          href="/lakewatch/marketplace"
          icon={StorefrontIcon}
          active={activeItem === "marketplace"}
        >
          Marketplace
        </NavRow>

        <div className="pt-2">
          <SectionLabel>Explore</SectionLabel>
        </div>
        <NavRow href="/lakewatch/query" icon={SearchDataIcon} active={activeItem === "query"}>
          Query
        </NavRow>
        <NavRow
          href="/lakewatch/security-cases"
          icon={LakewatchAlertIcon}
          active={activeItem === "security-cases"}
        >
          Alerts
        </NavRow>
        <NavRow href="/lakewatch/observables" icon={VisibleIcon} active={activeItem === "observables"}>
          Observables
        </NavRow>

        <div className="pt-2">
          <SectionLabel>Configure</SectionLabel>
        </div>
        <NavRow
          href="/lakewatch/detection"
          icon={DetectionNavIcon}
          active={activeItem === "detection"}
        >
          Detection rules
        </NavRow>
        <NavRow
          href="/lakewatch/datasources"
          icon={DatasourceNavIcon}
          active={activeItem === "datasources"}
        >
          Datasources
        </NavRow>
        <NavRow
          href="/lakewatch/schemas"
          icon={SchemasNavIcon}
          active={activeItem === "schemas"}
        >
          Parsers
        </NavRow>
        {prototypeVariation === "p1" ? (
          <NavRow
            href="/lakewatch/normalizers"
            icon={NormalizersNavIcon}
            active={activeItem === "normalizers"}
          >
            Normalizers
          </NavRow>
        ) : null}
        <NavRow
          href="/lakewatch/system-cases"
          icon={WarningIcon}
          active={activeItem === "system-cases"}
        >
          System errors
        </NavRow>

        <div className="px-2 pt-2">
          <div className="flex h-8 items-center px-2 opacity-70">
            <span className="truncate text-hint text-muted-foreground">Lakehouse</span>
          </div>
          <div className="flex flex-col gap-1">
            <LakehouseRow href="/catalog" icon={DataIcon} label="Catalog" />
            <LakehouseRow href="/dashboards" icon={BarChartIcon} label="Dashboards" />
            <LakehouseRow href="/workspace" icon={NotebookIcon} label="Workspace" />
          </div>
        </div>
      </div>
      <div className="shrink-0 px-1.5 pb-1">
        <NavRow href="/lakewatch/settings" icon={GearIcon} active={activeItem === "settings"}>
          Settings
        </NavRow>
      </div>
      <div className="shrink-0 px-3 pb-3 pt-2">
        <SegmentedControl
          value={prototypeVariation}
          onValueChange={(value) => handleVariationChange(value as "p0" | "p1")}
          className="w-full"
        >
          <SegmentedItem value="p0" className="flex-1">
            P0
          </SegmentedItem>
          <SegmentedItem value="p1" className="flex-1">
            P1 (WIP)
          </SegmentedItem>
        </SegmentedControl>
      </div>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="gap-1.5">
            <DialogTitle>Enter password</DialogTitle>
            <DialogDescription>
              The P1 prototype is password protected.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="gap-2">
            <Label htmlFor="p1-password">Password</Label>
            <Input
              id="p1-password"
              type="password"
              autoFocus
              value={password}
              aria-invalid={passwordError}
              onChange={(event) => {
                setPassword(event.target.value)
                setPasswordError(false)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  submitPassword()
                }
              }}
              placeholder="Enter password"
            />
            {passwordError ? (
              <p className="text-hint text-destructive">Incorrect password.</p>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="default" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="primary"
              size="sm"
              disabled={!password}
              onClick={submitPassword}
            >
              Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}

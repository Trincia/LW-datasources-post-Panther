"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { DbIcon } from "@/components/ui/db-icon"
import {
  GridIcon,
  DatasourceNavIcon,
  DetectionNavIcon,
  GearIcon,
  FileDocumentIcon,
  WarningIcon,
  VisibleIcon,
  QueryIcon,
  DataIcon,
  BarChartIcon,
  NotebookIcon,
  NewWindowIcon,
  StorefrontIcon,
  SparkleIcon,
} from "@/components/icons"

export type LakewatchNavId =
  | "overview"
  | "genie"
  | "marketplace"
  | "datasources"
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
        <DbIcon icon={SparkleIcon} color="ai" size={16} className="shrink-0" />
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
}: LakewatchSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-transparent transition-all duration-200",
        open ? "w-[200px]" : "w-0",
        className
      )}
    >
      <div className="flex flex-col gap-1 px-1.5 py-2">
        <NavRow href="/lakewatch" icon={GridIcon} active={activeItem === "overview"}>
          Overview
        </NavRow>
        <NavRow href="/lakewatch" icon={SparkleIcon} useAiIcon active={activeItem === "genie"}>
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
          <SectionLabel>Configure</SectionLabel>
        </div>
        <NavRow
          href="/lakewatch/datasources"
          icon={DatasourceNavIcon}
          active={activeItem === "datasources"}
        >
          Datasources
        </NavRow>
        <NavRow
          href="/lakewatch/detection"
          icon={DetectionNavIcon}
          active={activeItem === "detection"}
        >
          Detection rules
        </NavRow>
        <NavRow href="/lakewatch/settings" icon={GearIcon} active={activeItem === "settings"}>
          Settings
        </NavRow>

        <div className="pt-2">
          <SectionLabel>Explore</SectionLabel>
        </div>
        <NavRow
          href="/lakewatch/security-cases"
          icon={FileDocumentIcon}
          active={activeItem === "security-cases"}
        >
          Security cases
        </NavRow>
        <NavRow
          href="/lakewatch/system-cases"
          icon={WarningIcon}
          active={activeItem === "system-cases"}
        >
          System cases
        </NavRow>
        <NavRow href="/lakewatch/observables" icon={VisibleIcon} active={activeItem === "observables"}>
          Observables
        </NavRow>
        <NavRow href="/lakewatch/query" icon={QueryIcon} active={activeItem === "query"}>
          Query
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
    </aside>
  )
}

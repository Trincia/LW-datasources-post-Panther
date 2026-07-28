"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  UploadIcon,
  NotebookIcon,
  QueryIcon,
  BarChartIcon,
  SparkleRectangleIcon,
  WorkflowsIcon,
  PipelineIcon,
  NotificationIcon,
  BeakerIcon,
  ModelsIcon,
  AppIcon,
  FolderBranchIcon,
  CloudDatabaseIcon,
  CloudModelIcon,
  ChevronRightIcon,
} from "@/components/icons"

// ─── Menu item types ──────────────────────────────────────────────────────────

type MenuItem = {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
}

// ─── Menu config ──────────────────────────────────────────────────────────────

const PRIMARY_ITEMS: MenuItem[] = [
  { id: "notebook",     label: "Notebook",            icon: NotebookIcon },
  { id: "query",        label: "Query",                icon: QueryIcon },
  { id: "dashboard",    label: "Dashboard",            icon: BarChartIcon },
  { id: "genie",        label: "Genie space",          icon: SparkleRectangleIcon },
]

const ENGINEERING_ITEMS: MenuItem[] = [
  { id: "job",          label: "Job",                  icon: WorkflowsIcon },
  { id: "pipeline",     label: "ETL pipeline",         icon: PipelineIcon },
  { id: "alert",        label: "Alert",                icon: NotificationIcon },
]

const ML_ITEMS: MenuItem[] = [
  { id: "experiment",   label: "Experiment",           icon: BeakerIcon },
  { id: "automl",       label: "AutoML experiment",    icon: BeakerIcon },
  { id: "model",        label: "Model",                icon: ModelsIcon },
  { id: "app",          label: "App",                  icon: AppIcon },
]

const MORE_ITEMS: MenuItem[] = [
  { id: "git-folder",   label: "Git folder",           icon: FolderBranchIcon },
  { id: "cluster",      label: "Cluster",              icon: CloudDatabaseIcon },
  { id: "warehouse",    label: "SQL warehouse",        icon: CloudDatabaseIcon },
  { id: "endpoint",     label: "Serving endpoint",     icon: CloudModelIcon },
]

// ─── Row component ────────────────────────────────────────────────────────────

function MenuRow({
  item,
  onClick,
}: {
  item: MenuItem
  onClick?: (id: string) => void
}) {
  return (
    <button
      className="flex w-full items-center gap-1 rounded px-2 py-1 text-left transition-colors hover:bg-[var(--action-default-bg-hover)]"
      onClick={() => onClick?.(item.id)}
    >
      <span className="flex size-6 shrink-0 items-center justify-center py-1">
        <item.icon size={16} className="text-muted-foreground" />
      </span>
      <span className="truncate text-sm text-foreground">{item.label}</span>
    </button>
  )
}

// ─── More submenu ─────────────────────────────────────────────────────────────

function MoreRow({ onItemClick }: { onItemClick?: (id: string) => void }) {
  const [subOpen, setSubOpen] = React.useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setSubOpen(true)}
      onMouseLeave={() => setSubOpen(false)}
    >
      <button className="flex w-full items-center gap-1 rounded px-2 py-1 text-left transition-colors hover:bg-[var(--action-default-bg-hover)]">
        <span className="flex size-6 shrink-0 items-center justify-center" />
        <span className="flex-1 truncate text-sm text-foreground">More</span>
        <ChevronRightIcon size={12} className="shrink-0 text-muted-foreground" />
      </button>

      {subOpen && (
        // Submenu positioned to the right of the parent menu
        <div
          className={cn(
            "absolute left-full top-0 z-50 ml-0.5",
            "w-[200px] rounded border border-border bg-secondary py-1",
            "shadow-[var(--shadow-db-lg)]"
          )}
        >
          {MORE_ITEMS.map((item, i) => (
            <React.Fragment key={item.id}>
              {i === 1 && <Separator className="my-1" />}
              <MenuRow item={item} onClick={onItemClick} />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── NewMenu ──────────────────────────────────────────────────────────────────

interface NewMenuProps {
  onItemClick?: (id: string) => void
  onAddData?: () => void
}

export function NewMenu({ onItemClick, onAddData }: NewMenuProps) {
  return (
    // Figma: w-240px, bg-secondary, border-border, rounded-[4px], py-1, shadow-db-lg
    <div
      className={cn(
        "w-[240px] rounded border border-border bg-secondary py-1",
        "shadow-[var(--shadow-db-lg)]"
      )}
    >
      {/* "Add or upload data" — top action */}
      <div className="px-2 py-1">
        <Button
          variant="default"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onAddData}
        >
          <UploadIcon size={16} className="text-muted-foreground" />
          Add or upload data
        </Button>
      </div>

      <Separator className="my-1" />

      {/* Primary items */}
      <div className="px-1">
        {PRIMARY_ITEMS.map((item) => (
          <MenuRow key={item.id} item={item} onClick={onItemClick} />
        ))}
      </div>

      <Separator className="my-1" />

      {/* Data Engineering items */}
      <div className="px-1">
        {ENGINEERING_ITEMS.map((item) => (
          <MenuRow key={item.id} item={item} onClick={onItemClick} />
        ))}
      </div>

      <Separator className="my-1" />

      {/* Machine Learning items */}
      <div className="px-1">
        {ML_ITEMS.map((item) => (
          <MenuRow key={item.id} item={item} onClick={onItemClick} />
        ))}
      </div>

      <Separator className="my-1" />

      {/* More (with submenu) */}
      <div className="px-1">
        <MoreRow onItemClick={onItemClick} />
      </div>
    </div>
  )
}

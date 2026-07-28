"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FilterPill } from "@/components/ui/filter-pill"
import { Tree, type TreeNode } from "@/components/ui/tree"
import {
  CatalogIcon,
  CatalogGearIcon,
  SchemaIcon,
  TableIcon,
  TableViewIcon,
  FunctionIcon,
  ModelsIcon,
  FolderIcon,
  RefreshIcon,
  PlusIcon,
  FilterIcon,
  SearchIcon,
} from "@/components/icons"

// ─── Tree data ─────────────────────────────────────────────────────────────────

export const CATALOG_TREE: TreeNode[] = [
  {
    id: "recents",
    label: "Recents (10)",
    defaultExpanded: true,
    children: [
      { id: "r-default", label: "default", icon: SchemaIcon },
      {
        id: "r-joy", label: "joy", icon: CatalogIcon, defaultExpanded: true,
        children: [
          { id: "r-e2e_otel_spans", label: "e2e_otel_spans", icon: TableIcon },
        ],
      },
      {
        id: "r-otel", label: "otel", icon: SchemaIcon, defaultExpanded: true,
        children: [
          { id: "r-traces_silver",           label: "traces_silver",           icon: TableIcon     },
          { id: "r-overview_error_timeline", label: "overview_error_timeline", icon: TableViewIcon },
          { id: "r-service_health_5min",     label: "service_health_5min",     icon: TableViewIcon },
          { id: "r-e2e_obs_trace_search",    label: "e2e_obs_trace_search",    icon: ModelsIcon    },
          { id: "r-e2e_obs_trace_agent",     label: "e2e_obs_trace_agent",     icon: ModelsIcon    },
          { id: "r-e2e_otel_logs",           label: "e2e_otel_logs",           icon: TableIcon     },
        ],
      },
    ],
  },
  {
    id: "favorites",
    label: "Favorites (7)",
    defaultExpanded: true,
    children: [
      {
        id: "f-otel", label: "otel", icon: SchemaIcon, defaultExpanded: true,
        children: [
          { id: "f-usage",     label: "usage",          icon: TableIcon    },
          { id: "f-forecast",  label: "forecast_price", icon: FunctionIcon },
          { id: "f-departure", label: "departuredelay", icon: TableIcon    },
        ],
      },
      { id: "f-joy",             label: "joy",             icon: CatalogIcon  },
      { id: "f-add_two_numbers", label: "add_two_numbers", icon: FunctionIcon },
      { id: "f-acme_avo",        label: "acme_avo",        icon: CatalogIcon  },
    ],
  },
  {
    id: "mydata",
    label: "My Data",
    defaultExpanded: true,
    children: [
      { id: "my-files", label: "My Files", icon: FolderIcon },
    ],
  },
]

// ─── Node id → item name map (for navigation) ──────────────────────────────────

const NODE_NAMES: Record<string, string> = {
  "r-e2e_otel_spans":          "e2e_otel_spans",
  "r-traces_silver":           "traces_silver",
  "r-overview_error_timeline": "overview_error_timeline",
  "r-service_health_5min":     "service_health_5min",
  "r-e2e_obs_trace_search":    "e2e_obs_trace_search",
  "r-e2e_obs_trace_agent":     "e2e_obs_trace_agent",
  "r-e2e_otel_logs":           "e2e_otel_logs",
  "f-usage":                   "usage",
  "f-forecast":                "forecast_price",
  "f-departure":               "departuredelay",
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface CatalogPanelProps {
  selectedId?: string
  onSelect?: (id: string) => void
}

export function CatalogPanel({ selectedId, onSelect }: CatalogPanelProps) {
  const router = useRouter()
  const [leftTab,    setLeftTab]    = React.useState<"for-you" | "all">("for-you")
  const [treeSearch, setTreeSearch] = React.useState("")

  function handleSelect(id: string) {
    onSelect?.(id)
    const name = NODE_NAMES[id]
    if (name) {
      router.push(`/catalog/table?name=${encodeURIComponent(name)}`)
    }
  }

  return (
    <div className="w-[264px] shrink-0 flex flex-col border-r border-border overflow-hidden">

      {/* Header */}
      <div className="flex h-10 items-center justify-between px-3 shrink-0">
        <span className="text-sm font-semibold text-foreground">Catalog</span>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-xs" aria-label="Settings">
            <CatalogGearIcon size={14} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Refresh">
            <RefreshIcon size={14} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="New">
            <PlusIcon size={14} className="text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Warehouse status */}
      <div className="flex items-center gap-1.5 px-3 pb-2 shrink-0 min-w-0">
        <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
        <span className="truncate text-xs text-foreground min-w-0">0 - Shared SQL Ware...</span>
        <span className="shrink-0 rounded border border-border px-1 text-[10px] leading-5 text-muted-foreground">Serverless</span>
        <span className="shrink-0 rounded border border-border px-1 text-[10px] leading-5 text-muted-foreground">XL</span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-1 px-2 pb-2 shrink-0">
        <div className="relative flex-1">
          <SearchIcon
            size={12}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="h-7 pl-7 text-xs"
            placeholder="Type to search..."
            value={treeSearch}
            onChange={(e) => setTreeSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon-xs" aria-label="Filter">
          <FilterIcon size={14} className="text-muted-foreground" />
        </Button>
      </div>

      {/* For you / All */}
      <div className="flex items-center gap-2 px-3 pb-2 shrink-0">
        <FilterPill active={leftTab === "for-you"} onClick={() => setLeftTab("for-you")}>
          For you
        </FilterPill>
        <FilterPill active={leftTab === "all"} onClick={() => setLeftTab("all")}>
          All
        </FilterPill>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        <Tree
          nodes={CATALOG_TREE}
          selectedId={selectedId}
          onSelect={handleSelect}
          size="x-small"
        />
      </div>

    </div>
  )
}

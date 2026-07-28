"use client"

import * as React from "react"
import Link from "next/link"
import { AppShell, PageHeader } from "@/components/shell"
import { FilterPill } from "@/components/ui/filter-pill"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CatalogIcon,
  SchemaIcon,
  TableIcon,
  TableViewIcon,
  FunctionIcon,
  ModelsIcon,
  SparkleDoubleFillIcon,
  StarFillIcon,
  ClockIcon,
  ConnectIcon,
  ShareIcon,
  ShieldIcon,
} from "@/components/icons"
import { ChevronDown, Search } from "lucide-react"
import { CatalogPanel } from "./_components/CatalogPanel"

// ─── Types ─────────────────────────────────────────────────────────────────────

type CatalogTab = "suggested" | "favorites" | "recents"
type IconType   = "schema" | "catalog" | "table" | "view" | "function" | "model"

type CatalogItem = {
  id:       string
  name:     string
  path:     string
  reason:   string
  type:     string
  iconType: IconType
}

// ─── Table data ─────────────────────────────────────────────────────────────────

const SUGGESTED: CatalogItem[] = [
  { id: "1",  name: "default",                 path: "joy",         reason: "You view frequently",       type: "Schema",            iconType: "schema"   },
  { id: "2",  name: "joy",                     path: "",            reason: "You view frequently",       type: "Catalog",           iconType: "catalog"  },
  { id: "3",  name: "otel",                    path: "andre",       reason: "Favorite",                  type: "Schema",            iconType: "schema"   },
  { id: "4",  name: "otel",                    path: "joy",         reason: "You view frequently",       type: "Schema",            iconType: "schema"   },
  { id: "5",  name: "e2e_otel_spans",          path: "joy.default", reason: "You viewed · 13 days ago",  type: "Table",             iconType: "table"    },
  { id: "6",  name: "e2e_obs_trace_agent",     path: "joy.default", reason: "You view frequently",       type: "Model",             iconType: "model"    },
  { id: "7",  name: "traces_silver",           path: "joy.default", reason: "You viewed · 18 days ago",  type: "Streaming table",   iconType: "view"     },
  { id: "8",  name: "overview_error_timeline", path: "joy.default", reason: "You viewed · 18 days ago",  type: "Materialized view", iconType: "view"     },
  { id: "9",  name: "e2e_otel_logs",           path: "joy.default", reason: "You view frequently",       type: "Table",             iconType: "table"    },
  { id: "10", name: "service_health_5min",     path: "joy.default", reason: "You viewed · 18 days ago",  type: "Materialized view", iconType: "view"     },
  { id: "11", name: "otel_logs",               path: "andre.otel",  reason: "You view frequently",       type: "Table",             iconType: "table"    },
  { id: "12", name: "e2e_obs_trace_search",    path: "joy.default", reason: "You viewed · 19 days ago",  type: "Model",             iconType: "model"    },
  { id: "13", name: "otel_metrics",            path: "joy.default", reason: "You view frequently",       type: "Table",             iconType: "table"    },
]

const TABLE_DATA: Record<CatalogTab, CatalogItem[]> = {
  suggested: SUGGESTED,
  favorites: SUGGESTED.filter((i) => i.reason === "Favorite" || i.reason === "You view frequently").slice(0, 7),
  recents:   SUGGESTED.slice(0, 8),
}

// ─── Item type icon ─────────────────────────────────────────────────────────────

function ItemIcon({ iconType }: { iconType: IconType }) {
  const cls = "text-muted-foreground shrink-0"
  switch (iconType) {
    case "schema":   return <SchemaIcon    size={16} className={cls} />
    case "catalog":  return <CatalogIcon   size={16} className={cls} />
    case "table":    return <TableIcon     size={16} className={cls} />
    case "view":     return <TableViewIcon size={16} className={cls} />
    case "function": return <FunctionIcon  size={16} className={cls} />
    case "model":    return <ModelsIcon    size={16} className={cls} />
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const [selectedId,  setSelectedId]  = React.useState("r-e2e_otel_spans")
  const [activeTab,   setActiveTab]   = React.useState<CatalogTab>("suggested")
  const [tableFilter, setTableFilter] = React.useState("")

  const items = (TABLE_DATA[activeTab] ?? []).filter(
    (i) =>
      !tableFilter ||
      i.name.toLowerCase().includes(tableFilter.toLowerCase()) ||
      i.path.toLowerCase().includes(tableFilter.toLowerCase())
  )

  return (
    <AppShell activeItem="catalog" workspace="pm-ai-bootcamp" userInitial="J">
      <div className="flex h-full overflow-hidden">

        {/* ── Left catalog panel ─────────────────────────────────────────── */}
        <CatalogPanel selectedId={selectedId} onSelect={setSelectedId} />

        {/* ── Right main content ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Fixed header area */}
          <div className="flex flex-col gap-4 px-6 pt-6 shrink-0">

            {/* Page header */}
            <PageHeader
              title={
                <span className="flex items-center gap-2">
                  <CatalogIcon size={20} className="text-foreground" />
                  Catalog
                </span>
              }
              onOverflow={() => {}}
              actions={
                <>
                  <Button variant="default" size="sm">
                    <ShieldIcon size={14} className="mr-1" />
                    Govern
                  </Button>
                  <Button variant="default" size="sm">
                    <ConnectIcon size={14} className="mr-1" />
                    Connect
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                  <Button variant="default" size="sm">
                    <ShareIcon size={14} className="mr-1" />
                    Share
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                  <Button size="sm">
                    Create
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </>
              }
            />

            {/* Filter pills + search */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FilterPill
                  active={activeTab === "suggested"}
                  icon={<SparkleDoubleFillIcon size={14} />}
                  onClick={() => setActiveTab("suggested")}
                >
                  Suggested
                </FilterPill>
                <FilterPill
                  active={activeTab === "favorites"}
                  icon={<StarFillIcon size={14} />}
                  onClick={() => setActiveTab("favorites")}
                >
                  Favorites
                </FilterPill>
                <FilterPill
                  active={activeTab === "recents"}
                  icon={<ClockIcon size={14} />}
                  onClick={() => setActiveTab("recents")}
                >
                  Recents
                </FilterPill>
              </div>
              <div className="relative w-48">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-8 pl-8"
                  placeholder="Filter"
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_220px_160px] border-b border-border pb-2">
              <span className="text-sm font-semibold text-foreground">Name</span>
              <span className="text-sm font-semibold text-foreground">Reason for suggestion</span>
              <span className="text-sm font-semibold text-foreground">Type</span>
            </div>

          </div>

          {/* Scrollable rows */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {items.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No items found.</p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={`/catalog/table?name=${encodeURIComponent(item.name)}`}
                  className="group grid w-full grid-cols-[1fr_220px_160px] h-12 items-center border-b border-border pl-4 text-left transition-colors hover:bg-secondary"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-4">
                    <ItemIcon iconType={item.iconType} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-primary truncate">{item.name}</span>
                      {item.path && (
                        <span className="text-hint text-muted-foreground truncate">{item.path}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-foreground pr-4">{item.reason}</span>
                  <span className="text-sm text-foreground">{item.type}</span>
                </Link>
              ))
            )}
          </div>

        </div>
      </div>
    </AppShell>
  )
}

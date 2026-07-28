"use client"

import * as React from "react"
import Link from "next/link"
import { AppShell } from "@/components/shell"
import { HeroSearch } from "@/components/ui/hero-search"
import { FilterPill } from "@/components/ui/filter-pill"
import {
  SchemaIcon,
  CatalogIcon,
  FunctionIcon,
  TableIcon,
  StarFillIcon,
  SparkleDoubleFillIcon,
} from "@/components/icons"
import { TrendingUp, Gift } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemType = "Schema" | "Table" | "Function" | "Catalog"

type FeedItem = {
  id: string
  name: string
  path: string
  timeAgo: string
  type: ItemType
}

type FilterTab = {
  id: string
  label: string
  icon: React.ReactNode
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TABS: FilterTab[] = [
  { id: "suggested", label: "Suggested",  icon: <SparkleDoubleFillIcon size={14} /> },
  { id: "favorites", label: "Favorites",  icon: <StarFillIcon size={14} /> },
  { id: "popular",   label: "Popular",    icon: <TrendingUp className="h-[14px] w-[14px]" /> },
  { id: "mosaic-ai", label: "Mosaic AI",  icon: <SparkleDoubleFillIcon size={14} /> },
  { id: "whats-new", label: "What's new", icon: <Gift className="h-[14px] w-[14px]" /> },
]

const FEED_DATA: Record<string, FeedItem[]> = {
  suggested: [
    { id: "1", name: "otel",             path: "andre",               timeAgo: "22 days ago",  type: "Schema"   },
    { id: "2", name: "usage",            path: "system.billing",      timeAgo: "1 year ago",   type: "Table"    },
    { id: "3", name: "forecast_price",   path: "ml.hosted_functions", timeAgo: "1 year ago",   type: "Function" },
    { id: "4", name: "departuredelay",   path: "joy.default",         timeAgo: "1 year ago",   type: "Table"    },
    { id: "5", name: "joy",              path: "",                    timeAgo: "1 year ago",   type: "Catalog"  },
    { id: "6", name: "add_two_numbers",  path: "smurching.default",   timeAgo: "1 year ago",   type: "Function" },
    { id: "7", name: "acme_avo",         path: "",                    timeAgo: "1 year ago",   type: "Catalog"  },
  ],
  favorites: [
    { id: "1", name: "otel",             path: "andre",               timeAgo: "22 days ago",  type: "Schema"   },
    { id: "2", name: "usage",            path: "system.billing",      timeAgo: "1 year ago",   type: "Table"    },
    { id: "3", name: "forecast_price",   path: "ml.hosted_functions", timeAgo: "1 year ago",   type: "Function" },
    { id: "4", name: "departuredelay",   path: "joy.default",         timeAgo: "1 year ago",   type: "Table"    },
    { id: "5", name: "joy",              path: "",                    timeAgo: "1 year ago",   type: "Catalog"  },
    { id: "6", name: "add_two_numbers",  path: "smurching.default",   timeAgo: "1 year ago",   type: "Function" },
    { id: "7", name: "acme_avo",         path: "",                    timeAgo: "1 year ago",   type: "Catalog"  },
  ],
  popular: [
    { id: "1", name: "forecast_price",   path: "ml.hosted_functions", timeAgo: "1 year ago",   type: "Function" },
    { id: "2", name: "departuredelay",   path: "joy.default",         timeAgo: "1 year ago",   type: "Table"    },
    { id: "3", name: "usage",            path: "system.billing",      timeAgo: "2 years ago",  type: "Table"    },
  ],
  "mosaic-ai": [],
  "whats-new":  [],
}

// ─── Item type icon ────────────────────────────────────────────────────────────

function ItemTypeIcon({ type }: { type: ItemType }) {
  const cls = "text-muted-foreground shrink-0"
  switch (type) {
    case "Schema":   return <SchemaIcon   size={16} className={cls} />
    case "Table":    return <TableIcon    size={16} className={cls} />
    case "Function": return <FunctionIcon size={16} className={cls} />
    case "Catalog":  return <CatalogIcon  size={16} className={cls} />
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeTab, setActiveTab] = React.useState("favorites")
  const [search, setSearch]       = React.useState("")

  const items = FEED_DATA[activeTab] ?? []
  const filtered = search
    ? items.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.path.toLowerCase().includes(search.toLowerCase())
      )
    : items

  return (
    <AppShell activeItem="" workspace="pm-ai-bootcamp" userInitial="J">
      <div className="flex flex-col px-8 pt-12 pb-8 gap-8 overflow-y-auto h-full">

        {/* Centered: title + search */}
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-[22px] leading-[28px] font-semibold text-foreground">
            Welcome to Databricks
          </h2>
          <HeroSearch
            className="w-full"
            placeholder="Search data, notebooks, recents, and more..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Left-aligned: filter tabs + list */}
        <div className="flex flex-col gap-4 max-w-[726px] w-full mx-auto">

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map((tab) => (
            <FilterPill
              key={tab.id}
              active={activeTab === tab.id}
              icon={tab.icon}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </FilterPill>
          ))}
        </div>

        {/* Items list */}
        <div className="w-full">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No items found.</p>
          ) : (
            filtered.map((item) => (
              <Link
                key={item.id + item.name}
                href="/catalog"
                className="group flex w-full h-12 items-center gap-3 border-b border-border px-2 text-left hover:bg-secondary transition-colors"
              >
                {/* Type icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary">
                  <ItemTypeIcon type={item.type} />
                </div>

                {/* Name + path */}
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {item.name}
                  </span>
                  {item.path && (
                    <span className="text-hint text-muted-foreground truncate">
                      {item.path}
                    </span>
                  )}
                </div>

                {/* Time */}
                <span className="shrink-0 text-sm text-foreground w-28 text-right">
                  {item.timeAgo}
                </span>

                {/* Type label */}
                <span className="shrink-0 text-sm text-foreground w-20 text-right">
                  {item.type}
                </span>
              </Link>
            ))
          )}
        </div>

        </div>{/* end left-aligned */}

      </div>
    </AppShell>
  )
}

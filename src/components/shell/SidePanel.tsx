"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tree, TreeNode, TreeNodeSize } from "@/components/ui/tree"
import {
  RefreshIcon, OverflowIcon, CloseIcon, FilterIcon,
  HomeIcon, SearchIcon,
} from "@/components/icons"
import { ArrowUpDown } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SidePanelProps {
  /** Breadcrumb path segments shown in the header */
  path?: string[]
  nodes?: TreeNode[]
  selectedId?: string
  onSelect?: (id: string) => void
  onClose?: () => void
  size?: TreeNodeSize
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SidePanel({
  path = ["...", "Home", "erin.yoo@da..."],
  nodes = [],
  selectedId,
  onSelect,
  onClose,
  size = "small",
  className,
}: SidePanelProps) {
  const [search, setSearch] = React.useState("")

  return (
    <div
      className={cn(
        "flex h-full w-[280px] shrink-0 flex-col border-r border-border bg-background",
        className
      )}
    >
      {/* ── Header ── */}
      <div className="flex h-10 items-center gap-1 border-b border-border px-2">
        {/* Path breadcrumb */}
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          <span className="text-xs text-muted-foreground shrink-0">...</span>
          <span className="text-xs text-muted-foreground shrink-0">/</span>
          <HomeIcon size={12} className="shrink-0 text-muted-foreground" />
          {path.slice(1).map((segment, i) => (
            <React.Fragment key={i}>
              <span className="text-xs text-muted-foreground shrink-0">/</span>
              <span className="truncate text-xs text-foreground">{segment}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          <Button variant="ghost" size="icon-xs" aria-label="Refresh">
            <RefreshIcon size={14} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Sort">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="More">
            <OverflowIcon size={14} className="text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Close panel" onClick={onClose}>
            <CloseIcon size={14} className="text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        <div className="relative flex-1">
          <SearchIcon
            size={12}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="h-7 pl-7 text-xs"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon-xs" aria-label="Filter">
          <FilterIcon size={14} className="text-muted-foreground" />
        </Button>
      </div>

      {/* ── File tree ── */}
      <div className="flex-1 overflow-y-auto py-1">
        <Tree
          nodes={nodes}
          selectedId={selectedId}
          onSelect={onSelect}
          size={size}
        />
      </div>
    </div>
  )
}

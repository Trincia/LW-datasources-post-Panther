"use client"

import * as React from "react"
import { AppShell } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DbIcon } from "@/components/ui/db-icon"
import {
  QueryIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  CloseSmallIcon,
  RefreshIcon,
  OverflowIcon,
  FilterIcon,
  GenieCodeIcon,
  CodeIcon,
  ColumnSplitIcon,
  ExpandLessIcon,
  SearchIcon,
  PlayMultipleIcon,
  SparkleIcon,
  DownloadIcon,
  SaveIcon,
  ShareIcon,
  SidebarCollapseIcon,
  SidebarExpandIcon,
} from "@/components/icons"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type QueryTab = {
  id: string
  label: string
}

type QueryFile = {
  id: string
  label: string
}

// ─── Static data ───────────────────────────────────────────────────────────────

const TABS: QueryTab[] = [
  { id: "q1", label: "Query 2026-03-12 22:45:02" },
  { id: "q2", label: "New Query 2026-03-25 23:52:34" },
  { id: "q3", label: "New Query 2026-03-27 14:45:39" },
  { id: "q4", label: "New Query 2026-04-08 10:45:29" },
]

const QUERY_FILES: QueryFile[] = [
  { id: "f1",  label: "New Query 2025-03-21 11:31am" },
  { id: "f2",  label: "New Query 2025-05-21 9:39am" },
  { id: "f3",  label: "New Query 2025-07-01 4:09pm" },
  { id: "f4",  label: "New Query 2025-07-01 4:11pm (1)" },
  { id: "f5",  label: "New Query 2025-07-01 4:11pm" },
  { id: "f6",  label: "New Query 2025-07-01 4:28pm" },
  { id: "f7",  label: "New Query 2025-07-02 4:16pm" },
  { id: "f8",  label: "New Query 2025-07-03 12:56pm" },
  { id: "f9",  label: "New Query 2025-07-03 12:56pm (1)" },
  { id: "f10", label: "New Query 2025-07-03 12:56pm" },
  { id: "f11", label: "New Query 2025-07-14 2:03pm (1)" },
  { id: "f12", label: "New Query 2025-07-14 2:03pm" },
  { id: "f13", label: "New Query 2025-08-11 3:37pm" },
  { id: "f14", label: "New Query 2025-08-25 11:06am" },
  { id: "f15", label: "New Query 2025-08-25 3:07pm" },
  { id: "f16", label: "New Query 2025-09-05 11:50am" },
  { id: "f17", label: "New Query 2025-10-09 2:05pm" },
  { id: "f18", label: "New Query 2025-10-09 2:35pm" },
  { id: "f19", label: "New Query 2025-10-09 2:38pm" },
  { id: "f20", label: "New Query 2025-10-31 2:30pm" },
  { id: "f21", label: "New Query 2026-03-10 16:59:41" },
  { id: "f22", label: "Query 2026-03-12 22:45:02" },
  { id: "f23", label: "New Query 2026-03-25 23:52:34" },
  { id: "f24", label: "New Query 2026-03-27 14:45:39" },
  { id: "f25", label: "New Query 2026-04-08 10:45:29" },
]

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function SqlEditorPage() {
  const [activeTab, setActiveTab]   = React.useState("q4")
  const [treeOpen, setTreeOpen]     = React.useState(true)
  const [search, setSearch]         = React.useState("")
  const [outputOpen, setOutputOpen] = React.useState(true)
  const [selectedFile, setSelectedFile] = React.useState("f25")

  const filtered = search
    ? QUERY_FILES.filter((f) => f.label.toLowerCase().includes(search.toLowerCase()))
    : QUERY_FILES

  return (
    <AppShell activeItem="sql-editor" workspace="Production" userInitial="N" mainClassName="overflow-hidden">
      <div className="flex h-full overflow-hidden">

        {/* ── Left query tree panel ──────────────────────────────────────────── */}
        {treeOpen && (
          <aside className="flex w-[240px] shrink-0 flex-col border-r border-border overflow-hidden bg-background">
            {/* Panel header */}
            <div className="flex h-10 shrink-0 items-center justify-between gap-1 border-b border-border px-2">
              <Button variant="ghost" size="sm" className="gap-1 px-2 text-foreground font-semibold h-7">
                Tree view: ON
                <ChevronDownIcon size={14} className="text-muted-foreground" />
              </Button>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon-xs" aria-label="Refresh" onClick={() => {}}>
                  <RefreshIcon size={14} className="text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon-xs" aria-label="Expand all" onClick={() => {}}>
                  <SidebarExpandIcon size={14} className="text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon-xs" aria-label="More options" onClick={() => {}}>
                  <OverflowIcon size={14} className="text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon-xs" aria-label="Close tree view" onClick={() => setTreeOpen(false)}>
                  <CloseIcon size={14} className="text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Breadcrumb-style location */}
            <div className="flex items-center gap-1 px-3 py-1.5 text-hint text-muted-foreground border-b border-border shrink-0">
              <button
                className="hover:text-primary transition-colors"
                onClick={() => {}}
              >
                ...
              </button>
              <span>/</span>
              <button
                className="flex items-center gap-1 hover:text-primary transition-colors"
                onClick={() => {}}
              >
                <span>Drafts</span>
              </button>
            </div>

            {/* Search */}
            <div className="flex shrink-0 items-center gap-1 px-2 py-2">
              <div className="relative flex-1">
                <SearchIcon size={13} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-7 pl-7 text-xs"
                  placeholder="Type to search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon-xs" aria-label="Filter options">
                <FilterIcon size={14} className="text-muted-foreground" />
              </Button>
            </div>

            {/* Query file list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.map((file) => (
                <button
                  key={file.id}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors",
                    file.id === selectedFile
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-secondary"
                  )}
                  onClick={() => setSelectedFile(file.id)}
                >
                  <QueryIcon size={14} className={cn("shrink-0", file.id === selectedFile ? "text-primary" : "text-muted-foreground")} />
                  <span className="truncate">{file.label}</span>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* ── Right editor area ──────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">

          {/* Tab bar */}
          <div className="flex h-9 shrink-0 items-stretch border-b border-border bg-background overflow-x-auto">
            {/* Tree toggle (when closed) */}
            {!treeOpen && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="shrink-0 mx-1 self-center"
                aria-label="Open tree view"
                onClick={() => setTreeOpen(true)}
              >
                <SidebarCollapseIcon size={14} className="text-muted-foreground" />
              </Button>
            )}
            <div className="flex flex-1 items-stretch overflow-x-auto">
              {TABS.map((tab) => (
                <div
                  key={tab.id}
                  role="tab"
                  aria-selected={tab.id === activeTab}
                  className={cn(
                    "group flex shrink-0 cursor-pointer items-center gap-1.5 border-r border-border px-3 text-xs transition-colors",
                    tab.id === activeTab
                      ? "bg-background text-foreground font-semibold border-b-2 border-b-primary border-t-0"
                      : "bg-secondary text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <QueryIcon size={12} className="shrink-0 text-muted-foreground" />
                  <span className="max-w-[180px] truncate">{tab.label}</span>
                  {tab.id === activeTab && (
                    <button
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded opacity-60 hover:opacity-100 hover:bg-muted"
                      aria-label="Close tab"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CloseSmallIcon size={12} />
                    </button>
                  )}
                </div>
              ))}
              {/* New tab */}
              <Button
                variant="ghost"
                size="icon-xs"
                className="shrink-0 self-center mx-1"
                aria-label="New query"
              >
                <span className="text-base leading-none text-muted-foreground">+</span>
              </Button>
            </div>
            {/* Right panel toggle */}
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0 self-center mr-2"
              aria-label="Toggle side panel"
            >
              <ColumnSplitIcon size={14} className="text-muted-foreground" />
            </Button>
          </div>

          {/* Editor toolbar */}
          <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border px-3 overflow-x-auto bg-background">
            {/* Run button with dropdown */}
            <Button size="sm" className="shrink-0 gap-1.5 pr-1 h-7">
              <PlayMultipleIcon size={14} />
              <span>Run all (1000)</span>
              <span className="border-l border-primary-foreground/30 pl-1">
                <ChevronDownIcon size={12} />
              </span>
            </Button>

            {/* Catalog / database picker */}
            <Button variant="ghost" size="sm" className="shrink-0 gap-1 px-2 h-7 text-xs font-normal">
              <span className="text-muted-foreground">main</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-foreground">$cataloganddatabasename</span>
              <ChevronDownIcon size={12} className="text-muted-foreground" />
            </Button>

            {/* Warehouse / editor name */}
            <Button variant="ghost" size="sm" className="shrink-0 gap-1 px-2 h-7 text-xs font-normal">
              <span>New SQL editor: ON</span>
              <ChevronDownIcon size={12} className="text-muted-foreground" />
            </Button>

            {/* Star */}
            <Button variant="ghost" size="icon-xs" aria-label="Favorite" className="h-7 w-7">
              <span className="text-muted-foreground text-base leading-none">☆</span>
            </Button>

            {/* Overflow */}
            <Button variant="ghost" size="icon-xs" aria-label="More options" className="h-7 w-7">
              <OverflowIcon size={14} className="text-muted-foreground" />
            </Button>

            <div className="mx-1 h-5 w-px shrink-0 bg-border" />

            {/* Generate AI button */}
            <Button variant="ghost" size="sm" className="shrink-0 gap-1.5 px-2 h-7">
              <DbIcon icon={SparkleIcon} color="ai" size={14} />
              <span className="text-sm">Generate</span>
            </Button>

            {/* Code view toggle */}
            <Button variant="ghost" size="icon-xs" aria-label="Code view" className="h-7 w-7">
              <CodeIcon size={14} className="text-muted-foreground" />
            </Button>

            {/* Split view */}
            <Button variant="ghost" size="icon-xs" aria-label="Split editor" className="h-7 w-7">
              <ColumnSplitIcon size={14} className="text-muted-foreground" />
            </Button>

            {/* Status indicator */}
            <div className="mx-1 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" title="Connected" />

            {/* Schedule */}
            <Button variant="ghost" size="icon-xs" aria-label="Schedule" className="h-7 w-7">
              <SaveIcon size={14} className="text-muted-foreground" />
            </Button>

            {/* Download */}
            <Button variant="ghost" size="icon-xs" aria-label="Download" className="h-7 w-7">
              <DownloadIcon size={14} className="text-muted-foreground" />
            </Button>

            {/* Share */}
            <Button variant="ghost" size="icon-xs" aria-label="Share" className="h-7 w-7">
              <ShareIcon size={14} className="text-muted-foreground" />
            </Button>
          </div>

          {/* Editor + output area — flex column, fills remaining space */}
          <div className="flex flex-1 flex-col overflow-hidden bg-background">

            {/* Code editor mock */}
            <div className="flex flex-1 overflow-auto min-h-0">
              <div className="flex w-full">
                {/* Line numbers */}
                <div className="flex w-10 shrink-0 flex-col items-end px-2 py-3 text-hint text-muted-foreground/50 select-none font-mono">
                  <span>1</span>
                </div>
                {/* Editor body */}
                <div className="flex-1 px-3 py-3 font-mono text-sm text-muted-foreground/60 select-none">
                  <span>Start typing or </span>
                  <span className="text-primary underline cursor-pointer">generate</span>
                  <span> with AI (⌘ + I)...</span>
                  {/* Cursor */}
                  <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
                </div>
              </div>
            </div>

            {/* Add parameter */}
            <div className="shrink-0 border-t border-border px-4 py-2">
              <Button variant="default" size="sm" className="text-xs h-7">
                Add parameter
              </Button>
            </div>

            {/* Output panel */}
            {outputOpen && (
              <div className="flex flex-col border-t border-border" style={{ height: "260px" }}>
                {/* Output header */}
                <div className="flex h-10 shrink-0 items-center border-b border-border px-4">
                  <div className="flex items-center gap-0 border-b-2 border-primary pb-px">
                    <span className="text-sm font-semibold text-foreground">Output</span>
                  </div>
                  <div className="flex items-center gap-0.5 ml-auto">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Collapse output"
                      onClick={() => setOutputOpen(false)}
                    >
                      <ChevronUpIcon size={14} className="text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Close output"
                      onClick={() => setOutputOpen(false)}
                    >
                      <CloseIcon size={14} className="text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                {/* Empty state */}
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
                  {/* Dashed rectangle icon */}
                  <svg width="56" height="48" viewBox="0 0 56 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="1" y="1" width="54" height="46" rx="3" stroke="#C4CDD6" strokeWidth="2" strokeDasharray="6 4" fill="none" />
                  </svg>
                  <p className="text-sm font-semibold text-foreground">No results available</p>
                  <p className="text-hint text-muted-foreground">Run your query to show the results</p>
                </div>
              </div>
            )}

            {/* Collapsed output toggle */}
            {!outputOpen && (
              <div className="flex h-9 shrink-0 items-center border-t border-border px-4">
                <button
                  className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  onClick={() => setOutputOpen(true)}
                >
                  Output
                  <ChevronUpIcon size={14} className="text-muted-foreground rotate-180" />
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </AppShell>
  )
}

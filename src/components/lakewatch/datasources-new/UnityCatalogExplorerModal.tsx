"use client"

import * as React from "react"

import {
  CatalogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  RefreshIcon,
  SchemaIcon,
  SearchIcon,
  TableIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FilterPill } from "@/components/ui/filter-pill"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export const EXISTING_TABLE_LOCATION = "security_lake.structured.crowdstrike_fdr"

const CATALOGS = [
  "dk_apps",
  "group_7_demo",
  "husky_v2",
  "intel",
  "jyuan_test",
  "lw_benchmarking",
  "lw_citadel",
  "lw_db_sentinel",
  "lw_db_sentinel_external",
  "lw_demo_workshop",
  "lakewatch",
  "security_lake",
  "security_logs",
  "system",
] as const

const FEATURED_CATALOGS = ["lakewatch", "security_lake", "security_logs"] as const

const SCHEMAS = [
  "bronze",
  "default",
  "gold",
  "information_schema",
  "internal",
  "presets",
  "silver",
  "structured",
] as const

const TABLES = [
  "crowdstrike_fdr",
  "aws_cloudtrail",
  "github_audit",
  "linux_syslog",
  "microsoft_winevtlog",
  "okta_system_log",
  "slack_access_logs",
  "vpc_flow_logs",
] as const

type PickerLevel = "catalogs" | "schemas" | "tables"
type PickerRow = {
  id: string
  label: string
}

function PickerListRow({
  row,
  level,
  selected,
  onClick,
}: {
  row: PickerRow
  level: PickerLevel
  selected: boolean
  onClick: () => void
}) {
  const Icon =
    level === "catalogs" ? CatalogIcon : level === "schemas" ? SchemaIcon : TableIcon

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className={cn(
        "h-7 w-full justify-start gap-2 px-2 font-normal text-foreground",
        selected && "bg-primary/10 text-primary",
      )}
      onClick={onClick}
    >
      <Icon size={16} className="shrink-0 text-primary" />
      <span className="min-w-0 flex-1 truncate text-left">{row.label}</span>
      {level !== "tables" ? (
        <ChevronRightIcon size={16} className="shrink-0 text-muted-foreground" />
      ) : null}
    </Button>
  )
}

/** Compact Unity Catalog table picker used by the existing-table flow. */
export function UnityCatalogExplorerModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (location: string) => void
}) {
  const [scope, setScope] = React.useState<"for-you" | "all">("all")
  const [query, setQuery] = React.useState("")
  const [selectedCatalog, setSelectedCatalog] = React.useState("")
  const [selectedSchema, setSelectedSchema] = React.useState("")
  const [selectedTable, setSelectedTable] = React.useState("")

  React.useEffect(() => {
    if (!open) {
      setScope("all")
      setQuery("")
      setSelectedCatalog("")
      setSelectedSchema("")
      setSelectedTable("")
    }
  }, [open])

  const level: PickerLevel = selectedSchema
    ? "tables"
    : selectedCatalog
      ? "schemas"
      : "catalogs"

  const rows = React.useMemo<PickerRow[]>(() => {
    const values =
      level === "catalogs"
        ? scope === "for-you"
          ? FEATURED_CATALOGS
          : CATALOGS
        : level === "schemas"
          ? SCHEMAS
          : TABLES

    const normalizedQuery = query.trim().toLowerCase()
    return values
      .filter((value) => !normalizedQuery || value.toLowerCase().includes(normalizedQuery))
      .map((value) => ({ id: value, label: value }))
  }, [level, query, scope])

  const heading =
    level === "catalogs"
      ? "All catalogs"
      : level === "schemas"
        ? `${selectedCatalog} / All schemas`
        : `${selectedCatalog} / ${selectedSchema} / All tables`

  const handleBack = () => {
    setQuery("")
    setSelectedTable("")
    if (level === "tables") {
      setSelectedSchema("")
    } else {
      setSelectedCatalog("")
    }
  }

  const handleRowClick = (row: PickerRow) => {
    setQuery("")
    if (level === "catalogs") {
      setSelectedCatalog(row.id)
    } else if (level === "schemas") {
      setSelectedSchema(row.id)
    } else {
      setSelectedTable(row.id)
    }
  }

  const handleSelect = () => {
    if (!selectedCatalog || !selectedSchema || !selectedTable) return
    onSelect?.(`${selectedCatalog}.${selectedSchema}.${selectedTable}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[min(586px,90vh)] w-[min(1014px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-md p-7 sm:max-w-[calc(100vw-2rem)]"
      >
        <h2 className="shrink-0 text-xl font-semibold leading-7 text-foreground">
          Select a table
        </h2>

        <div className="mt-7 flex shrink-0 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="pr-9 pl-9"
              aria-label={`Search ${level}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-0 right-0 rounded-l-none border-l border-border"
              aria-label="Filter"
            >
              <FilterIcon size={16} className="text-muted-foreground" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh catalogs"
          >
            <RefreshIcon size={16} className="text-muted-foreground" />
          </Button>
        </div>

        <div className="mt-2 flex shrink-0 items-center gap-2">
          <FilterPill active={scope === "for-you"} onClick={() => setScope("for-you")}>
            For you
          </FilterPill>
          <FilterPill active={scope === "all"} onClick={() => setScope("all")}>
            All
          </FilterPill>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="flex h-7 shrink-0 items-center gap-1 px-2">
            {level !== "catalogs" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Go back"
                onClick={handleBack}
              >
                <ChevronLeftIcon size={16} className="text-muted-foreground" />
              </Button>
            ) : null}
            <p className="text-sm text-foreground">{heading}</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="flex flex-col gap-0.5">
              {rows.map((row) => (
                <PickerListRow
                  key={row.id}
                  row={row}
                  level={level}
                  selected={level === "tables" && selectedTable === row.id}
                  onClick={() => handleRowClick(row)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex shrink-0 justify-end gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!selectedTable}
            onClick={handleSelect}
          >
            Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

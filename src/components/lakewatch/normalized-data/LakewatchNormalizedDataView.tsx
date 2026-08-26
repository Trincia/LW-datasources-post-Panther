"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowsUpDownIcon,
  DatasourceNavIcon,
  PlusIcon,
  SearchIcon,
  TableIcon,
} from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DATA_MODELS,
  materializationLabel,
  type Materialization,
} from "@/components/lakewatch/data-models/dataModels"

function DeliveryBadge({ materialization }: { materialization: Materialization }) {
  const variant =
    materialization === "pipeline"
      ? "teal"
      : materialization === "materialized_view"
        ? "purple"
        : "secondary"
  return (
    <Badge variant={variant} className="font-normal">
      {materializationLabel(materialization)}
    </Badge>
  )
}

function SortableHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <TableHead className={`h-10 py-3 font-semibold ${className ?? ""}`}>
      <span className="flex items-center justify-between gap-2">
        {children}
        <ArrowsUpDownIcon size={16} className="text-muted-foreground" aria-hidden />
      </span>
    </TableHead>
  )
}

function SourceSummary({ sources }: { sources: string[] }) {
  const label = `${sources.length} source${sources.length === 1 ? "" : "s"}`
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 font-semibold text-foreground underline-offset-4"
        >
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b border-border px-3 py-2 text-hint font-semibold text-foreground">
          {sources.length} connected datasource{sources.length === 1 ? "" : "s"}
        </div>
        <ul className="max-h-72 overflow-y-auto py-1">
          {sources.map((source) => (
            <li
              key={source}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground"
            >
              <DatasourceNavIcon size={14} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{source}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

/** Data models — OCSF destination tables fed by one or more datasources (P1B). */
export function LakewatchNormalizedDataView() {
  const [query, setQuery] = React.useState("")

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return DATA_MODELS
    return DATA_MODELS.filter(
      (model) =>
        model.name.toLowerCase().includes(q) ||
        model.eventClass.toLowerCase().includes(q) ||
        model.category.toLowerCase().includes(q) ||
        model.table.toLowerCase().includes(q) ||
        model.sources.some((source) => source.toLowerCase().includes(q)) ||
        String(model.classUid).includes(q)
    )
  }, [query])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className={PAGE_TITLE_SEMIBOLD}>Data models</h1>
          <div className="flex shrink-0 items-center gap-4">
            <LakewatchDataControls />
            <Button variant="primary" size="sm" asChild>
              <Link href="/lakewatch/normalized-data/new">
                <PlusIcon size={16} />
                Create
              </Link>
            </Button>
          </div>
        </div>

        <p className="max-w-3xl text-sm text-muted-foreground">
          Data models map one or more datasources into a shared open schema. Each model
          is a governed destination you can query, detect on, and share.
        </p>

        <div className="relative w-[240px]">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter data models"
            aria-label="Filter data models"
            className="pl-9"
          />
        </div>

        <div className="min-h-0 overflow-x-auto">
          <Table className="min-w-[1320px] table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 w-[17%] py-3">Data model</TableHead>
                <TableHead className="h-10 w-[23%] py-3">Purpose</TableHead>
                <TableHead className="h-10 w-[11%] py-3">Type</TableHead>
                <TableHead className="h-10 w-[11%] py-3">Sources</TableHead>
                <TableHead className="h-10 w-[15%] py-3">Destination table</TableHead>
                <SortableHeader className="w-[8%]">Records</SortableHeader>
                <SortableHeader className="w-[7%]">Freshness</SortableHeader>
                <SortableHeader className="w-[8%]">Status</SortableHeader>
                <TableHead className="h-10 w-[9%] py-3" aria-label="Actions" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((model) => (
                <TableRow key={model.id} className="h-16">
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <Link
                        href={`/lakewatch/normalized-data/${encodeURIComponent(model.id)}`}
                        className="w-fit font-semibold text-primary underline underline-offset-4"
                      >
                        {model.name}
                      </Link>
                      <span className="text-hint text-muted-foreground">
                        {model.standard} {model.version} · {model.owner}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 whitespace-normal">
                    <p className="text-hint whitespace-normal text-muted-foreground">
                      {model.purpose}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <DeliveryBadge materialization={model.materialization} />
                  </TableCell>
                  <TableCell className="py-3">
                    <SourceSummary sources={model.sources} />
                  </TableCell>
                  <TableCell className="py-3">
                    <code className="truncate text-hint text-foreground">{model.table}</code>
                  </TableCell>
                  <TableCell className="py-3 text-foreground">{model.records}</TableCell>
                  <TableCell className="py-3 text-foreground">{model.freshness}</TableCell>
                  <TableCell className="py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-[var(--success)]"
                        aria-hidden
                      />
                      <span className="text-foreground">{model.status}</span>
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button variant="default" size="xs" asChild>
                      <Link
                        href={`/lakewatch/normalized-data/${encodeURIComponent(model.id)}/data`}
                      >
                        <TableIcon size={16} />
                        View data
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

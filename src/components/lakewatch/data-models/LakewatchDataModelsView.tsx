"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowsUpDownIcon, PlusIcon, SearchIcon } from "@/components/icons"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const shown = sources.slice(0, 2)
  const remaining = sources.length - shown.length
  return (
    <div className="flex flex-col">
      <span className="font-semibold text-foreground">{sources.length} sources</span>
      <span className="truncate text-hint text-muted-foreground">
        {shown.join(", ")}
        {remaining > 0 ? ` +${remaining} more` : ""}
      </span>
    </div>
  )
}

/** Data models — normalized (OCSF) destination tables fed by one or more datasources. */
export function LakewatchDataModelsView() {
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
            <Button variant="primary" size="sm">
              <PlusIcon size={16} />
              Create
            </Button>
          </div>
        </div>

        <p className="max-w-3xl text-sm text-muted-foreground">
          Normalized data models map one or more datasources into a shared open schema. Each
          model is a governed destination table you can query, detect on, and share.
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
                <TableHead className="h-10 w-[18%] py-3">Data model</TableHead>
                <TableHead className="h-10 w-[13%] py-3">Type</TableHead>
                <TableHead className="h-10 w-[14%] py-3">Event class</TableHead>
                <TableHead className="h-10 w-[12%] py-3">Sources</TableHead>
                <TableHead className="h-10 w-[18%] py-3">Destination table</TableHead>
                <SortableHeader className="w-[10%]">Records</SortableHeader>
                <SortableHeader className="w-[8%]">Freshness</SortableHeader>
                <SortableHeader className="w-[9%]">Status</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((model) => (
                <TableRow key={model.id} className="h-16">
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <Link
                        href={`/lakewatch/data-models/${encodeURIComponent(model.id)}`}
                        className="w-fit font-semibold text-primary underline underline-offset-4"
                      >
                        {model.name}
                      </Link>
                      <span className="text-hint text-muted-foreground">
                        {model.standard} {model.version} · {model.owner}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <DeliveryBadge materialization={model.materialization} />
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground">{model.eventClass}</span>
                      <Badge variant="indigo" className="w-fit font-normal">
                        Class {model.classUid}
                      </Badge>
                    </div>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

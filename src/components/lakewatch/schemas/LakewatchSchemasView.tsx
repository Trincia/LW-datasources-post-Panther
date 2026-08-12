"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import {
  ArrowsUpDownIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SegmentedControl,
  SegmentedItem,
} from "@/components/ui/segmented-control"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  readCustomSchemas,
  type StoredSchemaRow,
} from "@/components/lakewatch/schemas/schemaStorage"
import { buildVersions } from "@/components/lakewatch/schemas/schemaVersions"

type SchemaRow = StoredSchemaRow

const SCHEMAS: SchemaRow[] = [
  {
    name: "AlphaSOC.Alert",
    description: "AlphaSOC Alert (https://alphasoc.com/)",
    managedBy: "Databricks",
    fieldDiscovery: "Enabled",
    datasourceCount: 1,
  },
  {
    name: "Amazon.EKS.Audit",
    description:
      "Kubernetes audit logs provide a record of the individual users, administrator",
    managedBy: "Databricks",
    fieldDiscovery: "Enabled",
    datasourceCount: 4,
  },
  {
    name: "Amazon.EKS.Authenticator",
    description:
      "These logs represent the control plane component that Amazon EKS uses for",
    managedBy: "Databricks",
    fieldDiscovery: "Enabled",
    datasourceCount: 5,
  },
  {
    name: "Anomali.Indicator",
    description: "Indicators of Compromise from Anomali ThreatStream platform",
    managedBy: "Databricks",
    fieldDiscovery: "Disabled",
    datasourceCount: 1,
  },
  {
    name: "Anthropic.Activity",
    description: "Compliance activity log from Anthropic API",
    managedBy: "Databricks",
    fieldDiscovery: "Enabled",
    datasourceCount: 7,
  },
  {
    name: "Anthropic.Claude.Telemetry",
    description:
      "Claude Code/Cowork telemetry events, emitted by the tool. The populated",
    managedBy: "Databricks",
    fieldDiscovery: "Enabled",
    datasourceCount: 3,
  },
  {
    name: "Apache.AccessCombined",
    description: "Apache HTTP server access logs using the 'combined' format",
    managedBy: "Databricks",
    fieldDiscovery: "Enabled",
    datasourceCount: 11,
  },
]

function SortableHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <TableHead className={`h-10 bg-muted/70 font-normal text-muted-foreground ${className ?? ""}`}>
      <span className="flex items-center justify-between gap-2">
        {children}
        <ArrowsUpDownIcon size={16} className="text-muted-foreground" aria-hidden />
      </span>
    </TableHead>
  )
}

function TemplateRow({ schema }: { schema: SchemaRow }) {
  const versions = React.useMemo(() => buildVersions(schema.name), [schema.name])
  const created = versions[0].created

  return (
    <TableRow className="h-14">
      <TableCell>
        <Link
          href={`/lakewatch/schemas/${encodeURIComponent(schema.name)}`}
          className="font-semibold text-foreground hover:text-primary"
        >
          {schema.name}
        </Link>
      </TableCell>
      <TableCell>
        {schema.managedBy === "Databricks" ? (
          <Badge variant="teal">Built-in</Badge>
        ) : (
          <Badge variant="brown">Custom</Badge>
        )}
      </TableCell>
      <TableCell className="text-foreground">{created}</TableCell>
      <TableCell>{schema.managedBy === "Databricks" ? "Databricks" : "You"}</TableCell>
    </TableRow>
  )
}

export function LakewatchSchemasView() {
  const [query, setQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<"all" | "built-in" | "custom">("all")
  const [customSchemas, setCustomSchemas] = React.useState<SchemaRow[]>([])

  React.useEffect(() => {
    setCustomSchemas(readCustomSchemas())

    const url = new URL(window.location.href)
    if (url.searchParams.get("created")) {
      toast.success("New ingestion template successfully added")
      url.searchParams.delete("created")
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`)
    }
  }, [])

  const rows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return [...customSchemas, ...SCHEMAS].filter((schema) => {
      const matchesQuery =
        !normalizedQuery ||
        schema.name.toLowerCase().includes(normalizedQuery) ||
        schema.description.toLowerCase().includes(normalizedQuery)
      const isBuiltIn = schema.managedBy === "Databricks"
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "built-in" && isBuiltIn) ||
        (typeFilter === "custom" && !isBuiltIn)
      return matchesQuery && matchesType
    })
  }, [customSchemas, query, typeFilter])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Ingestion templates</h1>
        <div className="flex shrink-0 items-center gap-3">
          <LakewatchDataControls />
          <Button variant="primary" size="sm" asChild>
            <Link href="/lakewatch/schemas/new">
              <PlusIcon size={16} />
              Create
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="relative w-full max-w-[320px]">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter ingestion templates"
            aria-label="Filter ingestion templates"
            className="pl-9"
          />
        </div>
        <SegmentedControl
          value={typeFilter}
          onValueChange={(value) =>
            setTypeFilter(value as "all" | "built-in" | "custom")
          }
        >
          <SegmentedItem value="all">All</SegmentedItem>
          <SegmentedItem value="built-in">Built-in</SegmentedItem>
          <SegmentedItem value="custom">Custom</SegmentedItem>
        </SegmentedControl>
      </div>

      <div className="mt-4 min-h-0 overflow-x-auto">
        <Table className="min-w-[980px] table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortableHeader className="w-[32%]">Ingestion template Name</SortableHeader>
              <SortableHeader className="w-[16%]">Type</SortableHeader>
              <SortableHeader className="w-[30%]">Latest version date/time</SortableHeader>
              <TableHead className="h-10 w-[22%] bg-muted/70 font-normal text-muted-foreground">
                Creator
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((schema) => (
              <TemplateRow key={schema.name} schema={schema} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

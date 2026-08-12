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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

type TemplateVersion = { version: string; created: string }

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function formatDateTime(date: Date): string {
  const month = MONTH_LABELS[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const ampm = date.getHours() >= 12 ? "PM" : "AM"
  const hour12 = date.getHours() % 12 || 12
  return `${month} ${day}, ${year}, ${hour12}:${minutes} ${ampm}`
}

/**
 * Deterministically builds a version history for a template row (newest first)
 * so each row shows a stable set of versions and matching creation timestamps.
 */
function buildVersions(name: string): TemplateVersion[] {
  const seed = hashString(name)
  const count = 3 + (seed % 3)
  const base = new Date(2026, 7, 6, 9, 0)
  const versions: TemplateVersion[] = []
  for (let i = 0; i < count; i += 1) {
    const versionNumber = count - i
    const daysBack = i * (4 + (seed % 6)) + (seed % 4)
    const hour = 8 + ((seed >> (i + 1)) % 9)
    const minute = (seed * (i + 3)) % 60
    const date = new Date(base)
    date.setDate(date.getDate() - daysBack)
    date.setHours(hour, minute)
    versions.push({ version: `v${versionNumber}`, created: formatDateTime(date) })
  }
  return versions
}

function TemplateRow({ schema }: { schema: SchemaRow }) {
  const versions = React.useMemo(() => buildVersions(schema.name), [schema.name])
  const [selectedVersion, setSelectedVersion] = React.useState(versions[0].version)
  const created =
    versions.find((item) => item.version === selectedVersion)?.created ?? versions[0].created

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
      <TableCell>
        <Select value={selectedVersion} onValueChange={setSelectedVersion}>
          <SelectTrigger className="w-[92px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {versions.map((item) => (
              <SelectItem key={item.version} value={item.version}>
                {item.version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-foreground">{created}</TableCell>
      <TableCell>{schema.managedBy === "Databricks" ? "Databricks" : "You"}</TableCell>
      <TableCell>
        {schema.datasourceCount}{" "}
        {schema.datasourceCount === 1 ? "Datasource" : "Datasources"}
      </TableCell>
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
              <SortableHeader className="w-[22%]">Ingestion template Name</SortableHeader>
              <SortableHeader className="w-[12%]">Type</SortableHeader>
              <SortableHeader className="w-[12%]">Version</SortableHeader>
              <SortableHeader className="w-[20%]">Created time</SortableHeader>
              <TableHead className="h-10 w-[14%] bg-muted/70 font-normal text-muted-foreground">
                Creator
              </TableHead>
              <SortableHeader className="w-[20%]">Used by</SortableHeader>
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

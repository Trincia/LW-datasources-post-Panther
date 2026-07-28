"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { CatalogPanel } from "../_components/CatalogPanel"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  TableIcon, CopyIcon,
  CertifiedFillIcon, DomainsIcon,
  KeyIcon, ColumnIcon,
  CheckCircleFillIcon, OverflowIcon,
  ArrowRightIcon,
} from "@/components/icons"
import { Maximize2, ChevronDown, ChevronLeft, ChevronRight, Sparkles, Expand } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type ColTag = "Sensitive" | "GDPR" | "PII" | string

type Column = {
  name: string
  pk?: boolean
  fk?: boolean
  type: string
  description?: string
  tags?: ColTag[]
}

type LineageNode = {
  label: string
  title: string
  schema?: string
  columns: string[]
  isCurrent?: boolean
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const TABLE = {
  name: "field_operations_st",
  catalog: "main",
  schema: "field_operations",
  owner: "Jocelyn Hickcox",
  dataSource: "Delta",
  queriesL30D: "9.1K",
  lastUpdated: "11 hours ago",
  size: "2.4GiB, 21 files",
  rows: "1.1M",
  tags: ["Agriculture", "Yield", "Geospatial", "Dashboard Ready"],
  qualityLastCommit: "Tue Nov 13 05:32 PM",
}

const COLUMNS: Column[] = [
  { name: "event_id",          pk: true,  type: "string",    description: "Unique identifier for each field operation event.", tags: [] },
  { name: "device_id",         fk: true,  type: "string",    description: "Foreign key to the device registry.", tags: ["Sensitive"] },
  { name: "event_timestamp",              type: "timestamp", description: "UTC timestamp when the event was recorded.", tags: [] },
  { name: "watermark",                    type: "timestamp", description: "Streaming watermark for late-data handling.", tags: [] },
  { name: "field_zone",                   type: "string",    description: "Geographic zone identifier for the field.", tags: [] },
  { name: "crop_type",                    type: "string",    description: "Type of crop monitored at the field site.", tags: [] },
  { name: "fuel_consumed_l",  fk: true,  type: "double",    description: "Fuel consumed in litres during the operation.", tags: ["GDPR"] },
  { name: "machine_hours",                type: "double",    description: "Total machine hours logged for the event.", tags: [] },
  { name: "yield_estimate_kg",            type: "double",    description: "Estimated crop yield in kilograms.", tags: [] },
]

const LINEAGE_NODES: LineageNode[] = [
  {
    label: "Label",
    title: "iot_telemetry_raw",
    schema: "some_path/path",
    columns: ["device_id", "event_timestamp"],
  },
  {
    label: "Table (current)",
    title: "field_operations_st",
    schema: "catalog.schema",
    columns: ["event_id", "device_id", "event_timestamp"],
    isCurrent: true,
  },
  {
    label: "Label",
    title: "yield_analytics_agg",
    schema: "some_path/path",
    columns: ["field_zone", "crop_type"],
  },
]

const FREQUENTLY_JOINED = [
  "iot_telemetry_raw",
  "machine_registry",
  "field_zone_map",
  "crop_yield_summary",
]

const SQL_LINES = [
  "SELECT *",
  "FROM CropYieldSummary",
  "WHERE event_timestamp >= watermark - INTERVAL 15 MINUTES",
  "  AND event_timestamp <= CURRENT_TIMESTAMP;",
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5 text-sm text-foreground">{children}</div>
    </div>
  )
}

function SidebarPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4">
      <span className="text-xs font-semibold text-foreground">{title}</span>
      {children}
    </div>
  )
}

function SectionHeading({
  children,
  actions,
}: {
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-foreground">{children}</span>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  )
}

// Basic SQL keyword highlighting
const SQL_KW = ["SELECT", "FROM", "WHERE", "AND", "OR", "INTERVAL", "CURRENT_TIMESTAMP", "MINUTES", "AS", "JOIN", "ON"]

function SqlLine({ text }: { text: string }) {
  const regex = new RegExp(`\\b(${SQL_KW.join("|")})\\b`, "g")
  const parts: { t: string; kw: boolean }[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: text.slice(last, m.index), kw: false })
    parts.push({ t: m[0], kw: true })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ t: text.slice(last), kw: false })
  return (
    <>
      {parts.map((p, i) =>
        p.kw ? (
          <span key={i} className="text-primary font-semibold">{p.t}</span>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </>
  )
}

function SqlCodeBlock({ label, lines }: { label?: string; lines: string[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-border text-xs">
      {label && (
        <div className="flex items-center justify-between border-b border-border bg-muted px-3 py-1.5">
          <span className="font-mono text-muted-foreground">{label}</span>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon-xs" aria-label="Copy SQL">
              <CopyIcon size={12} className="text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon-xs" aria-label="More options">
              <OverflowIcon size={12} className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      )}
      <pre className="overflow-x-auto bg-background p-3 font-mono leading-5">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="mr-3 w-4 shrink-0 select-none text-right text-muted-foreground/40">
              {i + 1}
            </span>
            <span className="text-foreground">
              <SqlLine text={line} />
            </span>
          </div>
        ))}
      </pre>
    </div>
  )
}

function LineageMiniDiagram({ nodes }: { nodes: LineageNode[] }) {
  return (
    <div className="relative overflow-auto bg-muted/30 p-6">
      <div className="flex items-center justify-center gap-0">
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className="flex shrink-0 items-center">
                <div className="h-px w-6 bg-border" />
                <ArrowRightIcon size={10} className="-ml-px text-muted-foreground" />
              </div>
            )}
            <div
              className={cn(
                "w-44 shrink-0 overflow-hidden rounded border bg-background text-xs",
                node.isCurrent ? "border-primary/50 shadow-sm" : "border-border"
              )}
            >
              {/* Label above */}
              <div className="px-2 pt-2 text-[10px] text-muted-foreground">{node.label}</div>
              {/* Title row */}
              <div className="px-2 pb-1.5">
                <div className="flex items-center gap-1 font-semibold text-foreground">
                  <TableIcon size={10} className="shrink-0 text-muted-foreground" />
                  <span className="truncate">{node.title}</span>
                </div>
                {node.schema && (
                  <span className="ml-[14px] text-[10px] text-muted-foreground">{node.schema}</span>
                )}
              </div>
              {/* Columns */}
              <div className="border-t border-border">
                {node.columns.map((col, j) => (
                  <div key={j} className="flex justify-between px-2 py-0.5 text-[10px] text-foreground">
                    <span className="truncate">{col}</span>
                    <span className="ml-2 text-muted-foreground">type</span>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-6 w-full justify-start px-2 text-[10px] text-primary"
                >
                  Show 10 more columns
                </Button>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-2 right-2 flex gap-0.5">
        <Button variant="default" size="icon-xs" aria-label="Zoom in" className="text-xs font-semibold">
          +
        </Button>
        <Button variant="default" size="icon-xs" aria-label="Zoom out" className="text-xs font-semibold">
          −
        </Button>
        <Button variant="default" size="icon-xs" aria-label="Fullscreen">
          <Maximize2 className="h-3 w-3" />
        </Button>
        <Button variant="default" size="icon-xs" aria-label="Lock">
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CatalogTableContent() {
  const searchParams = useSearchParams()
  const tableName = searchParams.get("name") ?? TABLE.name

  const [activeNav, setActiveNav] = React.useState("catalog")
  const [filterColumns, setFilterColumns] = React.useState("")
  const [page, setPage] = React.useState(1)
  const perPage = 50

  const filteredCols = filterColumns
    ? COLUMNS.filter((c) => c.name.toLowerCase().includes(filterColumns.toLowerCase()))
    : COLUMNS

  return (
    <AppShell activeItem={activeNav} onNavigate={setActiveNav} workspace="Production" userInitial="J">
      <div className="flex h-full overflow-hidden">
      <CatalogPanel selectedId={`r-${tableName}`} />
      <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-4 p-6">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <PageHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/catalog">Catalog</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="#">{TABLE.catalog}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="#">{TABLE.schema}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </BreadcrumbList>
            </Breadcrumb>
          }
          title={
            <>
              <TableIcon size={16} className="mr-2 inline-block align-middle text-muted-foreground" />
              {tableName}
            </>
          }
          titleIcons={
            <Button variant="ghost" size="icon-xs" aria-label="Copy path">
              <CopyIcon size={14} className="text-muted-foreground" />
            </Button>
          }
          starred
          onStarToggle={() => {}}
          onOverflow={() => {}}
          actions={
            <>
              <div className="flex items-center">
                <Button variant="default" size="sm" className="rounded-r-none border-r-0">
                  Open in a dashboard
                </Button>
                <Button variant="default" size="sm" className="rounded-l-none px-1.5">
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
              <div className="flex items-center">
                <Button variant="default" size="sm" className="rounded-r-none border-r-0">
                  Share
                </Button>
                <Button variant="default" size="sm" className="rounded-l-none px-1.5">
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
              <Button size="sm">Create</Button>
            </>
          }
        />

        {/* Certified / Domain meta row */}
        <div className="flex items-center gap-2 -mt-2">
          <Badge variant="teal" className="gap-1">
            <CertifiedFillIcon size={12} />
            Certified
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <DomainsIcon size={12} />
            Domain: Agriculture
          </Badge>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="columns">Columns</TabsTrigger>
            <TabsTrigger value="sample-data">Sample Data</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="lineage">Lineage</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* ── Overview tab ─────────────────────────────────────────── */}
          <TabsContent value="overview" className="mt-4">
            <div className="flex gap-6 items-start">

              {/* ── Left main content ─────────────────────────────── */}
              <div className="flex min-w-0 flex-1 flex-col gap-4">

                {/* ── Description + SQL card ────────────────────── */}
                <div className="overflow-hidden rounded-md border border-border bg-background">

                  {/* Header */}
                  <div className="bg-muted px-4 py-3">
                    <span className="text-sm font-semibold text-foreground">Description</span>
                  </div>

                  {/* Content */}
                  <div className="border-t border-border p-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-3 text-sm text-foreground">
                      <p>
                        production.field_operations.field_operations_st is a real-time streaming table to
                        capture and process live data from field operations. It supports operational insights
                        and analytics by ingesting telemetry data from machinery and IoT devices, ensuring
                        near real-time updates.
                      </p>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">Purpose</span>
                        <p className="text-muted-foreground">
                          This table serves as a central repository for streaming data related to field
                          operations, enabling:
                        </p>
                        <ul className="ml-4 flex flex-col gap-0.5 text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="shrink-0">·</span>
                            <span>
                              <span className="font-semibold text-foreground">Real-Time Monitoring:</span>{" "}
                              Track machine usage, fuel consumption, and operational progress.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="shrink-0">·</span>
                            <span>
                              <span className="font-semibold text-foreground">Timely Analytics:</span>{" "}
                              Perform rolling aggregates, detect anomalies, and generate alerts.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="shrink-0">·</span>
                            <span>
                              <span className="font-semibold text-foreground">Decision Support:</span>{" "}
                              Provide actionable insights to optimize equipment and resource usage.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                  {/* How to filter late data */}
                  <div className="flex flex-col gap-2 border-t border-border pt-4">
                    <span className="text-sm font-semibold text-foreground">How to filter late data</span>
                    <p className="text-sm text-muted-foreground">
                      Query data that falls within a defined lateness threshold using{" "}
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
                        event_timestamp
                      </code>{" "}
                      and watermark configuration.
                    </p>
                    <SqlCodeBlock label="SQL" lines={SQL_LINES} />
                  </div>

                  </div>{/* end content wrapper */}
                </div>

                {/* ── Columns card ──────────────────────────────── */}
                <div className="overflow-hidden rounded-md border border-border bg-background">

                  {/* Header */}
                  <div className="flex items-center justify-between bg-muted px-4 py-3">
                    <span className="text-sm font-semibold text-foreground">Columns</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-xs" aria-label="AI suggestions">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" aria-label="Expand columns">
                        <Expand className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <div className="relative">
                        <ColumnIcon
                          size={12}
                          className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          className="h-7 w-36 pl-6 text-xs"
                          placeholder="Filter columns"
                          value={filterColumns}
                          onChange={(e) => setFilterColumns(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table — edge-to-edge */}
                  <div className="border-t border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Tags</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCols.map((col) => (
                          <TableRow key={col.name} className="group">
                            <TableCell>
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="font-mono text-xs text-foreground">{col.name}</span>
                                {col.pk && (
                                  <Badge variant="lemon" className="gap-0.5 h-4 px-1 text-[10px]">
                                    <KeyIcon size={8} /> PK
                                  </Badge>
                                )}
                                {col.fk && (
                                  <Badge variant="secondary" className="gap-0.5 h-4 px-1 text-[10px]">
                                    <KeyIcon size={8} /> FK
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-foreground">{col.type}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{col.description}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {col.tags?.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant={tag === "Sensitive" ? "coral" : tag === "GDPR" ? "destructive" : "secondary"}
                                    className="text-[10px]"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-border px-4 py-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Previous page"
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        {[1, 2].map((n) => (
                          <Button
                            key={n}
                            variant={page === n ? "default" : "ghost"}
                            size="icon-xs"
                            onClick={() => setPage(n)}
                            className="text-xs"
                          >
                            {n}
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Next page"
                          onClick={() => setPage((p) => p + 1)}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground">{perPage} / page</span>
                    </div>
                  </div>
                </div>

                {/* ── Lineage card ───────────────────────────────── */}
                <div className="overflow-hidden rounded-md border border-border bg-background">
                  <div className="flex items-center justify-between bg-muted px-4 py-3">
                    <span className="text-sm font-semibold text-foreground">Lineage</span>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary">
                      View details
                    </Button>
                  </div>
                  <div className="border-t border-border">
                    <LineageMiniDiagram nodes={LINEAGE_NODES} />
                  </div>
                </div>

              </div>

              {/* ── Right sidebar ──────────────────────────────────── */}
              <div className="flex w-60 shrink-0 flex-col divide-y divide-border">

                {/* About this table */}
                <SidebarPanel title="About this table">
                  <MetaItem label="Owner">{TABLE.owner}</MetaItem>
                  <MetaItem label="Data source">
                    <Badge variant="indigo" className="text-[10px]">{TABLE.dataSource}</Badge>
                  </MetaItem>
                  <MetaItem label="Queries L30D">
                    <span>{TABLE.queriesL30D}</span>
                    <span className="text-muted-foreground/40 font-mono text-xs">~~~</span>
                  </MetaItem>
                  <MetaItem label="Last updated">{TABLE.lastUpdated}</MetaItem>
                  <MetaItem label="Size">{TABLE.size}</MetaItem>
                  <MetaItem label="Rows">{TABLE.rows}</MetaItem>
                </SidebarPanel>

                {/* Quality */}
                <SidebarPanel title="Quality">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircleFillIcon size={12} className="shrink-0 text-[var(--success)]" />
                      <span className="text-sm font-semibold text-foreground">Healthy</span>
                      <span className="text-xs text-muted-foreground">since 8 hours</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Last commit {TABLE.qualityLastCommit}
                    </span>
                    <Button variant="default" size="sm" className="mt-1 w-full">
                      View details
                    </Button>
                  </div>
                </SidebarPanel>

                {/* Tags */}
                <SidebarPanel title="Tags">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="teal" className="gap-1">
                      <CertifiedFillIcon size={12} />
                      Certified
                    </Badge>
                    {TABLE.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </SidebarPanel>

                {/* Frequently joined */}
                <SidebarPanel title="Frequently joined">
                  <div className="flex flex-col gap-1">
                    {FREQUENTLY_JOINED.map((t) => (
                      <Button key={t} variant="ghost" size="sm" className="h-7 justify-start gap-1.5 px-0 hover:bg-transparent">
                        <TableIcon size={12} className="shrink-0 text-muted-foreground" />
                        <span className="text-sm text-primary hover:underline truncate">{t}</span>
                      </Button>
                    ))}
                  </div>
                </SidebarPanel>

              </div>
            </div>
          </TabsContent>

          {/* ── Placeholder tabs ─────────────────────────────────────── */}
          {["columns", "sample-data", "details", "permissions", "history", "lineage", "insights"].map(
            (tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                <div className="rounded-md border border-border bg-background p-6">
                  <p className="text-sm text-muted-foreground capitalize">
                    {tab.replace("-", " ")} content will appear here.
                  </p>
                </div>
              </TabsContent>
            )
          )}
        </Tabs>
      </div>
      </div>{/* scroll wrapper */}
      </div>{/* two-column */}
    </AppShell>
  )
}

export default function CatalogTablePage() {
  return (
    <React.Suspense>
      <CatalogTableContent />
    </React.Suspense>
  )
}

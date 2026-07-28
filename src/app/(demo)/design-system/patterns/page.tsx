"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hint } from "@/components/ui/hint"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty } from "@/components/ui/empty"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogBody, DialogTrigger,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/shell"
import { SearchIcon, FilterIcon, OverflowIcon, DangerIcon } from "@/components/icons"
import { WorkflowsIcon, NotebookIcon, PipelineIcon, DataIcon } from "@/components/icons"
import { AlertCircle, ArrowUpDown, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PatternSection({ id, title, description, children }: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-6">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

// ─── 1. Data Table with Toolbar ───────────────────────────────────────────────

type JobRow = {
  id: string
  name: string
  type: "Job" | "Pipeline" | "Notebook"
  status: "Running" | "Success" | "Failed" | "Pending"
  owner: string
  duration: string
  updated: string
}

const JOB_DATA: JobRow[] = [
  { id: "j1", name: "customer_churn_model", type: "Notebook", status: "Running",  owner: "Joy Xie",       duration: "3m 12s",  updated: "2 min ago"  },
  { id: "j2", name: "etl_pipeline_v2",      type: "Pipeline", status: "Success",  owner: "Alex Rivera",   duration: "8m 44s",  updated: "1 hr ago"   },
  { id: "j3", name: "daily_aggregations",   type: "Job",      status: "Success",  owner: "Jordan Kim",    duration: "12m 02s", updated: "2 hrs ago"  },
  { id: "j4", name: "model_inference_batch",type: "Job",      status: "Failed",   owner: "Sam Nakamura",  duration: "1m 58s",  updated: "3 hrs ago"  },
  { id: "j5", name: "realtime_ingestion",   type: "Pipeline", status: "Pending",  owner: "Morgan Ellis",  duration: "—",       updated: "5 hrs ago"  },
  { id: "j6", name: "feature_store_update", type: "Job",      status: "Success",  owner: "Joy Xie",       duration: "6m 30s",  updated: "6 hrs ago"  },
  { id: "j7", name: "data_quality_checks",  type: "Notebook", status: "Failed",   owner: "Taylor Okonkwo",duration: "45s",     updated: "Yesterday"  },
]

const STATUS_VARIANT: Record<string, string> = {
  Running: "teal",
  Success: "lime",
  Failed:  "destructive",
  Pending: "secondary",
}

function TypeIcon({ type }: { type: JobRow["type"] }) {
  if (type === "Pipeline") return <PipelineIcon size={16} className="text-muted-foreground shrink-0" />
  if (type === "Notebook") return <NotebookIcon size={16} className="text-primary shrink-0" />
  return <WorkflowsIcon size={16} className="text-muted-foreground shrink-0" />
}

function DataTablePattern() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [page, setPage] = React.useState(1)
  const PAGE_SIZE = 5

  const filtered = JOB_DATA.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || r.status === statusFilter
    return matchSearch && matchStatus
  })
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <SearchIcon size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-56 pl-8"
            placeholder="Search runs"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Running">Running</SelectItem>
            <SelectItem value="Success">Success</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="default" size="sm" className="gap-1">
          <FilterIcon size={14} className="text-muted-foreground" />
          Filters
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {selected.size > 0 && (
            <span className="text-hint text-muted-foreground">{selected.size} selected</span>
          )}
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Create job
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={selected.size === paged.length && paged.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) setSelected(new Set(paged.map((r) => r.id)))
                    else setSelected(new Set())
                  }}
                />
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Name <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            ) : paged.map((row) => (
              <TableRow key={row.id} className={cn("group", selected.has(row.id) && "bg-primary/5")}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(row.id)}
                    onCheckedChange={() => toggleSelect(row.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TypeIcon type={row.type} />
                    <Button variant="link" size="sm" className="h-auto p-0">
                      {row.name}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.type}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[row.status] as Parameters<typeof Badge>[0]["variant"]}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.owner}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-hint">{row.duration}</TableCell>
                <TableCell className="text-muted-foreground">{row.updated}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="More options"
                  >
                    <OverflowIcon size={14} className="text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-hint text-muted-foreground">
          {filtered.length} run{filtered.length !== 1 ? "s" : ""}
        </span>
        {totalPages > 1 && (
          <Pagination className="w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }}
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-40" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => { e.preventDefault(); setPage(p) }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? "pointer-events-none opacity-40" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}

// ─── 2. Form Layout ───────────────────────────────────────────────────────────

function FormLayoutPattern() {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [cluster, setCluster] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  const nameError = submitted && !name.trim() ? "Name is required." : ""

  return (
    <div className="max-w-lg">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
        noValidate
      >
        {/* Name */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="pf-name">
              Job name <span className="text-destructive">*</span>
            </Label>
            <Hint>Must be unique within the workspace.</Hint>
          </div>
          <Input
            id="pf-name"
            placeholder="e.g. daily_aggregations"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!nameError}
            className={nameError ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {nameError && (
            <span className="text-hint text-destructive flex items-center gap-1" role="alert">
              <DangerIcon size={12} className="shrink-0" /> {nameError}
            </span>
          )}
        </div>

        {/* Cluster */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="pf-cluster">Cluster</Label>
            <Hint>The cluster this job will run on.</Hint>
          </div>
          <Select value={cluster} onValueChange={setCluster}>
            <SelectTrigger id="pf-cluster">
              <SelectValue placeholder="Select a cluster" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shared">Shared autoscaling (16 DBUs/hr)</SelectItem>
              <SelectItem value="dedicated">Dedicated · 4 workers</SelectItem>
              <SelectItem value="serverless">Serverless</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="pf-desc">Description</Label>
          <Textarea
            id="pf-desc"
            placeholder="Describe what this job does…"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" size="sm">Create job</Button>
          <Button type="button" variant="default" size="sm"
            onClick={() => { setName(""); setDescription(""); setCluster(""); setSubmitted(false) }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

// ─── 3. Dashboard Metric Cards ────────────────────────────────────────────────

type MetricCard = {
  title: string
  value: string
  delta: number
  deltaLabel: string
  badge: string
  badgeVariant: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const METRICS: MetricCard[] = [
  { title: "Total Jobs",      value: "1,284",  delta: +12.4, deltaLabel: "vs last week", badge: "Live",    badgeVariant: "teal",        icon: WorkflowsIcon },
  { title: "Pipelines",       value: "43",     delta: +3.1,  deltaLabel: "vs last week", badge: "Active",  badgeVariant: "lime",        icon: PipelineIcon  },
  { title: "Failed Runs",     value: "7",      delta: -2.1,  deltaLabel: "vs last week", badge: "Alert",   badgeVariant: "destructive", icon: NotebookIcon  },
  { title: "Data Ingested",   value: "8.3 TB", delta: +0.7,  deltaLabel: "vs yesterday", badge: "Healthy", badgeVariant: "secondary",   icon: DataIcon      },
]

function MetricCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {METRICS.map((m) => {
        const up = m.delta >= 0
        return (
          <Card key={m.title} className="flex flex-col gap-4 p-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-hint text-muted-foreground">{m.title}</span>
                <span className="text-2xl font-semibold text-foreground leading-none">{m.value}</span>
              </div>
              <m.icon size={20} className="text-muted-foreground mt-0.5" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-hint">
                {up
                  ? <TrendingUp className="h-3 w-3 text-[var(--success)]" />
                  : <TrendingDown className="h-3 w-3 text-destructive" />
                }
                <span className={up ? "text-[var(--success)]" : "text-destructive"}>
                  {up ? "+" : ""}{m.delta}%
                </span>
                <span className="text-muted-foreground">{m.deltaLabel}</span>
              </div>
              <Badge variant={m.badgeVariant as Parameters<typeof Badge>[0]["variant"]}>
                {m.badge}
              </Badge>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ─── 4. Settings Panel ────────────────────────────────────────────────────────

function SettingsPanel() {
  const [notifications, setNotifications] = React.useState(true)
  const [emailAlerts, setEmailAlerts] = React.useState(false)
  const [autoRetry, setAutoRetry] = React.useState(true)
  const [maxRetries, setMaxRetries] = React.useState("3")
  const [timezone, setTimezone] = React.useState("utc")

  return (
    <div className="max-w-lg flex flex-col gap-0 divide-y divide-border rounded-md border border-border">
      {/* Section: Notifications */}
      <div className="px-5 py-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Notifications</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-foreground">Job status alerts</p>
              <Hint>Notify on run completion and failure.</Hint>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-foreground">Email alerts</p>
              <Hint>Send alerts to your registered email.</Hint>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} disabled={!notifications} />
          </div>
        </div>
      </div>

      {/* Section: Retry */}
      <div className="px-5 py-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Failure handling</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-foreground">Auto-retry on failure</p>
              <Hint>Automatically retry failed runs.</Hint>
            </div>
            <Switch checked={autoRetry} onCheckedChange={setAutoRetry} />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="sp-retries" className="shrink-0 text-sm text-foreground w-24">
              Max retries
            </Label>
            <Select value={maxRetries} onValueChange={setMaxRetries} disabled={!autoRetry}>
              <SelectTrigger id="sp-retries" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["1", "2", "3", "5", "10"].map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section: Schedule */}
      <div className="px-5 py-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Schedule</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor="sp-tz" className="shrink-0 text-sm text-foreground w-24">
            Timezone
          </Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="sp-tz" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utc">UTC</SelectItem>
              <SelectItem value="us_east">US/Eastern (UTC−5)</SelectItem>
              <SelectItem value="us_west">US/Pacific (UTC−8)</SelectItem>
              <SelectItem value="eu_central">Europe/Berlin (UTC+1)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-5 py-3">
        <Button size="sm">Save changes</Button>
        <Button variant="default" size="sm">Reset</Button>
      </div>
    </div>
  )
}

// ─── 5. Empty State ───────────────────────────────────────────────────────────

function EmptyStatePattern() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Generic empty */}
      <div className="rounded-md border border-border py-14 px-6">
        <Empty
          image={<WorkflowsIcon size={64} />}
          title="No jobs yet"
          description="Create your first job to start running workflows."
          action={
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Create job
            </Button>
          }
        />
      </div>

      {/* Filter empty */}
      <div className="rounded-md border border-border py-14 px-6">
        <Empty
          image={<SearchIcon size={64} />}
          title="No results found"
          description="Try adjusting your search or filter criteria."
          action={<Button variant="default" size="sm">Clear filters</Button>}
        />
      </div>
    </div>
  )
}

// ─── 6. Confirm Delete Dialog ─────────────────────────────────────────────────

function ConfirmDeletePattern() {
  const [open, setOpen] = React.useState(false)
  const [confirmed, setConfirmed] = React.useState(false)

  return (
    <div className="flex items-center gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" className="gap-1.5">
            <Trash2 className="h-4 w-4" />
            Delete job
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "daily_aggregations"?</DialogTitle>
            <DialogDescription>
              This will permanently delete the job and all its run history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Active runs will be terminated immediately.
              </AlertDescription>
            </Alert>
          </DialogBody>
          <DialogFooter>
            <Button variant="default" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { setOpen(false); setConfirmed(true) }}
            >
              Delete job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirmed && (
        <span className="text-sm text-muted-foreground">Job deleted (demo only).</span>
      )}
    </div>
  )
}

// ─── 7. Breadcrumb + Page Header ─────────────────────────────────────────────

function PageHeaderPattern() {
  return (
    <div className="rounded-md border border-border p-5">
      <PageHeader
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Workspace</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="#">Jobs &amp; Pipelines</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>daily_aggregations</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        title="daily_aggregations"
        badge={<Badge variant="lime">Active</Badge>}
        description="Runs every day at 02:00 UTC · Cluster: Shared autoscaling"
        actions={
          <>
            <Button variant="ghost" size="icon-sm" aria-label="More options">
              <OverflowIcon size={16} className="text-muted-foreground" />
            </Button>
            <Button variant="default" size="sm">Edit</Button>
            <Button size="sm">Run now</Button>
          </>
        }
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatternsPage() {
  return (
    <div>
      <div className="mb-12">
        <h1 className="text-2xl font-semibold text-foreground">Patterns</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Composed UI patterns ready to copy. Each demo is fully interactive.
        </p>
      </div>

      <PatternSection
        id="data-table"
        title="Data Table with Toolbar"
        description="Search, filter dropdown, multi-select rows, overflow actions, and pagination."
      >
        <DataTablePattern />
      </PatternSection>

      <PatternSection
        id="form-layout"
        title="Form Layout"
        description="Vertical form with validation, helper text, and accessible labels."
      >
        <FormLayoutPattern />
      </PatternSection>

      <PatternSection
        id="metric-cards"
        title="Dashboard Metric Cards"
        description="KPI cards with trend indicator, delta percentage, and status badge."
      >
        <MetricCards />
      </PatternSection>

      <PatternSection
        id="settings-panel"
        title="Settings Panel"
        description="Grouped settings with switches and selects. Disabled state when dependent toggle is off."
      >
        <SettingsPanel />
      </PatternSection>

      <PatternSection
        id="empty-state"
        title="Empty States"
        description="No-content state for lists and filtered views."
      >
        <EmptyStatePattern />
      </PatternSection>

      <PatternSection
        id="confirm-delete"
        title="Confirm Delete Dialog"
        description="Destructive action confirmation with warning alert inside dialog."
      >
        <ConfirmDeletePattern />
      </PatternSection>

      <PatternSection
        id="page-header"
        title="Page Header"
        description="Breadcrumb trail + title + badge + description + action buttons."
      >
        <PageHeaderPattern />
      </PatternSection>
    </div>
  )
}

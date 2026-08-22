"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import {
  ArrowDown,
  ArrowUp,
  Check,
  Columns3,
  History,
  Loader2,
  Lock,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react"

import {
  CalendarRangeIcon,
  ForkIcon,
  InfoSmallIcon,
  NotebookIcon,
  SearchIcon,
  TableIcon,
  UploadIcon,
} from "@/components/icons"
import {
  LakewatchDatasourceLogo,
  type LakewatchDatasourceLogoKind,
} from "@/components/lakewatch/datasources-new/LakewatchDatasourceLogo"
import { CONNECT_SOURCES } from "@/components/lakewatch/datasources-new/LakewatchLakeflowConnectWizardView"
import {
  IntegrationTemplatePanel,
  IntegrationTemplatesField,
  buildParserTemplates,
  useIntegrationTemplates,
} from "@/components/lakewatch/datasources-new/IntegrationTemplatesField"
import {
  DATASOURCE_SCHEMAS,
  DESTINATION_TABLES,
  buildConnectorDestinations,
  buildConnectorSchemas,
  type DatasourceSchemaRow,
} from "@/components/lakewatch/datasources-new/datasourceParsers"
import { DatasourceNormalizeTab } from "@/components/lakewatch/datasources-new/DatasourceNormalizeTab"
import {
  LakewatchWarehouseSelector,
  WarehouseStatusIndicator,
} from "@/components/lakewatch/LakewatchWarehouseSelector"
import { usePrototypeVariation } from "@/lib/usePrototypeVariation"
import { RunAsControl } from "@/components/lakewatch/RunAsControl"
import { buildVersions } from "@/components/lakewatch/schemas/schemaVersions"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { WizardAnnotationsField } from "@/components/lakewatch/datasources-new/LakewatchAwsS3WizardView"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SegmentedControl,
  SegmentedItem,
} from "@/components/ui/segmented-control"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// API connectors that have a dedicated brand logo; others fall back to generic.
const CONNECTOR_LOGO_KINDS: Record<string, LakewatchDatasourceLogoKind> = {
  slack: "slack",
  "1password": "1password",
  okta: "okta",
}

const DATASOURCE_LOGOS: Record<string, LakewatchDatasourceLogoKind> = {
  fluentbit: "fluentbit",
  slack: "slack",
  "cloudtrail-vpc": "cloudtrail",
  okta: "okta",
  "1password": "1password",
}

const CHART_MAX = 95.37
const CHART_VIEW_W = 1000
const CHART_VIEW_H = 110

const CHART_SERIES = [
  {
    label: "AWS VPCFlow",
    color: "#4299E0",
    values: [58, 62, 66, 70, 68, 72, 75, 73, 76, 74, 71, 69, 66],
  },
  {
    label: "AWS S3ServerAccess",
    color: "#3CAA60",
    values: [30, 33, 36, 38, 42, 45, 43, 40, 38, 41, 39, 37, 35],
  },
  {
    label: "AWS ALB",
    color: "#E65B77",
    values: [10, 14, 18, 16, 13, 12, 14, 13, 15, 14, 12, 11, 13],
  },
] as const

function buildSeriesPaths(values: readonly number[], max: number = CHART_MAX) {
  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * CHART_VIEW_W,
    y: CHART_VIEW_H * (1 - value / max),
  }))

  let line = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    line += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  const last = points[points.length - 1]
  const area = `${line} L ${last.x} ${CHART_VIEW_H} L ${points[0].x} ${CHART_VIEW_H} Z`

  return { line, area }
}

const EVENTS_SPARKLINE_MAX = 13
const EVENTS_SPARKLINE = [9.8, 10.2, 9.6, 10.9, 11.4, 10.7, 11.57]
const EVENTS_SERIES = {
  label: "Processed Events",
  color: "#8acaff",
  values: [410, 414, 411, 417, 415, 413, 419, 416, 422, 420, 417, 405, 35],
}

const CHART_DATES = [
  ["04:00", "JUL 21"],
  ["00:00", "JUL 22"],
  ["00:00", "JUL 23"],
  ["00:00", "JUL 24"],
  ["00:00", "JUL 25"],
  ["00:00", "JUL 26"],
  ["00:00", "JUL 27"],
  ["04:00", "JUL 28"],
] as const

type TrendDirection = "up" | "down" | "unchanged"

const TREND_CONFIG: Record<
  TrendDirection,
  { Icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  up: { Icon: ArrowUp, color: "text-[var(--success)]" },
  down: { Icon: ArrowDown, color: "text-destructive" },
  unchanged: { Icon: Minus, color: "text-muted-foreground" },
}

function TrendMetricCard({
  label,
  value,
  unit,
  trend,
  change,
  comparison,
}: {
  label: string
  value: string
  unit: string
  trend: TrendDirection
  change: string
  comparison: string
}) {
  const { Icon, color } = TREND_CONFIG[trend]
  return (
    <div className="rounded bg-muted/70 p-3">
      <div className="flex items-center gap-1">
        <p className="text-sm font-semibold leading-5 text-foreground">{label}</p>
        <InfoSmallIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-1 whitespace-nowrap text-blue-400">
        <span className={cn(PAGE_TITLE_SEMIBOLD, "text-blue-400")}>{value}</span>{" "}
        <span className="text-hint text-foreground">{unit}</span>
      </p>
      <div className="mt-1 flex items-center gap-1 text-hint">
        <span className={cn("flex items-center gap-0.5 font-semibold", color)}>
          <Icon className="h-3.5 w-3.5" />
          {change}
        </span>
        <span className="text-muted-foreground">{comparison}</span>
      </div>
    </div>
  )
}

function EventsSparklineCard() {
  const { line, area } = buildSeriesPaths(EVENTS_SPARKLINE, EVENTS_SPARKLINE_MAX)
  return (
    <div className="flex flex-col rounded bg-muted/70 p-3">
      <div className="flex items-center gap-1">
        <p className="text-sm font-semibold leading-5 text-foreground">
          Events (last 7 days)
        </p>
        <InfoSmallIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
      </div>
      <div className="mt-2 min-h-[44px] flex-1">
        <svg
          className="size-full"
          viewBox={`0 0 ${CHART_VIEW_W} ${CHART_VIEW_H}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="events-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={EVENTS_SERIES.color} stopOpacity={0.22} />
              <stop offset="90%" stopColor={EVENTS_SERIES.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#events-spark-fill)" stroke="none" />
          <path
            d={line}
            fill="none"
            stroke={EVENTS_SERIES.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  )
}

type PermissionValue = "view" | "edit" | "manage"

type PermissionRow = {
  id: string
  name: string
  secondary?: string
  kind: "group" | "user"
  permission: PermissionValue
  removable: boolean
}

const INITIAL_PERMISSION_ROWS: PermissionRow[] = [
  {
    id: "all-users",
    name: "All workspace users",
    kind: "group",
    permission: "view",
    removable: false,
  },
  {
    id: "steve-zhang",
    name: "Steve Zhang",
    secondary: "(steve.zhang@databricks.com)",
    kind: "user",
    permission: "manage",
    removable: true,
  },
  {
    id: "admins",
    name: "Admins",
    kind: "group",
    permission: "manage",
    removable: false,
  },
]

const ADD_PRINCIPAL_OPTIONS = [
  { id: "amir.patel@databricks.com", name: "Amir Patel", kind: "user" as const },
  { id: "jane.lee@databricks.com", name: "Jane Lee", kind: "user" as const },
  { id: "data-engineers", name: "Data Engineers", kind: "group" as const },
  { id: "security-analysts", name: "Security Analysts", kind: "group" as const },
]

function PermissionSelect({
  value,
  onValueChange,
}: {
  value: PermissionValue
  onValueChange: (value: PermissionValue) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as PermissionValue)}>
      <SelectTrigger className="w-[220px]" aria-label="Permission level">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="view">Can View</SelectItem>
        <SelectItem value="edit">Can Edit</SelectItem>
        <SelectItem value="manage">Can Manage</SelectItem>
      </SelectContent>
    </Select>
  )
}

function DatasourcePermissionsDialog({
  datasourceName,
  open,
  onOpenChange,
}: {
  datasourceName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [rows, setRows] = React.useState<PermissionRow[]>(INITIAL_PERMISSION_ROWS)
  const [newPrincipal, setNewPrincipal] = React.useState("")
  const [newPermission, setNewPermission] = React.useState<PermissionValue>("manage")

  // Reset to the seeded state each time the dialog is opened.
  React.useEffect(() => {
    if (open) {
      setRows(INITIAL_PERMISSION_ROWS)
      setNewPrincipal("")
      setNewPermission("manage")
    }
  }, [open])

  const setPermission = (id: string, permission: PermissionValue) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, permission } : row))
    )
  }

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  const addPrincipal = () => {
    const option = ADD_PRINCIPAL_OPTIONS.find((entry) => entry.id === newPrincipal)
    if (!option || rows.some((row) => row.id === option.id)) return
    setRows((current) => [
      ...current,
      {
        id: option.id,
        name: option.name,
        secondary: option.kind === "user" ? `(${option.id})` : undefined,
        kind: option.kind,
        permission: newPermission,
        removable: true,
      },
    ])
    setNewPrincipal("")
    setNewPermission("manage")
  }

  const availableOptions = ADD_PRINCIPAL_OPTIONS.filter(
    (option) => !rows.some((row) => row.id === option.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-normal leading-6">
            Permission Settings for:
            <span className="block font-semibold">{datasourceName}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Manage who can view and manage {datasourceName}.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <div className="grid grid-cols-[1fr_220px_32px] items-center gap-x-4 gap-y-3">
            <span className="text-hint font-semibold uppercase text-muted-foreground">
              Name
            </span>
            <span className="text-hint font-semibold uppercase text-muted-foreground">
              Permission
            </span>
            <span />

            {rows.map((row) => (
              <React.Fragment key={row.id}>
                <div className="flex min-w-0 items-center gap-2">
                  {row.kind === "group" ? (
                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  ) : (
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className="min-w-0 truncate text-sm text-foreground">
                    {row.name}
                    {row.secondary ? (
                      <span className="text-muted-foreground"> {row.secondary}</span>
                    ) : null}
                  </span>
                </div>
                <PermissionSelect
                  value={row.permission}
                  onValueChange={(value) => setPermission(row.id, value)}
                />
                {row.removable ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${row.name}`}
                    onClick={() => removeRow(row.id)}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                ) : (
                  <span
                    className="flex size-6 items-center justify-center"
                    title="This permission is inherited and can't be removed."
                  >
                    <InfoSmallIcon className="h-4 w-4 text-muted-foreground" />
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-input pt-4">
            <Select value={newPrincipal} onValueChange={setNewPrincipal}>
              <SelectTrigger className="flex-1" aria-label="Select principal">
                <SelectValue placeholder="Select user, group or service principal..." />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No more principals available
                  </div>
                ) : (
                  availableOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <PermissionSelect value={newPermission} onValueChange={setNewPermission} />
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={!newPrincipal}
              onClick={addPrincipal}
            >
              Add
            </Button>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="default" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => onOpenChange(false)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProcessingScheduleToolbar({ onDirty }: { onDirty: () => void }) {
  const [cadence, setCadence] = React.useState("at-least-every")
  const [interval, setInterval] = React.useState("10")
  const [unit, setUnit] = React.useState("minutes")
  const [editingSchedule, setEditingSchedule] = React.useState(false)

  const markDirty = () => onDirty()

  const CADENCE_LABELS: Record<string, string> = {
    "at-least-every": "At least every",
    every: "Every",
    cron: "Cron",
  }
  const UNIT_LABELS: Record<string, string> = {
    minutes: "minutes",
    hours: "hours",
    days: "days",
  }
  const scheduleLabel = `${CADENCE_LABELS[cadence] ?? cadence} ${interval} ${
    UNIT_LABELS[unit] ?? unit
  }`

  return (
    <div className="flex items-center gap-x-3 gap-y-2">
      <div className="flex min-w-0 flex-wrap items-center gap-x-[7px] gap-y-2">
        <p className="shrink-0 text-sm font-semibold leading-5 text-foreground">
          Processing schedule
        </p>
        {editingSchedule ? (
          <>
            <Select
              value={cadence}
              onValueChange={(value) => {
                setCadence(value)
                markDirty()
              }}
            >
              <SelectTrigger className="w-[151px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="at-least-every">At least every</SelectItem>
                <SelectItem value="every">Every</SelectItem>
                <SelectItem value="cron">Cron</SelectItem>
              </SelectContent>
            </Select>
            <Input
              aria-label="Schedule interval"
              value={interval}
              onChange={(event) => {
                setInterval(event.target.value)
                markDirty()
              }}
              className="w-[65px]"
            />
            <Select
              value={unit}
              onValueChange={(value) => {
                setUnit(value)
                markDirty()
              }}
            >
              <SelectTrigger className="w-[151px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Done editing processing schedule"
              onClick={() => setEditingSchedule(false)}
            >
              <Check className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="flex h-8 min-w-0 items-center rounded border border-input bg-background px-3 text-sm text-foreground">
              {scheduleLabel}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Edit processing schedule"
              onClick={() => setEditingSchedule(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function DatasourceActionControls({
  datasourceName,
  dirty,
  onSaved,
}: {
  datasourceName: string
  dirty: boolean
  onSaved: () => void
}) {
  const [permissionsOpen, setPermissionsOpen] = React.useState(false)
  const [editorMode, setEditorMode] = React.useState("ui")

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <LakewatchWarehouseSelector />
        <WarehouseStatusIndicator />
        <Button
          variant="default"
          size="icon-sm"
          aria-label="Permissions"
          onClick={() => setPermissionsOpen(true)}
        >
          <Lock className="h-4 w-4" />
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!dirty}
          onClick={onSaved}
        >
          Save
        </Button>
      </div>
      <SegmentedControl value={editorMode} onValueChange={setEditorMode}>
        <SegmentedItem value="ui">UI</SegmentedItem>
        <SegmentedItem value="yaml">YAML</SegmentedItem>
      </SegmentedControl>
      <DatasourcePermissionsDialog
        datasourceName={datasourceName}
        open={permissionsOpen}
        onOpenChange={setPermissionsOpen}
      />
    </div>
  )
}

function DataProcessedChart() {
  const [scale, setScale] = React.useState("linear")

  return (
    <div className="rounded bg-muted/70 p-4">
      <h3 className="text-sm font-semibold leading-5 text-foreground">
        Data processed by log type
      </h3>

      <div className="mt-5">
        <div className="min-w-0">
          <div className="mb-3 flex items-center">
            <SegmentedControl value={scale} onValueChange={setScale}>
              <SegmentedItem value="linear" className="h-6 px-2 text-hint">
                Linear
              </SegmentedItem>
              <SegmentedItem value="logarithmic" className="h-6 px-2 text-hint">
                Logarithmic
              </SegmentedItem>
            </SegmentedControl>
          </div>

          <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-2">
            <div className="flex h-[110px] flex-col justify-between text-right text-hint text-muted-foreground">
              <span>95.37 MB</span>
              <span>76.29 MB</span>
              <span>57.22 MB</span>
              <span>38.15 MB</span>
              <span>19.07 MB</span>
              <span>0 B</span>
            </div>
            <div className="relative h-[110px] min-w-0">
              <div className="absolute inset-0 flex flex-col justify-between" aria-hidden>
                {Array.from({ length: 6 }, (_, index) => (
                  <span key={index} className="h-px w-full bg-border/70" />
                ))}
              </div>
              <svg
                className="absolute inset-0 size-full"
                viewBox={`0 0 ${CHART_VIEW_W} ${CHART_VIEW_H}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  {CHART_SERIES.map((series, index) => (
                    <linearGradient
                      key={series.label}
                      id={`chart-fill-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={series.color} stopOpacity={0.22} />
                      <stop offset="90%" stopColor={series.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                {CHART_SERIES.map((series, index) => {
                  const { line, area } = buildSeriesPaths(series.values)
                  return (
                    <g key={series.label}>
                      <path d={area} fill={`url(#chart-fill-${index})`} stroke="none" />
                      <path
                        d={line}
                        fill="none"
                        stroke={series.color}
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          <div className="ml-[72px] mt-2 flex justify-between gap-1 text-center text-hint text-muted-foreground">
            {CHART_DATES.map(([time, date]) => (
              <div key={date} className="flex flex-col gap-0.5">
                <span>{time}</span>
                <span className="font-semibold">{date}</span>
              </div>
            ))}
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lakewatch/charts/datasource-range-slider.svg"
            alt=""
            className="mt-3 h-2 w-full"
            aria-hidden
          />

          <div className="ml-[72px] mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {CHART_SERIES.map((series) => (
              <div
                key={series.label}
                className="flex items-center gap-2 text-hint text-foreground"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: series.color }}
                  aria-hidden
                />
                {series.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const CLASSIFICATION_SERIES = [
  {
    label: "Classified",
    color: "#3CAA60",
    values: [0.87, 0.9, 0.88, 0.93, 0.91, 0.95, 0.94, 0.96, 0.95, 0.97, 0.92, 0.55, 0.04],
  },
  {
    label: "Unclassified",
    color: "#E65B77",
    values: [0.02, 0.03, 0.02, 0.03, 0.02, 0.02, 0.03, 0.02, 0.03, 0.02, 0.03, 0.02, 0.03],
  },
] as const

function EventClassificationChart() {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-[32px_minmax(0,1fr)_40px] gap-3">
        <div className="flex h-[180px] flex-col justify-between text-right text-hint text-foreground">
          <span>1</span>
          <span>0.8</span>
          <span>0.6</span>
          <span>0.4</span>
          <span>0.2</span>
          <span>0</span>
        </div>

        <div className="relative h-[180px] min-w-0">
          <div className="absolute inset-0 flex flex-col justify-between" aria-hidden>
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index} className="h-px w-full bg-border/70" />
            ))}
          </div>
          <svg
            className="absolute inset-0 size-full"
            viewBox={`0 0 ${CHART_VIEW_W} ${CHART_VIEW_H}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              {CLASSIFICATION_SERIES.map((series, index) => (
                <linearGradient
                  key={series.label}
                  id={`classification-fill-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={series.color} stopOpacity={0.22} />
                  <stop offset="90%" stopColor={series.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            {CLASSIFICATION_SERIES.map((series, index) => {
              const { line, area } = buildSeriesPaths(series.values, 1)
              return (
                <g key={series.label}>
                  <path d={area} fill={`url(#classification-fill-${index})`} stroke="none" />
                  <path
                    d={line}
                    fill="none"
                    stroke={series.color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              )
            })}
          </svg>
        </div>

        <div className="flex h-[180px] flex-col justify-between text-left text-hint text-foreground">
          <span>500k</span>
          <span>400k</span>
          <span>300k</span>
          <span>200k</span>
          <span>100k</span>
          <span>0</span>
        </div>
      </div>

      <div className="ml-[44px] mr-[52px] mt-2 flex justify-between gap-1 text-center text-hint text-muted-foreground">
        {CHART_DATES.map(([time, date]) => (
          <div key={date} className="flex flex-col gap-0.5">
            <span>{time}</span>
            <span className="font-semibold text-foreground">{date}</span>
          </div>
        ))}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/lakewatch/charts/datasource-range-slider.svg"
        alt=""
        className="ml-[44px] mr-[52px] mt-3 h-2 w-[calc(100%-96px)]"
        aria-hidden
      />

      <div className="ml-[44px] mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {CLASSIFICATION_SERIES.map((series) => (
          <div
            key={series.label}
            className="flex items-center gap-2 text-hint text-foreground"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: series.color }}
              aria-hidden
            />
            {series.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function DatasourceHealthTab() {
  const [errorQuery, setErrorQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("open")
  const [sortOrder, setSortOrder] = React.useState("most-recent")

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold leading-6 text-foreground">
            Event classification
          </h2>
        </div>
        <EventClassificationChart />
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold leading-6 text-foreground">
            Source errors
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-[216px]">
              <SearchIcon
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={errorQuery}
                onChange={(event) => setErrorQuery(event.target.value)}
                placeholder="Search"
                aria-label="Search source errors"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most-recent">Most recent</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="default"
              size="sm"
              className="min-w-[320px] justify-between font-normal"
            >
              <span>07/21/26 4:00 - 07/28/2026 04:59</span>
              <CalendarRangeIcon size={16} className="text-muted-foreground" />
            </Button>
          </div>
        </div>

        <Empty
          title="No results"
          description="No source errors found for the selected filters."
          className="py-16 [&_p]:sr-only"
        />
      </section>
    </div>
  )
}

type PinnedParserRow = {
  name: string
  version?: string
  table?: string
  fieldCount?: number
}

function AddParserDialog({
  open,
  onOpenChange,
  parserRows,
  createCustomHref,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  parserRows: PinnedParserRow[]
  createCustomHref?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AddParserDialogBody
          onOpenChange={onOpenChange}
          parserRows={parserRows}
          createCustomHref={createCustomHref}
        />
      ) : null}
    </Dialog>
  )
}

function AddParserDialogBody({
  onOpenChange,
  parserRows,
  createCustomHref,
}: {
  onOpenChange: (open: boolean) => void
  parserRows: PinnedParserRow[]
  createCustomHref?: string
}) {
  const extraTemplates = React.useMemo(
    () => buildParserTemplates(parserRows),
    [parserRows]
  )
  const initialSelectedIds = React.useMemo(
    () => extraTemplates.map((template) => template.id),
    [extraTemplates]
  )
  const controller = useIntegrationTemplates(undefined, {
    extraTemplates,
    initialSelectedIds,
  })
  const panelOpen = controller.panelOpen

  return (
    <DialogContent
      showCloseButton={false}
      className={cn(
        "flex max-h-[86vh] flex-col gap-0 overflow-hidden p-0 transition-[max-width] duration-200 sm:max-w-2xl",
        panelOpen && "sm:max-w-[1120px]"
      )}
    >
      <DialogHeader className="flex-row items-start justify-between gap-3 border-b border-border px-6 py-4 text-left">
        <div className="flex flex-col gap-1">
          <DialogTitle>Add Parser</DialogTitle>
          <DialogDescription>
            Select built-in or custom parsers to structure and validate incoming
            event data.
          </DialogDescription>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Close add parser">
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DialogClose>
      </DialogHeader>

      <div className="flex min-h-0 flex-1 flex-row">
        <div
          className={cn(
            "min-h-0 overflow-y-auto p-6",
            panelOpen ? "w-[460px] shrink-0 border-r border-border" : "flex-1"
          )}
        >
          <IntegrationTemplatesField
            controller={controller}
            hideHeader
            createCustomHref={createCustomHref}
          />
        </div>
        {panelOpen ? (
          <div className="hidden min-h-0 min-w-0 flex-1 lg:block">
            <IntegrationTemplatePanel controller={controller} className="h-full" />
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-3">
        <Button variant="default" size="sm" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={() => onOpenChange(false)}>
          Add parsers
        </Button>
      </div>
    </DialogContent>
  )
}

function DatasourceSchemasTab({
  isApiConnector = false,
  schemas = DATASOURCE_SCHEMAS as readonly DatasourceSchemaRow[],
  destinationTables = DESTINATION_TABLES,
  datasourceName = "",
}: {
  isApiConnector?: boolean
  schemas?: readonly DatasourceSchemaRow[]
  destinationTables?: Record<string, string[]>
  datasourceName?: string
}) {
  const searchParams = useSearchParams()
  const inferredParam = searchParams.get("inferred")
  const pendingSchemas = inferredParam
    ? inferredParam.split(",").map((value) => value.trim()).filter(Boolean)
    : []
  const [removedSchemas, setRemovedSchemas] = React.useState<string[]>([])
  const [addParserOpen, setAddParserOpen] = React.useState(false)
  const [versionOverrides, setVersionOverrides] = React.useState<
    Record<string, string>
  >({})
  const [versionTarget, setVersionTarget] = React.useState<{
    schema: string
    current: string
  } | null>(null)
  const visibleSchemas = schemas.filter(
    (row) => !removedSchemas.includes(row.schema)
  )

  // Parsers already attached to this datasource, pre-pinned in the Add parser
  // dialog so users start from the current set and add on top of it.
  const pinnedParserRows = React.useMemo(
    () =>
      visibleSchemas.map((row) => {
        const versions = buildVersions(row.schema)
        return {
          name: row.schema,
          version: versions[0]?.version ?? "v1",
          table: (destinationTables[row.schema] ?? [])[0],
          fieldCount: 11,
        }
      }),
    [visibleSchemas, destinationTables]
  )

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold leading-6 text-foreground">
          Parsers
        </h2>
        <Button
          variant="default"
          size="sm"
          className="gap-1.5"
          onClick={() => setAddParserOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add parser
        </Button>
        <AddParserDialog
          open={addParserOpen}
          onOpenChange={setAddParserOpen}
          parserRows={pinnedParserRows}
          createCustomHref="/lakewatch/schemas/new"
        />
      </div>
      <Table className="mt-3">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-foreground">
              Parser name
            </TableHead>
            <TableHead className="w-[300px] font-semibold text-foreground">
              Destination table
            </TableHead>
            <TableHead className="w-[220px] font-semibold text-foreground">
              Current version
            </TableHead>
            <TableHead className="w-[360px] font-semibold text-foreground">
              Latest version
            </TableHead>
            <TableHead className="w-[120px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingSchemas.map((schema) => (
            <TableRow key={schema}>
              <TableCell className="text-foreground">{schema}</TableCell>
              <TableCell className="text-muted-foreground">—</TableCell>
              <TableCell className="text-muted-foreground">—</TableCell>
              <TableCell className="text-muted-foreground">—</TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                  Pending
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {visibleSchemas.map((row) => {
            const versions = buildVersions(row.schema)
            const latest = versions[0]
            // API connector parsers are always kept on the latest version.
            const upToDate =
              isApiConnector ||
              row.schema === "AWS.ALB" ||
              row.schema === "AWS.CloudTrail"
            const hasUpdate = !upToDate && versions.length > 1
            const defaultUsed = hasUpdate ? versions[1] : latest
            const override = versionOverrides[row.schema]
            const used =
              (override && versions.find((v) => v.version === override)) ||
              defaultUsed
            const showUpdate = used.version !== latest.version
            return (
              <TableRow key={row.schema}>
                <TableCell className="text-foreground">{row.schema}</TableCell>
                <TableCell className="text-foreground">
                  <div className="flex min-w-0 flex-col gap-1">
                    {(destinationTables[row.schema] ?? []).map((table) => (
                      <Button
                        key={table}
                        variant="link"
                        className="h-auto max-w-full justify-start truncate p-0 text-sm font-normal text-primary"
                        asChild
                      >
                        <Link href="#" title={table}>
                          {table}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{used.version}</span>
                    <Badge variant="secondary" className="font-normal text-hint">
                      {used.created}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{latest.version}</span>
                    <Badge variant="secondary" className="font-normal text-hint">
                      {latest.created}
                    </Badge>
                    {showUpdate ? (
                      <Badge variant="indigo">Update available</Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="default" size="sm" asChild>
                      <Link
                        href={`/lakewatch/schemas/${encodeURIComponent(row.schema)}?from=datasource${
                          datasourceName
                            ? `&datasource=${encodeURIComponent(datasourceName)}`
                            : ""
                        }`}
                      >
                        View
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`More actions for ${row.schema}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            setVersionTarget({
                              schema: row.schema,
                              current: used.version,
                            })
                          }
                        >
                          <History className="h-4 w-4" />
                          Change version
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() =>
                            setRemovedSchemas((prev) =>
                              prev.includes(row.schema)
                                ? prev
                                : [...prev, row.schema]
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete parser
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <ChangeVersionDialog
        target={versionTarget}
        onOpenChange={(open) => {
          if (!open) setVersionTarget(null)
        }}
        onConfirm={(schema, version) => {
          setVersionOverrides((prev) => ({ ...prev, [schema]: version }))
          setVersionTarget(null)
        }}
      />
    </section>
  )
}

function ChangeVersionDialog({
  target,
  onOpenChange,
  onConfirm,
}: {
  target: { schema: string; current: string } | null
  onOpenChange: (open: boolean) => void
  onConfirm: (schema: string, version: string) => void
}) {
  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-1">
          <DialogTitle>Change version</DialogTitle>
          {target ? (
            <DialogDescription className="text-foreground">
              {target.schema}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {target ? (
          <ChangeVersionBody
            key={target.schema}
            target={target}
            onConfirm={onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ChangeVersionBody({
  target,
  onConfirm,
}: {
  target: { schema: string; current: string }
  onConfirm: (schema: string, version: string) => void
}) {
  const versions = buildVersions(target.schema)
  const latest = versions[0]?.version
  const [selected, setSelected] = React.useState(target.current)

  return (
    <>
      <DialogBody className="gap-2">
        <div role="radiogroup" className="flex flex-col gap-1.5">
          {versions.map((version) => {
            const active = version.version === selected
            return (
              <button
                key={version.version}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(version.version)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded border px-3 py-2 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {version.version}
                  </span>
                  {version.version === latest ? (
                    <Badge variant="secondary" className="font-normal text-hint">
                      Latest
                    </Badge>
                  ) : null}
                  <span className="text-hint text-muted-foreground">
                    {version.created}
                  </span>
                </span>
                {active ? (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                ) : null}
              </button>
            )
          })}
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="default" size="sm">
            Cancel
          </Button>
        </DialogClose>
        <Button
          variant="primary"
          size="sm"
          disabled={selected === target.current}
          onClick={() => onConfirm(target.schema, selected)}
        >
          Change version
        </Button>
      </DialogFooter>
    </>
  )
}

const NORMALIZATION_SCHEMAS = [
  "Schematized_AWS.VPCFlow",
  "Schematized_AWS.ALB",
  "Schematized_AWS.S3ServerAccess",
] as const

function PreviewAvailable() {
  return (
    <div className="flex items-center gap-1 font-semibold text-foreground">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/lakewatch/normalization-check.svg"
        alt=""
        className="size-4 shrink-0"
        aria-hidden
      />
      <span className="text-hint leading-4">Preview available</span>
    </div>
  )
}

function NormalizationSourceNode({ sourceName }: { sourceName: string }) {
  return (
    <div className="absolute left-0 top-[1px] flex h-[225px] w-[280px] flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-[var(--shadow-db-xs)]">
      <div className="flex items-center gap-2 px-4 py-2">
        <TableIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
        <span className="flex-1 text-sm font-semibold leading-5">Raw</span>
        <Button variant="ghost" size="icon-xs" aria-label="Raw node options">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      <div className="mx-4 h-px bg-border" />
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="size-2 rounded-full bg-[var(--success)]" aria-hidden />
        <span className="text-hint font-semibold leading-4">Active</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {sourceName}-Raw
        </span>
        <LakewatchDatasourceLogo
          kind={DATASOURCE_LOGOS[sourceName] ?? "cloudtrail"}
          size="node"
        />
      </div>
      <div className="mx-4 h-px bg-border" />
      <p className="px-4 py-2 text-hint leading-4 text-foreground">
        Current field list: 27 fields added
      </p>
      <div className="px-4 py-1">
        <PreviewAvailable />
      </div>
      <div className="mt-auto flex items-center justify-between px-4 py-2">
        <Button variant="default" size="xs">
          Edit
        </Button>
        <Switch defaultChecked aria-label="Raw normalization enabled" size="sm" />
      </div>
    </div>
  )
}

function SchematizedNode({
  name,
  sourceName,
  top,
}: {
  name: (typeof NORMALIZATION_SCHEMAS)[number]
  sourceName: string
  top: number
}) {
  return (
    <div
      className="absolute left-[360px] flex h-[155px] w-[280px] flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-[var(--shadow-db-xs)]"
      style={{ top }}
    >
      <div className="flex items-center px-4 py-2">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-5">
          {name}
        </span>
      </div>
      <div className="mx-4 h-px bg-border" />
      <p className="px-4 pt-2 text-hint leading-4 text-foreground">
        Current field list: 27 fields added
      </p>
      <div className="px-4 py-2">
        <PreviewAvailable />
      </div>
      <div className="mt-auto flex items-center justify-between px-4 py-2">
        <Button variant="default" size="xs" asChild>
          <Link
            href={`/lakewatch/datasources/${encodeURIComponent(sourceName)}/normalizations/${encodeURIComponent(name)}`}
          >
            View &amp; edit
          </Link>
        </Button>
        <Switch defaultChecked aria-label={`${name} enabled`} size="sm" />
      </div>
    </div>
  )
}

function NormalizedNode({
  name,
  source,
  top,
}: {
  name: string
  source: string
  top: number
}) {
  return (
    <div
      className="absolute left-[720px] flex h-[155px] w-[280px] flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-[var(--shadow-db-xs)]"
      style={{ top }}
    >
      <div className="flex items-center px-4 py-2">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-5">
          {name}
        </span>
      </div>
      <div className="mx-4 h-px bg-border" />
      <p className="truncate px-4 pt-2 text-hint leading-4 text-muted-foreground">
        Source schematized table: <span className="text-foreground">{source}</span>
      </p>
      <div className="px-4 py-2">
        <PreviewAvailable />
      </div>
      <div className="mt-auto flex items-center justify-between px-4 py-2">
        <Button variant="default" size="xs">
          View &amp; edit
        </Button>
        <Switch defaultChecked aria-label={`${name} enabled`} size="sm" />
      </div>
    </div>
  )
}

const NORMALIZATION_PRESETS = [
  {
    id: "preset",
    icon: ForkIcon,
    title: "Normalize from preset",
    description:
      "Apply a pre-built schema transform to automatically create gold and silver tables.",
  },
  {
    id: "ai",
    icon: NotebookIcon,
    title: "Build a custom preset with AI",
    description: "An advanced option using a notebook to build a preset with Genie.",
  },
  {
    id: "yaml",
    icon: UploadIcon,
    title: "Upload custom YAML",
    description: "Build silver and gold transforms manually using your own YAML file.",
  },
] as const

type PresetRow = {
  name: string
  logo?: string
  logoKind?: LakewatchDatasourceLogoKind
  recommended?: boolean
}

const SOURCE_TYPE_PRESETS: PresetRow[] = [
  { name: "AWS CloudTrail Authentication", logo: "/lakewatch/preset-logos/cloudtrail.png" },
  { name: "Amazon CloudTrail IAM", logo: "/lakewatch/preset-logos/cloudtrail.png" },
  { name: "Amazon Lambda Functions", logo: "/lakewatch/preset-logos/lambda.png" },
  { name: "AWS Route 53", logo: "/lakewatch/preset-logos/route53.png" },
  { name: "AWS S3 Buckets", logo: "/lakewatch/preset-logos/s3.svg" },
  { name: "Amazon Security Hub", logo: "/lakewatch/preset-logos/security-hub.png" },
  { name: "AWS VPC", logo: "/lakewatch/preset-logos/vpc.png" },
  { name: "AWS WAF", logo: "/lakewatch/preset-logos/waf.png" },
]

const RECOMMENDED_PRESET: Record<LakewatchDatasourceLogoKind, PresetRow> = {
  cloudtrail: {
    name: "AWS CloudTrail Authentication",
    logo: "/lakewatch/preset-logos/cloudtrail.png",
  },
  slack: { name: "Slack Audit Logs", logoKind: "slack" },
  "1password": { name: "1Password Item Usage", logoKind: "1password" },
  okta: { name: "Okta System Log", logoKind: "okta" },
  fluentbit: { name: "Fluent Bit Events", logoKind: "fluentbit" },
}

function PresetLogo({ preset }: { preset: PresetRow }) {
  return (
    <span className="flex h-[42px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
      {preset.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preset.logo} alt="" className="size-full object-cover" />
      ) : preset.logoKind ? (
        <LakewatchDatasourceLogo kind={preset.logoKind} size="list" />
      ) : null}
    </span>
  )
}

function PresetSelectionModal({
  open,
  onOpenChange,
  onApply,
  sourceName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: () => void
  sourceName: string
}) {
  const [query, setQuery] = React.useState("")
  const [loadingPreset, setLoadingPreset] = React.useState<string | null>(null)

  const handleSelect = (name: string) => {
    if (loadingPreset) return
    setLoadingPreset(name)
    window.setTimeout(() => {
      setLoadingPreset(null)
      setQuery("")
      onApply()
      onOpenChange(false)
    }, 2000)
  }

  const logoKind = DATASOURCE_LOGOS[sourceName] ?? "cloudtrail"
  const recommended: PresetRow = { ...RECOMMENDED_PRESET[logoKind], recommended: true }
  const presets: PresetRow[] = [
    recommended,
    ...SOURCE_TYPE_PRESETS.filter((preset) => preset.name !== recommended.name),
  ]

  const filtered = presets.filter((preset) =>
    preset.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-2xl font-semibold">
            Auto-normalizing your datasource
          </DialogTitle>
          <p className="text-lg font-semibold leading-7 text-foreground">
            Source type detection
          </p>
          <DialogDescription>
            Confirm the datasource type by selecting from the list below.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="gap-4">
          <div className="relative">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search datasource presets..."
              aria-label="Search datasource presets"
              className="pl-9"
            />
          </div>
          <div className="flex max-h-[360px] flex-col gap-1.5 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-hint text-muted-foreground">
                No datasource presets match &ldquo;{query}&rdquo;.
              </p>
            ) : (
              filtered.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelect(preset.name)}
                  disabled={loadingPreset !== null}
                  className="flex items-center gap-2 rounded-md border border-border p-2 text-left transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                >
                  <PresetLogo preset={preset} />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {preset.name}
                  </span>
                  {loadingPreset === preset.name ? (
                    <Loader2
                      className="size-4 shrink-0 animate-spin text-muted-foreground"
                      aria-label="Applying preset"
                    />
                  ) : preset.recommended ? (
                    <Badge variant="purple" className="shrink-0">
                      Recommended
                    </Badge>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

function AddNormalizationCard({
  sourceName,
  onApply,
}: {
  sourceName: string
  onApply: () => void
}) {
  const [presetModalOpen, setPresetModalOpen] = React.useState(false)

  return (
    <div className="absolute left-[720px] top-[109px] flex w-[360px] flex-col gap-2 rounded-md border border-border bg-card p-6 text-card-foreground shadow-[var(--shadow-db-xs)]">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold leading-7 text-foreground">
          Normalize your datasource
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to normalize your datasource.
        </p>
      </div>
      <div className="mt-1 flex flex-col gap-2">
        {NORMALIZATION_PRESETS.map(({ id, icon: Icon, title, description }) => (
          <button
            key={id}
            type="button"
            onClick={id === "preset" ? () => setPresetModalOpen(true) : undefined}
            className="flex items-center gap-4 rounded-md border border-border py-2 pr-2 pl-4 text-left transition-colors hover:bg-muted"
          >
            <Icon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold text-foreground">{title}</span>
              <span className="text-hint leading-4 text-muted-foreground">{description}</span>
            </span>
          </button>
        ))}
      </div>

      <PresetSelectionModal
        open={presetModalOpen}
        onOpenChange={setPresetModalOpen}
        onApply={onApply}
        sourceName={sourceName}
      />
    </div>
  )
}

function DatasourceNormalizationsTab({ sourceName }: { sourceName: string }) {
  const [normalized, setNormalized] = React.useState(false)

  return (
    <div className="relative min-h-[695px] overflow-x-auto overflow-y-hidden rounded-b-md rounded-t border border-border bg-background">
      <div
        className={cn(
          "relative h-[695px] overflow-hidden",
          normalized ? "min-w-[1000px]" : "min-w-[1360px]",
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 bg-background" />
          <div
            className="absolute inset-0 bg-[length:100px_100px] bg-left-top opacity-20 dark:invert"
            style={{ backgroundImage: 'url("/lakewatch/normalization-canvas.png")' }}
          />
        </div>

        <div
          className={cn(
            "absolute left-1/2 top-1/2 h-[506px] -translate-x-1/2 -translate-y-1/2",
            normalized ? "w-[1000px]" : "w-[1080px]",
          )}
        >
          <NormalizationSourceNode sourceName={sourceName} />

          {[
            {
              src: "/lakewatch/normalization-edge-top.svg",
              className: "left-[280px] top-[78px] h-9 w-[80px] -scale-y-100",
            },
            {
              src: "/lakewatch/normalization-edge-middle.svg",
              className: "left-[280px] top-[113px] h-36 w-[80px]",
            },
            {
              src: "/lakewatch/normalization-edge-bottom.svg",
              className: "left-[280px] top-[113px] h-[317px] w-[80px]",
            },
          ].map((edge) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={edge.src}
              src={edge.src}
              alt=""
              className={`pointer-events-none absolute ${edge.className}`}
              aria-hidden
            />
          ))}

          {NORMALIZATION_SCHEMAS.map((name, index) => (
            <SchematizedNode
              key={name}
              name={name}
              sourceName={sourceName}
              top={[0, 178, 351][index]}
            />
          ))}

          {[
            { left: 276, top: 109 },
            { left: 356, top: 74 },
            { left: 356, top: 252 },
            { left: 356, top: 425 },
          ].map((point) => (
            <span
              key={`${point.left}-${point.top}`}
              className="pointer-events-none absolute size-2 rounded-full border border-grey-600 bg-background"
              style={{ left: point.left, top: point.top }}
              aria-hidden
            />
          ))}

          {normalized ? (
            <>
              {[
                { top: 77, from: 636, to: 716 },
                { top: 255, from: 636, to: 716 },
                { top: 428, from: 636, to: 716 },
              ].map((line) => (
                <span
                  key={line.top}
                  className="pointer-events-none absolute h-px bg-[#445461]"
                  style={{ left: line.from, top: line.top, width: line.to - line.from }}
                  aria-hidden
                />
              ))}

              {[
                { left: 636, top: 74 },
                { left: 636, top: 252 },
                { left: 636, top: 425 },
                { left: 716, top: 74 },
                { left: 716, top: 252 },
                { left: 716, top: 425 },
              ].map((point) => (
                <span
                  key={`${point.left}-${point.top}`}
                  className="pointer-events-none absolute size-2 rounded-full border border-grey-600 bg-background"
                  style={{ left: point.left, top: point.top }}
                  aria-hidden
                />
              ))}

              {NORMALIZATION_SCHEMAS.map((name, index) => (
                <NormalizedNode
                  key={name}
                  name={name.replace("Schematized", "OCSF")}
                  source={name}
                  top={[0, 178, 351][index]}
                />
              ))}
            </>
          ) : (
            <AddNormalizationCard
              sourceName={sourceName}
              onApply={() => setNormalized(true)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const SYSTEM_CASES = [
  {
    id: "sys-995",
    title: "Ingestion pipeline failure",
    events: 1,
    resourceType: "Datasource",
    state: "Open",
    severity: "Medium",
    created: "8/11/2026, 3:42 PM",
  },
  {
    id: "sys-992",
    title: "Ingestion pipeline failure",
    events: 4,
    resourceType: "Datasource",
    state: "Open",
    severity: "Medium",
    created: "8/10/2026, 9:15 AM",
  },
] as const

function DatasourceSystemCasesTab({
  datasourceName,
}: {
  datasourceName: string
}) {
  const [search, setSearch] = React.useState(datasourceName)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search cases"
            className="h-8 pl-8 pr-8"
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Clear search"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setSearch("")}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          ) : null}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-9">
              <Checkbox aria-label="Select all cases" />
            </TableHead>
            <TableHead className="font-semibold text-foreground">Title</TableHead>
            <TableHead className="font-semibold text-foreground">Case ID</TableHead>
            <TableHead className="font-semibold text-foreground">Event count</TableHead>
            <TableHead className="font-semibold text-foreground">Resource type</TableHead>
            <TableHead className="font-semibold text-foreground">Resource name</TableHead>
            <TableHead className="font-semibold text-foreground">Assignee</TableHead>
            <TableHead className="font-semibold text-foreground">State</TableHead>
            <TableHead className="font-semibold text-foreground">Severity</TableHead>
            <TableHead className="font-semibold text-foreground">
              <span className="inline-flex items-center gap-1">
                Created
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              </span>
            </TableHead>
            <TableHead className="w-9 text-right">
              <Columns3 className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SYSTEM_CASES.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Checkbox aria-label={`Select case ${row.id}`} />
              </TableCell>
              <TableCell>
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm font-normal text-primary"
                  asChild
                >
                  <Link href="#">{row.title}</Link>
                </Button>
              </TableCell>
              <TableCell className="text-foreground">{row.id}</TableCell>
              <TableCell>
                <span className="inline-flex min-w-6 items-center justify-center rounded bg-muted px-1.5 py-0.5 text-hint text-foreground">
                  {row.events}
                </span>
              </TableCell>
              <TableCell className="text-foreground">{row.resourceType}</TableCell>
              <TableCell className="text-foreground">{datasourceName}</TableCell>
              <TableCell>
                <Badge variant="charcoal">Unassigned</Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-destructive">{row.state}</span>
              </TableCell>
              <TableCell>
                <Badge variant="lemon">{row.severity}</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-foreground">
                {row.created}
              </TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function LakewatchDatasourceDetailView() {
  const params = useParams<{ sourceId: string }>()
  const searchParams = useSearchParams()
  const sourceName = decodeURIComponent(params.sourceId ?? "lakewatch-account-us-west-2")
  const [variation] = usePrototypeVariation()
  const isP1 = variation === "p1"

  // When arriving from a Lakeflow Connect (API connector) add flow, the source
  // type and parsers are driven by the chosen connector rather than the S3
  // defaults below. If the query param is missing (e.g. on refresh or when
  // navigating from the list), infer the connector from the datasource name.
  const paramConnectorKey = searchParams.get("connector")
  const connectorKey =
    paramConnectorKey && paramConnectorKey in CONNECT_SOURCES
      ? paramConnectorKey
      : (Object.keys(CONNECT_SOURCES)
          .sort((a, b) => b.length - a.length)
          .find(
            (key) => sourceName === key || sourceName.startsWith(`${key}-`)
          ) ?? null)
  const connectorFamily = connectorKey
    ? CONNECT_SOURCES[connectorKey as keyof typeof CONNECT_SOURCES]
    : null
  const connectionName =
    searchParams.get("connection")?.trim() ||
    (connectorKey ? `${connectorKey}-connection` : "")

  const logoKind: LakewatchDatasourceLogoKind = connectorFamily
    ? CONNECTOR_LOGO_KINDS[connectorKey as string] ?? "fluentbit"
    : DATASOURCE_LOGOS[sourceName] ?? "cloudtrail"
  const isApiConnector =
    Boolean(connectorFamily) ||
    logoKind === "slack" ||
    logoKind === "okta" ||
    logoKind === "1password"
  const connectorSchemas = connectorFamily
    ? buildConnectorSchemas(connectorFamily)
    : null
  const connectorDestinations = connectorFamily
    ? buildConnectorDestinations(connectorFamily)
    : null
  const [description, setDescription] = React.useState("")
  const [editingDescription, setEditingDescription] = React.useState(false)
  const [draftDescription, setDraftDescription] = React.useState("")
  const [healthSchedule, setHealthSchedule] = React.useState("")
  const [healthLagInterval, setHealthLagInterval] = React.useState("")
  const [volumeCheck, setVolumeCheck] = React.useState(false)
  const [latencyCheck, setLatencyCheck] = React.useState(false)
  const [nullTimestampCheck, setNullTimestampCheck] = React.useState(false)
  const [toolbarDirty, setToolbarDirty] = React.useState(false)
  const [runAs, setRunAs] = React.useState("beau.trincia@databricks.com")
  const healthEnabled =
    volumeCheck ||
    latencyCheck ||
    nullTimestampCheck ||
    healthSchedule.trim() !== "" ||
    healthLagInterval.trim() !== ""
  const suggestedDescription = connectorFamily
    ? `Ingests ${connectorFamily} audit, access, and activity events through the ${connectionName} ` +
      `connection. Raw events are parsed and normalized into dedicated lakewatch.default tables for ` +
      `security monitoring and detection. New events are pulled continuously and are typically ` +
      `queryable within a few minutes of ingestion.`
    : "Ingests AWS CloudTrail audit logs from the audit-logs-7830bcf S3 bucket in us-west-2. " +
      "Raw events are parsed and normalized into the lakewatch.default.audit_logs_7830bcf table for " +
      "security monitoring and compliance reporting. New objects are picked up continuously, so records " +
      "are typically queryable within a few minutes of delivery."

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div>
        <Breadcrumb className="mb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/lakewatch/datasources">Datasources</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <LakewatchDatasourceLogo kind={logoKind} size="detail" />
            <div className="min-w-0">
              <h1 className={`${PAGE_TITLE_SEMIBOLD} truncate`}>{sourceName}</h1>
              <p className="text-hint text-foreground">
                {connectorFamily ? (
                  <>
                    {connectorFamily} connection →{" "}
                    <span className="text-primary">{connectionName}</span>
                  </>
                ) : (
                  <>
                    S3 Bucket →{" "}
                    <span className="text-primary">audit-logs-7830bcf</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <DatasourceActionControls
              datasourceName={sourceName}
              dirty={toolbarDirty}
              onSaved={() => setToolbarDirty(false)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-5">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system-cases">
            System alerts
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold leading-none text-white">
              2
            </span>
          </TabsTrigger>
          {isP1 ? (
            <>
              <TabsTrigger value="dlq">DLQ</TabsTrigger>
              <TabsTrigger value="normalize">Normalize</TabsTrigger>
            </>
          ) : null}
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
            <div className="flex flex-col gap-5">
            {editingDescription ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="datasource-overview-description">Description</Label>
                <Textarea
                  id="datasource-overview-description"
                  value={draftDescription}
                  onChange={(event) => setDraftDescription(event.target.value)}
                  placeholder="Add a description for this datasource"
                  autoFocus
                  rows={5}
                  className="min-h-[140px]"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setDescription(draftDescription)
                      setEditingDescription(false)
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setEditingDescription(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold leading-5 text-foreground">
                    Description
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto gap-1 p-0 !px-0"
                    onClick={() => {
                      setDraftDescription(description)
                      setEditingDescription(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
                {description ? (
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {description}
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto justify-start whitespace-normal p-0 !px-0 text-left text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
                    onClick={() => setDescription(suggestedDescription)}
                  >
                    Add a description for this datasource
                  </Button>
                )}
              </div>
            )}

            <div className="border-t border-border pt-4">
              <RunAsControl value={runAs} onValueChange={setRunAs} />
            </div>

            <div className="border-t border-border pt-4">
              <ProcessingScheduleToolbar onDirty={() => setToolbarDirty(true)} />
            </div>
            </div>

            <div className="flex flex-col gap-5 lg:border-l lg:border-border lg:pl-10">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold leading-5 text-foreground">
                    Health monitoring
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Edit health monitoring"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="max-h-[70vh] w-[400px] overflow-y-auto"
                    >
                      <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                          <div>
                            <Label htmlFor="health-schedule">Schedule *</Label>
                            <p className="text-hint text-muted-foreground">
                              A Quartz cron expression for when the health check runs.
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Input
                              id="health-schedule"
                              value={healthSchedule}
                              onChange={(event) => {
                                setHealthSchedule(event.target.value)
                                setToolbarDirty(true)
                              }}
                              placeholder="0 0 * * * ? *"
                              className="flex-1 font-mono"
                            />
                            <span className="shrink-0 text-sm text-muted-foreground">
                              Every hour
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div>
                            <Label htmlFor="health-lag-interval">
                              Lag interval (hours) *
                            </Label>
                            <p className="text-hint text-muted-foreground">
                              Number of hours to wait before analyzing data, to account
                              for ingestion latency. For example, with a lag of 1 hour, a
                              job running at 14:30 analyzes data up to 14:00.
                            </p>
                          </div>
                          <Input
                            id="health-lag-interval"
                            type="number"
                            min={0}
                            value={healthLagInterval}
                            onChange={(event) => {
                              setHealthLagInterval(event.target.value)
                              setToolbarDirty(true)
                            }}
                            placeholder="1"
                          />
                        </div>

                        <div className="border-t border-border" />

                        <div className="flex flex-col gap-2">
                          <h3 className="text-sm font-semibold leading-5 text-foreground">
                            Volume check
                          </h3>
                          <p className="text-hint text-muted-foreground">
                            Detects anomalies in bronze table data volume using
                            statistical comparison.
                          </p>
                          <label
                            htmlFor="health-volume-check"
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Checkbox
                              id="health-volume-check"
                              checked={volumeCheck}
                              onCheckedChange={(checked) => {
                                setVolumeCheck(checked === true)
                                setToolbarDirty(true)
                              }}
                            />
                            <span className="text-sm text-foreground">
                              Enable volume check
                            </span>
                          </label>
                        </div>

                        <div className="border-t border-border" />

                        <div className="flex flex-col gap-2">
                          <h3 className="text-sm font-semibold leading-5 text-foreground">
                            Latency check
                          </h3>
                          <p className="text-hint text-muted-foreground">
                            Detects when too many rows have excessive ingestion latency.
                          </p>
                          <label
                            htmlFor="health-latency-check"
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Checkbox
                              id="health-latency-check"
                              checked={latencyCheck}
                              onCheckedChange={(checked) => {
                                setLatencyCheck(checked === true)
                                setToolbarDirty(true)
                              }}
                            />
                            <span className="text-sm text-foreground">
                              Enable latency check
                            </span>
                          </label>
                        </div>

                        <div className="border-t border-border" />

                        <div className="flex flex-col gap-2">
                          <h3 className="text-sm font-semibold leading-5 text-foreground">
                            Null timestamp check
                          </h3>
                          <p className="text-hint text-muted-foreground">
                            Detects when too many rows are missing their original event
                            timestamp.
                          </p>
                          <label
                            htmlFor="health-null-timestamp-check"
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Checkbox
                              id="health-null-timestamp-check"
                              checked={nullTimestampCheck}
                              onCheckedChange={(checked) => {
                                setNullTimestampCheck(checked === true)
                                setToolbarDirty(true)
                              }}
                            />
                            <span className="text-sm text-foreground">
                              Enable null timestamp check
                            </span>
                          </label>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Badge variant={healthEnabled ? "teal" : "secondary"}>
                    {healthEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold leading-5 text-foreground">
                    Annotations
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Edit annotations"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[420px]">
                      <WizardAnnotationsField bare />
                    </PopoverContent>
                  </Popover>
                </div>
                <p className="text-sm text-muted-foreground">No annotations</p>
              </div>
            </div>
          </div>

          <div className="my-6 h-px bg-border" />

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold leading-6 text-foreground">Overview stats</h2>
            </div>

            <div className="mt-3 grid items-stretch gap-4 lg:grid-cols-3">
              <TrendMetricCard
                label="Events ingested (last 24h)"
                value="1.24"
                unit="M"
                trend="up"
                change="12.4%"
                comparison="vs. prev. 24h"
              />
              <TrendMetricCard
                label="Events ingested (last 7d)"
                value="11.57"
                unit="M"
                trend="down"
                change="3.2%"
                comparison="vs. prev. 7d"
              />
              <EventsSparklineCard />
            </div>
          </section>

          <div className="my-6 h-px bg-border" />

          <DatasourceSchemasTab
            isApiConnector={isApiConnector}
            schemas={connectorSchemas ?? undefined}
            destinationTables={connectorDestinations ?? undefined}
            datasourceName={sourceName}
          />
        </TabsContent>
        <TabsContent value="system-cases" className="mt-4">
          <DatasourceSystemCasesTab datasourceName={sourceName} />
        </TabsContent>
        {isP1 ? (
          <>
            <TabsContent value="dlq" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Dead-letter queue details for this datasource will appear here.
              </p>
            </TabsContent>
            <TabsContent value="normalize" className="mt-4">
              <DatasourceNormalizeTab
                schemas={connectorSchemas ?? DATASOURCE_SCHEMAS}
                destinationTables={connectorDestinations ?? DESTINATION_TABLES}
              />
            </TabsContent>
          </>
        ) : null}
      </Tabs>
    </div>
  )
}

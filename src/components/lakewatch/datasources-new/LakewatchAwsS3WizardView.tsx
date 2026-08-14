"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Clock,
  Filter,
  LoaderCircle,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
  CatalogIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DatasourceNavIcon,
  FolderIcon,
  SchemaIcon,
  TableIcon,
} from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PreviewSkeleton } from "@/components/lakewatch/PreviewSkeleton"
import { RunAsControl } from "@/components/lakewatch/RunAsControl"
import {
  ValidatedInput,
  ValidationIndicator,
  useValidationState,
} from "@/components/lakewatch/ValidatedInput"
import { WizardStepMenu } from "@/components/lakewatch/datasources-new/WizardStepMenu"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import {
  IntegrationTemplatePanel,
  IntegrationTemplatesField,
  useIntegrationTemplates,
} from "@/components/lakewatch/datasources-new/IntegrationTemplatesField"
import { UnityCatalogExplorerModal } from "@/components/lakewatch/datasources-new/UnityCatalogExplorerModal"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const WIZARD_STEPS = [
  "Source",
  "Parsers",
] as const

export type LakewatchDatasourceWizardKind =
  | "aws-s3"
  | "aws-sqs"
  | "existing-table"
  | "google-cloud-storage"
  | "uc-volume"
  | "azure-blob-storage"

function getSimpleWizardSteps(_kind: LakewatchDatasourceWizardKind) {
  return ["Source", "Parsers"] as const
}

const SIMPLE_WIZARD_CONFIG: Record<
  Exclude<LakewatchDatasourceWizardKind, "aws-s3">,
  { title: string; sourceHint?: string }
> = {
  "aws-sqs": {
    title: "Configure AWS SQS Queue datasource",
    sourceHint:
      "The URL of the SQS queue Lakewatch should consume messages from (e.g. https://sqs.us-east-1.amazonaws.com/123456789012/lakewatch-events).",
  },
  "existing-table": {
    title: "Use an existing table",
    sourceHint:
      "A Unity Catalog table or view to expose through the Lakewatch bronze view. Enter a fully qualified name in the format catalog.schema.table.",
  },
  "google-cloud-storage": {
    title: "Configure Google Cloud Storage datasource",
  },
  "uc-volume": {
    title: "Configure UC Volume datasource",
  },
  "azure-blob-storage": {
    title: "Configure Azure Blob Storage datasource",
  },
}

const GCS_SOURCE_LOCATION_SAMPLE =
  "https://console.cloud.google.com/bigquery?p=YOUR_PROJECT_ID&d=YOUR_DATASET_ID&t=YOUR_TABLE_ID&page=table"

const S3_SOURCE_LOCATION_SAMPLE = "s3://lakewatch-security-logs/"

const AZURE_SOURCE_LOCATION_SAMPLE =
  "https://portal.azure.com/#blade/Microsoft_Azure_Storage/ContainerMenuBlade/overview/storageAccountId/%2Fsubscriptions%2F00000000-0000-0000-0000-000000000000%2FresourceGroups%2Flakewatch-rg%2Fproviders%2FMicrosoft.Storage%2FstorageAccounts%2Flakewatchlogs%2FblobServices%2Fdefault%2Fcontainers%2Fsecurity-logs"

const SQS_SOURCE_LOCATION_SAMPLE =
  "https://sqs.us-east-1.amazonaws.com/123456789012/lakewatch-events"

function getCloudSourceLocationSample(kind: LakewatchDatasourceWizardKind) {
  if (kind === "azure-blob-storage") return AZURE_SOURCE_LOCATION_SAMPLE
  if (kind === "aws-sqs") return SQS_SOURCE_LOCATION_SAMPLE
  return GCS_SOURCE_LOCATION_SAMPLE
}

type VerificationState = "idle" | "validating" | "verified"

type UnwrapMode =
  | "none"
  | "lines"
  | "json"
  | "json-array"
  | "cloudwatch"
  | "xml"

type PreviewTableData = {
  columns: readonly string[]
  rows: readonly (readonly string[])[]
}

const AWS_REGIONS = [
  { id: "us-east-1", label: "US East (N. Virginia)" },
  { id: "us-east-2", label: "US East (Ohio)" },
  { id: "us-west-1", label: "US West (N. California)" },
  { id: "us-west-2", label: "US West (Oregon)" },
  { id: "ca-central-1", label: "Canada (Central)" },
  { id: "ca-west-1", label: "Canada West (Calgary)" },
  { id: "mx-central-1", label: "Mexico (Central)" },
  { id: "eu-central-1", label: "Europe (Frankfurt)" },
  { id: "eu-central-2", label: "Europe (Zurich)" },
  { id: "eu-west-1", label: "Europe (Ireland)" },
  { id: "eu-west-2", label: "Europe (London)" },
  { id: "eu-west-3", label: "Europe (Paris)" },
  { id: "eu-north-1", label: "Europe (Stockholm)" },
  { id: "eu-south-1", label: "Europe (Milan)" },
  { id: "eu-south-2", label: "Europe (Spain)" },
] as const

const RAW_PREVIEW_ROWS = [
  {
    time: "2025-02-24T05:51:59.000Z",
    eventId: "dce958ed-aead-4d36-be71-4cfdce6ab787e",
    eventName: "DescribeInstanceStatus",
  },
  {
    time: "2025-02-24T05:52:00.000Z",
    eventId: "86774789-fa34-4c3f-a2d3-c76ac2dea86f",
    eventName: "DescribeInstanceStatus",
  },
  {
    time: "2025-02-24T05:51:59.000Z",
    eventId: "f54af1b7-40f5-426a-955f-8619a14963f2",
    eventName: "DescribeInstances",
  },
  {
    time: "2025-02-24T05:51:59.000Z",
    eventId: "f54af1b7-40f5-426a-955f-8619a14963f2",
    eventName: "DescribeInstances",
  },
  {
    time: "2025-02-24T05:52:00.000Z",
    eventId: "86774789-fa34-4c3f-a2d3-c76ac2dea86f",
    eventName: "DescribeInstanceStatus",
  },
] as const

function buildRawPreviewCell(
  row: (typeof RAW_PREVIEW_ROWS)[number],
  region: string
) {
  return JSON.stringify({
    time: row.time,
    data: {
      awsRegion: region,
      eventCategory: "Management",
      eventID: row.eventId,
      eventName: row.eventName,
      eventSource: "ec2.amazonaws.com",
    },
  })
}

function getInputPreviewData(region: string): PreviewTableData {
  return {
    columns: ["data"],
    rows: RAW_PREVIEW_ROWS.map((row) => [buildRawPreviewCell(row, region)]),
  }
}

/**
 * Flattened "unwrapped events" view of the source records — the result of the
 * unwrapping step and the input a parser actually sees on step 2.
 */
function getUnwrappedInputData(): PreviewTableData {
  const copyFields = [...UNWRAP_COPY_FIELDS]
  const columns = ["eventName", "eventTime", "sourceIP", ...copyFields]
  const rows: string[][] = []
  for (const record of UNWRAP_PREVIEW_RECORDS) {
    for (const event of buildLogicalEvents(record, copyFields)) {
      rows.push(columns.map((column) => event[column] ?? ""))
      if (rows.length >= 12) break
    }
    if (rows.length >= 12) break
  }
  return { columns, rows }
}

const UNWRAP_EVENT_NAMES = [
  "GetObject",
  "PutObject",
  "DeleteObject",
  "ListBucket",
  "HeadObject",
  "CopyObject",
  "GetBucketPolicy",
  "GetObjectAcl",
] as const

const UNWRAP_ACCOUNTS = ["123456789012", "210987654321", "456712389045"] as const
const UNWRAP_REGIONS = ["us-west-2", "us-east-1", "eu-west-1"] as const

type UnwrapEvent = {
  eventName: string
  eventTime: string
  sourceIP: string
}

type UnwrapSourceRecord = {
  accountId: string
  region: string
  bucket: string
  requestId: string
  Records: UnwrapEvent[]
}

const UNWRAP_SOURCE_RECORDS: UnwrapSourceRecord[] = Array.from({ length: 10 }, (_, i) => {
  const count = 14 + ((i * 3) % 9)
  return {
    accountId: UNWRAP_ACCOUNTS[i % UNWRAP_ACCOUNTS.length],
    region: UNWRAP_REGIONS[i % UNWRAP_REGIONS.length],
    bucket: `security-logs-${i + 1}`,
    requestId: `req-${(i + 1).toString().padStart(4, "0")}`,
    Records: Array.from({ length: count }, (_, j) => ({
      eventName: UNWRAP_EVENT_NAMES[(i + j) % UNWRAP_EVENT_NAMES.length],
      eventTime: `2025-02-24T05:${(51 + ((i + j) % 8)).toString().padStart(2, "0")}:0${j % 10}Z`,
      sourceIP: `10.0.${i}.${j + 1}`,
    })),
  }
})

// Fixed set of source fields propagated onto each logical event in the unwrap
// preview. (No longer user-configurable in the Unwrapping UI.)
const UNWRAP_COPY_FIELDS = ["accountId", "region"] as const

function buildLogicalEvents(
  record: UnwrapSourceRecord,
  copyFields: string[]
): Record<string, string>[] {
  const copied: Record<string, string> = {}
  for (const field of copyFields) {
    const value = (record as Record<string, unknown>)[field]
    if (typeof value === "string") copied[field] = value
  }
  return record.Records.map((event) => ({ ...event, ...copied }))
}

function formatAwsRegion(region: (typeof AWS_REGIONS)[number]) {
  return `${region.label} — ${region.id}`
}

const DATA_FORMATS = [
  {
    value: "json",
    label: "JSON",
    description: "JavaScript Object Notation, a lightweight data interchange format",
  },
  {
    value: "jsonl",
    label: "JSONL",
    description: "JSON Lines, every line is a separate JSON object",
  },
  {
    value: "parquet",
    label: "Parquet",
    description: "A columnar storage format optimized for analytics",
  },
  {
    value: "csv",
    label: "CSV",
    description: "Character-Separated Values, a simple tabular data format",
  },
  {
    value: "xml",
    label: "XML",
    description: "Extensible Markup Language, a markup language for structuring data",
  },
  {
    value: "text",
    label: "Text",
    description: "A plain text format where every line is a separate record",
  },
  {
    value: "wholetext",
    label: "WholeText",
    description: "A plain text format where the entire file is a single record",
  },
] as const

export function WizardDatasourceNameField({
  catalog,
  onCatalogChange,
  schema,
  onSchemaChange,
  name,
  onNameChange,
  onNameFocus,
}: {
  catalog: string
  onCatalogChange: (value: string) => void
  schema: string
  onSchemaChange: (value: string) => void
  name: string
  onNameChange: (value: string) => void
  /** Optional focus/click handler — used to auto-fill an example name. */
  onNameFocus?: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>Datasource name *</Label>
      <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-2">
        <Select value={catalog} onValueChange={onCatalogChange} disabled>
          <SelectTrigger className="w-full" aria-label="Catalog">
            <CatalogIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sec_sandbox">sec_sandbox</SelectItem>
            <SelectItem value="sec_dev">sec_dev</SelectItem>
            <SelectItem value="sec_stag">sec_stag</SelectItem>
          </SelectContent>
        </Select>
        <Select value={schema} onValueChange={onSchemaChange}>
          <SelectTrigger className="w-full" aria-label="Schema">
            <SchemaIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">default</SelectItem>
            <SelectItem value="bronze">bronze</SelectItem>
            <SelectItem value="production">production</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <DatasourceNavIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            aria-label="Datasource name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            onFocus={onNameFocus}
            onClick={onNameFocus}
            required
            className="pl-9"
          />
        </div>
      </div>
    </div>
  )
}

export function WizardFormatField({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="data-format">Format</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="data-format" className="w-full" aria-label="Format">
          <SelectValue placeholder="Select a format" />
        </SelectTrigger>
        <SelectContent position="popper">
          {DATA_FORMATS.map((format) => (
            <SelectItem
              key={format.value}
              value={format.value}
              description={format.description}
            >
              {format.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function VerificationIndicator({
  state,
  label,
}: {
  state: VerificationState
  label: string
}) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center" aria-live="polite">
      {state === "validating" ? (
        <LoaderCircle
          className="h-4 w-4 animate-spin text-muted-foreground"
          aria-label={`Verifying ${label}`}
        />
      ) : state === "verified" ? (
        <CheckCircleIcon
          className="h-4 w-4 text-[var(--success)]"
          ariaLabel={`${label} verified`}
        />
      ) : null}
    </span>
  )
}

function AwsRegionTypeahead({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [menuWidth, setMenuWidth] = React.useState<number>()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const selectedRegion = AWS_REGIONS.find((region) => region.id === value)
  const displayValue = selectedRegion ? formatAwsRegion(selectedRegion) : value

  const filteredRegions = AWS_REGIONS.filter((region) => {
    if (!value.trim() || selectedRegion) return true
    const haystack = formatAwsRegion(region).toLowerCase()
    return haystack.includes(value.trim().toLowerCase())
  })

  const updateMenuWidth = () => {
    setMenuWidth(containerRef.current?.offsetWidth)
  }

  React.useEffect(() => {
    updateMenuWidth()
    window.addEventListener("resize", updateMenuWidth)
    return () => window.removeEventListener("resize", updateMenuWidth)
  }, [])

  React.useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [open])

  return (
    <div ref={containerRef} className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative w-full">
            <Input
              id="aws-region"
              role="combobox"
              aria-controls="aws-region-options"
              aria-expanded={open}
              aria-autocomplete="list"
              value={displayValue}
              placeholder="us-east-1"
              autoComplete="off"
              onChange={(event) => {
                onValueChange(event.target.value)
                setOpen(true)
              }}
              onFocus={() => {
                updateMenuWidth()
                setOpen(true)
              }}
              onClick={() => {
                updateMenuWidth()
                setOpen(true)
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false)
                }
                if (event.key === "ArrowDown") {
                  updateMenuWidth()
                  setOpen(true)
                }
              }}
              className="pr-9"
            />
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="p-0"
          style={menuWidth ? { width: menuWidth } : undefined}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (containerRef.current?.contains(event.target as Node)) {
              event.preventDefault()
            }
          }}
        >
          <Command shouldFilter={false}>
            <CommandList id="aws-region-options" className="max-h-[264px]">
              <CommandEmpty>No regions found</CommandEmpty>
              <CommandGroup>
                {filteredRegions.map((region) => (
                  <CommandItem
                    key={region.id}
                    value={formatAwsRegion(region)}
                    onSelect={() => {
                      onValueChange(region.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === region.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{formatAwsRegion(region)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function WizardStepper({
  activeStep,
  steps = WIZARD_STEPS,
}: {
  activeStep: number
  steps?: readonly string[]
}) {
  return (
    <ol aria-label="Datasource setup progress" className="flex flex-col">
      {steps.map((label, index) => {
        const step = index + 1
        const active = step === activeStep
        const complete = step < activeStep

        return (
          <li key={label} className="flex flex-col">
            <div className="flex items-center gap-3.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                  active
                    ? "border-blue-400 bg-blue-400 text-white"
                    : complete
                      ? "border-blue-400 bg-blue-400/10 text-blue-400"
                    : "border-muted-foreground text-muted-foreground"
                )}
                aria-current={active ? "step" : undefined}
              >
                {complete ? <Check className="h-4 w-4" /> : step}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-sm",
                  active || complete
                    ? "font-semibold text-blue-400"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span className="ml-[13px] my-2 h-5 w-px bg-muted-foreground/60" aria-hidden />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function StepPanelHeader({
  step,
  title,
  description,
}: {
  step: number
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-24 shrink-0 flex-col justify-center gap-1 border-b border-input bg-muted px-6 py-4">
      <p className="text-sm font-semibold text-foreground">STEP {step}</p>
      <h2 className="text-lg font-semibold leading-6 text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function formatDateTime(date: Date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const yyyy = date.getFullYear()
  return `${mm}/${dd}/${yyyy}, ${formatTime(date)}`
}

function formatTime(date: Date) {
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours %= 12
  if (hours === 0) hours = 12
  return `${hours}:${minutes} ${ampm}`
}

function parseTime(text: string): { hours: number; minutes: number } | null {
  const match = text.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return null
  let hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  const meridiem = match[3]?.toUpperCase()
  if (meridiem === "PM" && hours < 12) hours += 12
  if (meridiem === "AM" && hours === 12) hours = 0
  return { hours, minutes }
}

function DateTimePicker({
  value,
  onChange,
}: {
  value: Date
  onChange: (date: Date) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [view, setView] = React.useState(() => ({
    year: value.getFullYear(),
    month: value.getMonth(),
  }))
  const [timeText, setTimeText] = React.useState(() => formatTime(value))

  React.useEffect(() => {
    setTimeText(formatTime(value))
  }, [value])

  const firstWeekday = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()

  const cells: { date: Date; inMonth: boolean }[] = []
  for (let i = 0; i < firstWeekday; i += 1) {
    const day = new Date(view.year, view.month, i - firstWeekday + 1)
    cells.push({ date: day, inMonth: false })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(view.year, view.month, day), inMonth: true })
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const next = new Date(view.year, view.month, daysInMonth + (cells.length - daysInMonth - firstWeekday) + 1)
    cells.push({ date: next, inMonth: next.getMonth() === view.month })
    if (cells.length >= 42) break
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  const commitDay = (day: Date) => {
    const next = new Date(day)
    next.setHours(value.getHours(), value.getMinutes(), 0, 0)
    onChange(next)
    setView({ year: day.getFullYear(), month: day.getMonth() })
  }

  const shiftMonth = (delta: number) => {
    setView((current) => {
      const base = new Date(current.year, current.month + delta, 1)
      return { year: base.getFullYear(), month: base.getMonth() }
    })
  }

  const applyRelative = (daysAgo: number) => {
    const next = new Date()
    next.setDate(next.getDate() - daysAgo)
    onChange(next)
    setView({ year: next.getFullYear(), month: next.getMonth() })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-8 items-center gap-2 rounded border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring"
        >
          <span className="text-muted-foreground">Date:</span>
          <span className="text-foreground">{formatDateTime(value)}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            {MONTH_LABELS[view.month]} {view.year}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeftIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
            >
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label, index) => (
            <span
              key={`${label}-${index}`}
              className="flex h-8 items-center justify-center text-hint text-muted-foreground"
            >
              {label}
            </span>
          ))}
          {cells.map(({ date, inMonth }) => {
            const selected = isSameDay(date, value)
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => commitDay(date)}
                className={cn(
                  "flex h-8 items-center justify-center rounded text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-primary",
                  selected
                    ? "bg-primary/10 font-semibold text-primary ring-1 ring-primary"
                    : inMonth
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                )}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button type="button" variant="default" size="sm" onClick={() => applyRelative(0)}>
            Now
          </Button>
          <Button type="button" variant="default" size="sm" onClick={() => applyRelative(1)}>
            Yesterday
          </Button>
          <Button type="button" variant="default" size="sm" onClick={() => applyRelative(7)}>
            7 days ago
          </Button>
          <Button type="button" variant="default" size="sm" onClick={() => applyRelative(30)}>
            30 days ago
          </Button>
        </div>

        <div className="relative mt-3">
          <Input
            aria-label="Time"
            value={timeText}
            onChange={(event) => setTimeText(event.target.value)}
            onBlur={() => {
              const parsed = parseTime(timeText)
              if (parsed) {
                const next = new Date(value)
                next.setHours(parsed.hours, parsed.minutes, 0, 0)
                onChange(next)
              } else {
                setTimeText(formatTime(value))
              }
            }}
            className="pr-9"
          />
          <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function WizardDataTimeRangeField() {
  const [mode, setMode] = React.useState("all")
  const [date, setDate] = React.useState(() => new Date(2026, 6, 12, 0, 0))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label>Ingestion window</Label>
        <p className="text-hint text-muted-foreground">
          Limit ingestion to files modified after a specific date, or ingest all available data.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="w-fit min-w-[110px]" aria-label="Ingestion window mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All data</SelectItem>
            <SelectItem value="modified-after">Data modified after</SelectItem>
          </SelectContent>
        </Select>
        {mode === "modified-after" ? (
          <DateTimePicker value={date} onChange={setDate} />
        ) : null}
      </div>
    </div>
  )
}

const SCHEDULE_CADENCE_LABELS: Record<string, string> = {
  "at-least-every": "At least every",
  every: "Every",
  cron: "Cron",
}

const SCHEDULE_UNIT_LABELS: Record<string, string> = {
  minutes: "minutes",
  hours: "hours",
  days: "days",
}

export function WizardProcessingScheduleField() {
  const [cadence, setCadence] = React.useState("at-least-every")
  const [interval, setInterval] = React.useState("10")
  const [unit, setUnit] = React.useState("minutes")
  const [editing, setEditing] = React.useState(false)

  const scheduleLabel = `${SCHEDULE_CADENCE_LABELS[cadence] ?? cadence} ${interval} ${
    SCHEDULE_UNIT_LABELS[unit] ?? unit
  }`

  return (
    <div className="flex flex-col gap-2">
      <Label>Processing schedule</Label>
      <div className="flex flex-wrap items-center gap-2">
        {editing ? (
          <>
            <Select value={cadence} onValueChange={setCadence}>
              <SelectTrigger className="w-[151px]" aria-label="Schedule cadence">
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
              onChange={(event) => setInterval(event.target.value)}
              className="w-[65px]"
            />
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="w-[151px]" aria-label="Schedule unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Done editing processing schedule"
              onClick={() => setEditing(false)}
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
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Edit processing schedule"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export function WizardComputeModeField({ bare = false }: { bare?: boolean } = {}) {
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState("standard")

  const radios = (
    <RadioGroup value={mode} onValueChange={setMode} className="gap-2">
      <label
        htmlFor="compute-mode-standard"
        className="flex cursor-pointer items-center gap-2"
      >
        <RadioGroupItem value="standard" id="compute-mode-standard" />
        <span className="text-sm text-foreground">Standard</span>
      </label>
      <label
        htmlFor="compute-mode-performance"
        className="flex cursor-pointer items-center gap-2"
      >
        <RadioGroupItem value="performance" id="compute-mode-performance" />
        <span className="text-sm text-foreground">Performance optimized</span>
      </label>
    </RadioGroup>
  )

  if (bare) {
    return (
      <div className="flex flex-col gap-2">
        <Label>Compute mode</Label>
        {radios}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto self-start gap-1 p-0 !px-0"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        Compute mode (optional)
        <ChevronDownIcon
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </Button>
      {open ? radios : null}
    </div>
  )
}

export function WizardAnnotationsField({ bare = false }: { bare?: boolean } = {}) {
  const [open, setOpen] = React.useState(bare)
  const [rows, setRows] = React.useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ])

  const updateRow = (index: number, field: "key" | "value", value: string) => {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  const addRow = () => {
    setRows((current) => [...current, { key: "", value: "" }])
  }

  const removeRow = (index: number) => {
    setRows((current) => current.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      {bare ? null : (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto self-start gap-1 p-0 !px-0"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          Annotations (optional)
          <ChevronDownIcon
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </Button>
      )}
      {open ? (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <span className="text-hint text-muted-foreground">Key</span>
            <span className="text-hint text-muted-foreground">Value</span>
            <span className="w-8" aria-hidden />
          </div>
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"
            >
              <Input
                aria-label={`Annotation key ${index + 1}`}
                value={row.key}
                onChange={(event) => updateRow(index, "key", event.target.value)}
                placeholder="Key"
              />
              <Input
                aria-label={`Annotation value ${index + 1}`}
                value={row.value}
                onChange={(event) => updateRow(index, "value", event.target.value)}
                placeholder="Value"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove annotation ${index + 1}`}
                onClick={() => removeRow(index)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Add annotation"
            className="self-start"
            onClick={addRow}
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function RawDataPreview({
  region,
  sourceName,
}: {
  region: string
  sourceName?: string
}) {
  return (
    <div>
      <section
        aria-label="Source records"
        className="min-w-0 overflow-hidden border-y border-input"
      >
        <div className="flex h-8 min-w-0 items-center gap-1 px-2">
          <span className="text-sm font-semibold text-foreground">Input</span>
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          <TableIcon className="h-4 w-4 text-primary" />
          <span className="min-w-0 truncate text-sm text-foreground">
            {sourceName?.trim() || "Source records"}
          </span>
          <span className="ml-2 whitespace-nowrap text-hint text-muted-foreground">
            {RAW_PREVIEW_ROWS.length} records
          </span>
        </div>
        <div className="flex h-6 items-center border-y border-input px-2">
          <span className="text-sm font-semibold leading-5 text-foreground">data</span>
        </div>
        <div className="overflow-hidden">
          {RAW_PREVIEW_ROWS.map((row, index) => (
            <div
              key={`${row.eventId}-${index}`}
              className="flex h-6 min-w-0 items-center border-b border-input"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Expand preview row ${index + 1}`}
                className="shrink-0"
              >
                <ChevronDownIcon className="h-4 w-4 -rotate-90 text-muted-foreground" />
              </Button>
              <span className="min-w-0 flex-1 truncate pr-2 text-hint leading-4 text-foreground">
                {buildRawPreviewCell(row, region)}
              </span>
            </div>
          ))}
        </div>
      </section>
      <div className="flex h-6 items-center gap-1.5 border-b border-input px-3 text-hint text-muted-foreground">
        <span className="text-foreground">{RAW_PREVIEW_ROWS.length} records</span>
        <span className="mx-1 text-muted-foreground">·</span>
        <span className="text-muted-foreground">Raw events, unparsed</span>
      </div>
    </div>
  )
}

const RAW_PREVIEW_SKELETON_WIDTHS = [
  "w-[72%]",
  "w-[54%]",
  "w-[63%]",
  "w-[46%]",
  "w-[68%]",
  "w-[50%]",
]

export function RawDataPreviewSkeleton() {
  return (
    <div className="skeleton-sweep overflow-hidden" aria-hidden>
      <div className="flex h-6 items-center border-b border-input px-2">
        <Skeleton className="h-3 w-10" />
      </div>
      <div className="overflow-hidden">
        {RAW_PREVIEW_SKELETON_WIDTHS.map((width, index) => (
          <div
            key={index}
            className="flex h-6 min-w-0 items-center gap-2 border-b border-input px-2"
          >
            <Skeleton className="size-3 shrink-0 rounded" />
            <Skeleton className={cn("h-3", width)} />
          </div>
        ))}
      </div>
    </div>
  )
}

const EXISTING_TABLE_SOURCE_SAMPLE = "lakewatch.default.audit_logs_7830bcf"

/** Derives a bronze view name (e.g. `bronze_audit_logs_view`) from a table path. */
function deriveViewTableName(location: string) {
  const table = location.split(".").pop() ?? location
  const slug = table
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
  return slug ? `bronze_${slug}_view` : ""
}

const EXISTING_TABLE_PREVIEW_DATA: PreviewTableData = {
  columns: ["event_time", "event_id", "user_identity", "action", "resource"],
  rows: [
    ["2025-10-05 10:18:36", "e-9f31a2c7", "beau.trincia@databricks.com", "GetObject", "audit-logs-7830bcf"],
    ["2025-10-05 10:18:31", "e-5b7742de", "ci-deploy-bot@databricks.com", "PutObject", "audit-logs-7830bcf"],
    ["2025-10-05 10:18:22", "e-1c9930aa", "svc-ingest@databricks.com", "ListBucket", "audit-logs-7830bcf"],
    ["2025-10-05 10:18:04", "e-77aa21b9", "beau.trincia@databricks.com", "GetObject", "audit-logs-7830bcf"],
    ["2025-10-05 10:17:59", "e-3ef00c12", "svc-reader@databricks.com", "GetObject", "audit-logs-7830bcf"],
  ],
}

function ExistingTablePreviewPane({
  tableName,
  onClose,
}: {
  tableName: string
  onClose: () => void
}) {
  const [loading, setLoading] = React.useState(true)
  const trimmed = tableName.trim()
  const hasTable = trimmed.length > 0

  React.useEffect(() => {
    if (!trimmed) return
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [trimmed])

  const rowCount = EXISTING_TABLE_PREVIEW_DATA.rows.length

  return (
    <>
      <div className="flex h-8 items-center justify-between border-y border-input px-2">
        <div className="flex min-w-0 items-center gap-1">
          <span className="text-sm font-semibold text-foreground">Input</span>
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          <TableIcon className="h-4 w-4 text-primary" />
          <span className="min-w-0 truncate text-sm text-foreground">
            {hasTable ? trimmed : "Data preview"}
          </span>
          {hasTable ? (
            <span className="ml-2 whitespace-nowrap text-hint text-muted-foreground">
              {rowCount} records
            </span>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close data preview"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      {hasTable ? (
        loading ? (
          <PreviewTableSkeleton rows={5} />
        ) : (
          <PreviewDataTable data={EXISTING_TABLE_PREVIEW_DATA} className="min-w-full" />
        )
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 px-4 py-6 text-center">
          <TableIcon className="h-9 w-9 text-muted-foreground" />
          <p className="text-sm leading-5 text-foreground">
            Configure a table to see a preview
          </p>
        </div>
      )}
    </>
  )
}

function PreviewDataTable({
  data,
  className,
  selectedRowIndex,
  onRowSelect,
}: {
  data: PreviewTableData
  className: string
  selectedRowIndex?: number | null
  onRowSelect?: (rowIndex: number) => void
}) {
  return (
    <div className="h-[144px] overflow-hidden">
      <Table className={cn("table-fixed", className)}>
        <TableHeader>
          <TableRow className="h-6 hover:bg-transparent">
            <TableHead className="h-6 w-8 border-r border-input px-2 py-0 text-hint leading-4" />
            {data.columns.map((column) => (
              <TableHead
                key={column}
                className="h-6 min-w-[150px] border-r border-input px-2 py-0 text-hint leading-4"
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              data-state={selectedRowIndex === rowIndex ? "selected" : undefined}
              aria-selected={selectedRowIndex === rowIndex}
              tabIndex={onRowSelect ? 0 : undefined}
              className={cn(
                "h-6",
                onRowSelect &&
                  "cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:outline-none"
              )}
              onClick={onRowSelect ? () => onRowSelect(rowIndex) : undefined}
              onKeyDown={
                onRowSelect
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        onRowSelect(rowIndex)
                      }
                    }
                  : undefined
              }
            >
              <TableCell className="h-6 w-8 border-r border-input px-2 py-0 text-hint leading-4 text-muted-foreground">
                {rowIndex + 1}
              </TableCell>
              {row.map((value, cellIndex) => (
                <TableCell
                  key={`${rowIndex}-${data.columns[cellIndex]}`}
                  className="h-6 max-w-[220px] truncate border-r border-input px-2 py-0 text-hint leading-4"
                  title={value}
                >
                  {value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const PREVIEW_SKELETON_ROW_WIDTHS = [
  "w-3/4",
  "w-1/2",
  "w-2/3",
  "w-5/6",
  "w-2/5",
  "w-4/6",
]

/**
 * Body-only table skeleton (no pane header) that occupies the same 144px table
 * area as {@link PreviewDataTable}, so one pane can reload while the other — and
 * both pane headers — stay put.
 */
function PreviewTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden className="skeleton-sweep h-[144px] overflow-hidden">
      <div className="flex h-6 items-center border-b border-input px-2">
        <Skeleton className="h-3 w-16" />
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex h-6 min-w-0 items-center gap-2 border-b border-input px-2"
        >
          <Skeleton className="size-3 shrink-0 rounded" />
          <Skeleton
            className={cn(
              "h-3",
              PREVIEW_SKELETON_ROW_WIDTHS[rowIndex % PREVIEW_SKELETON_ROW_WIDTHS.length]
            )}
          />
        </div>
      ))}
    </div>
  )
}

function PreviewPanelActions() {
  return (
    <div className="ml-auto flex shrink-0 items-center">
      <Button variant="ghost" size="icon-xs" aria-label="Search preview">
        <Search className="h-4 w-4 text-muted-foreground" />
      </Button>
      <Button variant="ghost" size="icon-xs" aria-label="Filter preview">
        <Filter className="h-4 w-4 text-muted-foreground" />
      </Button>
      <Button variant="ghost" size="icon-xs" aria-label="Preview options">
        <MoreVertical className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  )
}

function SchemaRowDrawer({
  schema,
  data,
  rowIndex,
  onRowChange,
  onClose,
}: {
  schema: string
  data: PreviewTableData
  rowIndex: number | null
  onRowChange: (rowIndex: number) => void
  onClose: () => void
}) {
  const [showSystemFields, setShowSystemFields] = React.useState(true)
  const open = rowIndex !== null
  const resolvedRowIndex = rowIndex ?? 0
  const row = data.rows[resolvedRowIndex] ?? data.rows[0]
  const schemaFields = data.columns.map((field, index) => ({
    field,
    value: row?.[index] ?? "—",
  }))
  const timeField = schemaFields.find(({ field }) =>
    ["eventTime", "time", "requestTime", "start"].includes(field)
  )
  const systemFields = [
    { field: "_event_time", value: timeField?.value ?? "2024-03-15T14:23:41Z" },
    { field: "_log_type", value: schema },
    { field: "_parse_time", value: "2024-03-15T14:23:42.184Z" },
    { field: "_row_id", value: `lw_${schema.replaceAll(".", "_").toLowerCase()}_${resolvedRowIndex + 1}` },
    { field: "_source_label", value: "lakewatch-account-us-east-1" },
  ]
  const visibleFields = showSystemFields ? [...systemFields, ...schemaFields] : schemaFields

  const copyRowJson = () => {
    const json = Object.fromEntries(visibleFields.map(({ field, value }) => [field, value]))
    void navigator.clipboard.writeText(JSON.stringify(json, null, 2))
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        overlayClassName="bg-transparent"
        className="w-[336px] gap-0 border-input p-0 sm:max-w-[336px]"
      >
        <SheetHeader className="flex h-12 shrink-0 flex-row items-center justify-end gap-1 border-b border-input px-3 py-2">
          <SheetTitle className="mr-1 text-sm">
            {resolvedRowIndex + 1} of {data.rows.length}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Field values for row {resolvedRowIndex + 1} of {schema}
          </SheetDescription>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Show previous row"
            disabled={resolvedRowIndex === 0}
            onClick={() => onRowChange(resolvedRowIndex - 1)}
          >
            <ChevronLeftIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Show next row"
            disabled={resolvedRowIndex === data.rows.length - 1}
            onClick={() => onRowChange(resolvedRowIndex + 1)}
          >
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" aria-label="Close row details" onClick={onClose}>
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </SheetHeader>

        <div className="shrink-0 border-b border-input px-4 py-4">
          <dl className="flex flex-col gap-3">
            <div>
              <dt className="text-hint font-semibold uppercase text-muted-foreground">Time</dt>
              <dd className="text-sm text-foreground">
                {timeField?.value ?? "2024-03-15T14:23:41Z"}
              </dd>
            </div>
            <div>
              <dt className="text-hint font-semibold uppercase text-muted-foreground">
                Description
              </dt>
              <dd className="text-sm text-foreground">{schema} parsed event</dd>
            </div>
          </dl>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-input px-3 py-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="show-system-fields" className="font-normal">
              Show system fields
            </Label>
            <Switch
              id="show-system-fields"
              size="sm"
              checked={showSystemFields}
              onCheckedChange={setShowSystemFields}
            />
          </div>
          <Button variant="default" size="xs" onClick={copyRowJson}>
            Copy JSON
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <dl className="flex flex-col gap-2">
            {visibleFields.map(({ field, value }) => (
              <div key={field} className="grid grid-cols-[112px_minmax(0,1fr)] gap-2">
                <dt className="truncate text-sm text-primary" title={field}>
                  {field}
                </dt>
                <dd className="break-all text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </SheetContent>
    </Sheet>
  )
}

type PreviewField = { name: string; type: string }
type ActiveTemplatePreview = { name: string; fields: PreviewField[] }

function sampleCellValue(field: PreviewField, rowIndex: number): string {
  const name = field.name.toLowerCase()
  const type = field.type.toLowerCase()
  if (type.includes("time") || name.includes("time") || name.includes("date")) {
    return `2025-02-24T05:${(51 + rowIndex).toString().padStart(2, "0")}:0${rowIndex % 10}Z`
  }
  if (type === "object") return "{ … }"
  if (type.includes("bool")) return rowIndex % 2 === 0 ? "true" : "false"
  if (
    type.includes("int") ||
    type.includes("number") ||
    type.includes("long") ||
    type.includes("float") ||
    type.includes("double")
  ) {
    return `${(rowIndex + 1) * 7}`
  }
  if (name.includes("email")) return `user${rowIndex + 1}@acme.com`
  if (name === "ip" || name.includes("ipaddress") || name.includes("sourceip") || name.includes("addr")) {
    return `10.0.${rowIndex}.${rowIndex + 1}`
  }
  if (name.includes("action")) {
    return ["CreateUser", "AssumeRole", "GetObject", "ConsoleLogin"][rowIndex % 4]
  }
  if (name.includes("outcome") || name.includes("status") || name.includes("result")) {
    return rowIndex % 3 === 0 ? "failure" : "success"
  }
  if (name.includes("user") || name.includes("actor")) {
    return ["a.chen", "j.martinez", "s.patel", "admin"][rowIndex % 4]
  }
  if (name.includes("region")) return ["us-west-2", "us-east-1", "eu-west-1"][rowIndex % 3]
  if (name.includes("account")) return "123456789012"
  if (name.includes("id")) return `evt-${1000 + rowIndex}`
  return `${field.name}_${rowIndex + 1}`
}

function buildTemplateOutputData(
  template: ActiveTemplatePreview,
  rowCount: number
): PreviewTableData {
  const columns = template.fields.map((field) => field.name)
  const safeColumns = columns.length ? columns : ["value"]
  const rows = Array.from({ length: rowCount }, (_, rowIndex) =>
    safeColumns.map((columnName, colIndex) => {
      const field = template.fields[colIndex] ?? { name: columnName, type: "string" }
      return sampleCellValue(field, rowIndex)
    })
  )
  return { columns: safeColumns, rows }
}

function SchemaSplitPreview({
  region,
  templates,
  unwrapConfigured,
}: {
  region: string
  templates: ActiveTemplatePreview[]
  unwrapConfigured: boolean
}) {
  const [inputMode, setInputMode] = React.useState<"unwrapped" | "raw">(
    unwrapConfigured ? "unwrapped" : "raw"
  )
  const [outputIndex, setOutputIndex] = React.useState(0)
  const [selectedRowIndex, setSelectedRowIndex] = React.useState<number | null>(null)
  const [inputLoading, setInputLoading] = React.useState(true)
  const [outputLoading, setOutputLoading] = React.useState(true)
  const [leftPct, setLeftPct] = React.useState(41)
  const splitRef = React.useRef<HTMLDivElement>(null)
  const draggingRef = React.useRef(false)

  // Default the input to the unwrapped view once an unwrapping is applied.
  React.useEffect(() => {
    setInputMode(unwrapConfigured ? "unwrapped" : "raw")
  }, [unwrapConfigured])

  const safeOutputIndex = Math.min(
    outputIndex,
    Math.max(0, templates.length - 1)
  )
  const currentOutput = templates[safeOutputIndex] ?? null

  // Sweep a skeleton over the input pane on first load and whenever the input
  // view is switched (raw ↔ unwrapped). The output re-derives from the input, so
  // it reloads alongside an input change.
  React.useEffect(() => {
    setInputLoading(true)
    setOutputLoading(true)
    const timer = setTimeout(() => {
      setInputLoading(false)
      setOutputLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [inputMode])

  // Changing the parser only reloads the output pane — the input stays put.
  React.useEffect(() => {
    setOutputLoading(true)
    const timer = setTimeout(() => setOutputLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [safeOutputIndex, currentOutput?.name])

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  const handleResizeMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !splitRef.current) return
    const rect = splitRef.current.getBoundingClientRect()
    const pct = ((event.clientX - rect.left) / rect.width) * 100
    setLeftPct(Math.min(80, Math.max(20, pct)))
  }

  const handleResizeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }

  const inputData =
    inputMode === "unwrapped" ? getUnwrappedInputData() : getInputPreviewData(region)
  const inputLabel = inputMode === "unwrapped" ? "Unwrapped events" : "Raw data"
  const outputData: PreviewTableData = currentOutput
    ? buildTemplateOutputData(currentOutput, inputData.rows.length)
    : { columns: ["value"], rows: [] }
  const outputLabel = currentOutput?.name ?? "Parser output"

  return (
    <>
    <div
      ref={splitRef}
      className="relative grid h-[176px] overflow-hidden border-y border-input"
      style={{ gridTemplateColumns: `${leftPct}% ${100 - leftPct}%` }}
    >
      <section aria-label="Input preview" className="min-w-0 border-r border-input">
        <div className="flex h-8 min-w-0 items-center gap-1 px-2">
          <span className="text-sm font-semibold text-foreground">Input</span>
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          <TableIcon className="h-4 w-4 text-primary" />
          {unwrapConfigured ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-1.5 text-primary hover:text-blue-700"
                  aria-label="Select input view"
                >
                  <span className="max-w-[160px] truncate text-sm">{inputLabel}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuRadioGroup
                  value={inputMode}
                  onValueChange={(value) =>
                    setInputMode(value as "unwrapped" | "raw")
                  }
                >
                  <DropdownMenuRadioItem value="unwrapped">
                    Unwrapped events
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="raw">Raw data</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-sm text-foreground">{inputLabel}</span>
          )}
          <span className="ml-2 whitespace-nowrap text-hint text-muted-foreground">
            {inputData.rows.length} records, {inputData.columns.length} column
            {inputData.columns.length === 1 ? "" : "s"}
          </span>
          <PreviewPanelActions />
        </div>
        {inputLoading ? (
          <PreviewTableSkeleton />
        ) : (
          <PreviewDataTable data={inputData} className="min-w-[650px]" />
        )}
      </section>

      <section aria-label={`${outputLabel} output preview`} className="min-w-0">
        <div className="flex h-8 min-w-0 items-center gap-1 px-2">
          <TableIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Output</span>
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          {templates.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-1.5 text-primary hover:text-blue-700"
                  aria-label="Select parser output"
                >
                  <span className="max-w-[200px] truncate text-sm">{outputLabel}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuRadioGroup
                  value={outputLabel}
                  onValueChange={(value) => {
                    const index = templates.findIndex(
                      (template) => template.name === value
                    )
                    if (index >= 0) setOutputIndex(index)
                  }}
                >
                  {templates.map((template) => (
                    <DropdownMenuRadioItem key={template.name} value={template.name}>
                      {template.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="max-w-[220px] truncate text-sm font-semibold text-foreground">
              {outputLabel}
            </span>
          )}
          <span className="ml-2 whitespace-nowrap text-hint text-muted-foreground">
            {outputData.rows.length} records, {outputData.columns.length} columns
          </span>
          <PreviewPanelActions />
        </div>
        {outputLoading ? (
          <PreviewTableSkeleton />
        ) : (
          <PreviewDataTable
            data={outputData}
            className="min-w-[1120px]"
            selectedRowIndex={selectedRowIndex}
            onRowSelect={setSelectedRowIndex}
          />
        )}
      </section>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize input and output panes"
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        className="group absolute top-0 bottom-0 z-10 flex w-3 -translate-x-1/2 cursor-col-resize items-stretch justify-center"
        style={{ left: `${leftPct}%` }}
      >
        <span className="w-px bg-transparent transition-colors group-hover:bg-primary" />
      </div>
    </div>
      <SchemaRowDrawer
        schema={outputLabel}
        data={outputData}
        rowIndex={selectedRowIndex}
        onRowChange={setSelectedRowIndex}
        onClose={() => setSelectedRowIndex(null)}
      />
    </>
  )
}

const UNWRAP_PREVIEW_RECORDS = UNWRAP_SOURCE_RECORDS.slice(0, 5)
const UNWRAP_PREVIEW_TOTAL_EVENTS = UNWRAP_PREVIEW_RECORDS.reduce(
  (total, record) => total + record.Records.length,
  0
)

function EventUnwrapPreview({
  topLevelField,
  sourceName,
  instant = false,
}: {
  topLevelField?: string
  sourceName?: string
  instant?: boolean
}) {
  const copyFields = [...UNWRAP_COPY_FIELDS]
  const eventArrayPath = topLevelField?.trim() || "Records"
  const [recordIndex, setRecordIndex] = React.useState(0)
  const [loading, setLoading] = React.useState(!instant)

  React.useEffect(() => {
    if (instant) return
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [instant])

  const safeRecordIndex = Math.min(recordIndex, UNWRAP_PREVIEW_RECORDS.length - 1)
  const record = UNWRAP_PREVIEW_RECORDS[safeRecordIndex]
  const events = buildLogicalEvents(record, copyFields)

  const sourceData: PreviewTableData = {
    columns: [eventArrayPath, "accountId", "region", "bucket", "requestId"],
    rows: UNWRAP_PREVIEW_RECORDS.map((item) => [
      `[ ${item.Records.length} events ]`,
      item.accountId,
      item.region,
      item.bucket,
      item.requestId,
    ]),
  }

  const eventColumns = ["eventName", "eventTime", "sourceIP", ...copyFields]
  const eventData: PreviewTableData = {
    columns: eventColumns,
    rows: events.map((event) =>
      eventColumns.map((column) => event[column] ?? "")
    ),
  }

  if (loading) {
    return <PreviewSkeleton className="h-[176px]" panes={2} rows={5} />
  }

  return (
    <div>
      <div className="grid grid-cols-2 overflow-hidden border-y border-input">
        <section aria-label="Source records" className="min-w-0 border-r border-input">
          <div className="flex h-8 min-w-0 items-center gap-1 px-2">
            <span className="text-sm font-semibold text-foreground">Input</span>
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            <TableIcon className="h-4 w-4 text-primary" />
            <span className="min-w-0 truncate text-sm text-foreground">
              {sourceName?.trim() || "Source records"}
            </span>
            <span className="ml-2 whitespace-nowrap text-hint text-muted-foreground">
              {UNWRAP_PREVIEW_RECORDS.length} records
            </span>
          </div>
          <PreviewDataTable
            data={sourceData}
            className="min-w-[560px]"
            selectedRowIndex={safeRecordIndex}
            onRowSelect={setRecordIndex}
          />
        </section>

        <section aria-label="Logical events" className="min-w-0">
          <div className="flex h-8 min-w-0 items-center gap-1 px-2">
            <TableIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Output</span>
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Logical events</span>
            <span className="ml-2 whitespace-nowrap text-hint text-muted-foreground">
              from {record.requestId} · {events.length} events
            </span>
          </div>
          <PreviewDataTable data={eventData} className="min-w-[720px]" />
        </section>
      </div>
      <div className="flex h-6 items-center gap-1.5 border-b border-input px-3 text-hint text-muted-foreground">
        <span className="text-foreground">
          {UNWRAP_PREVIEW_RECORDS.length} source records
        </span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="text-foreground">{UNWRAP_PREVIEW_TOTAL_EVENTS} logical events</span>
        <span className="mx-1 text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          selected record {record.requestId} → {events.length} events
        </span>
      </div>
    </div>
  )
}

/** Figma 2492:126609 form adapted to dark mode with stepper 2499:117853. */
export function LakewatchAwsS3WizardView({
  kind = "aws-s3",
}: {
  kind?: LakewatchDatasourceWizardKind
}) {
  const router = useRouter()
  const [activeStep, setActiveStep] = React.useState(1)
  const [sourceLocation, setSourceLocation] = React.useState("")
  const [viewTableName, setViewTableName] = React.useState("")
  const [primaryKeyColumns, setPrimaryKeyColumns] = React.useState<string[]>([""])
  const [catalogPickerOpen, setCatalogPickerOpen] = React.useState(false)
  const [s3RunAs, setS3RunAs] = React.useState("beau.trincia@databricks.com")
  const [sqsAuth, setSqsAuth] = React.useState("default")
  const [dataFormat, setDataFormat] = React.useState("")
  const [dataSampleLocation, setDataSampleLocation] = React.useState("")
  const [sampleVerification, setSampleVerification] =
    React.useState<VerificationState>("idle")
  const [previewMode, setPreviewMode] = React.useState<"source" | "sample">("source")
  const [previewConfigOpen, setPreviewConfigOpen] = React.useState(false)
  const [draftPreviewMode, setDraftPreviewMode] =
    React.useState<"source" | "sample">("source")
  const [draftSample, setDraftSample] = React.useState("")
  const [awsRegion, setAwsRegion] = React.useState("")
  const [regionVerification, setRegionVerification] =
    React.useState<VerificationState>("idle")
  const [advancedOpen, setAdvancedOpen] = React.useState(false)
  const [managedNotifications, setManagedNotifications] = React.useState(false)
  const [unwrapping, setUnwrapping] = React.useState<UnwrapMode>("none")
  const [topLevelField, setTopLevelField] = React.useState("")
  const [jsonArrayApplied, setJsonArrayApplied] = React.useState(false)
  const [unwrapLoading, setUnwrapLoading] = React.useState(false)
  const [unwrapReady, setUnwrapReady] = React.useState(false)
  const unwrapLoadingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [previewExpanded, setPreviewExpanded] = React.useState(true)
  const [previewVisible, setPreviewVisible] = React.useState(true)
  const templateController = useIntegrationTemplates()
  const pendingSchemas: string[] = []
  const [catalog, setCatalog] = React.useState("sec_dev")
  const [schema, setSchema] = React.useState("default")
  const [datasourceName, setDatasourceName] = React.useState("lakewatch-account-us-west-2")
  const sampleVerificationTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const regionVerificationTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const prepareEventsRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const autoPreviewKeyRef = React.useRef<string | null>(null)
  const [contentWidth, setContentWidth] = React.useState(0)

  React.useEffect(() => {
    const el = contentRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setContentWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const previewReady = sampleVerification === "verified"
  const previewLoading = sampleVerification === "validating"
  const schemasReady =
    templateController.selectedNames.length > 0 || pendingSchemas.length > 0
  // "No unwrapping" keeps the raw preview. Every other option applies an
  // unwrapping: non-JSON-Array options after a brief loading wheel (unwrapReady);
  // JSON Array once its top-level field is applied.
  const unwrapConfigured =
    unwrapping !== "none" &&
    (unwrapping === "json-array" ? jsonArrayApplied : unwrapReady)
  // The selected parsers, shaped for the split preview's output dropdown.
  const selectedTemplates: ActiveTemplatePreview[] = templateController.selectedIds
    .map((id) => templateController.templateById.get(id))
    .filter((template): template is NonNullable<typeof template> => Boolean(template))
    .map((template) => ({ name: template.name, fields: template.fields }))
  // Once parsers are selected the split preview (unwrapped input → parsed
  // output) takes over. Before that, applying an unwrapping shows the
  // side-by-side unwrap preview.
  const showSplitPreview = activeStep === 2 && schemasReady
  const showUnwrapPreview =
    activeStep === 2 && !schemasReady && unwrapConfigured
  const templatePanelOpen = activeStep === 2 && templateController.panelOpen
  // Collapse the vertical stepper into a compact "Step X / N" button whenever the
  // available width is tight (e.g. the Genie code panel is open) or the template
  // detail panel is shown, so the step form keeps enough room.
  const compact = contentWidth > 0 && contentWidth < 900
  const stepperCollapsed = templatePanelOpen || compact
  const isSqs = kind === "aws-sqs"
  const isS3 = kind === "aws-s3"
  const previewSamplePlaceholder = isSqs
    ? "s3://my-bucket/sqs-sample/"
    : kind === "google-cloud-storage"
      ? "gs://my-bucket/logs/sample/"
      : kind === "azure-blob-storage"
        ? "abfss://container@account.dfs.core.windows.net/logs/sample/"
        : kind === "uc-volume"
          ? "/Volumes/catalog/schema/volume/sample/"
          : "s3://my-bucket/logs/sample/"
  const previewSampleFill = isSqs
    ? "s3://lakewatch-security-logs/sqs-sample/"
    : kind === "google-cloud-storage"
      ? "gs://lakewatch-security-logs/sample/"
      : kind === "azure-blob-storage"
        ? "abfss://security-logs@lakewatchlogs.dfs.core.windows.net/sample/"
        : kind === "uc-volume"
          ? "/Volumes/lakewatch/default/raw_logs/sample/"
          : "s3://lakewatch-security-logs/"
  const previewRegion = isSqs && awsRegion.trim() ? awsRegion : "us-west-2"
  const isSimpleWizard = kind !== "aws-s3"
  const isExistingTable = kind === "existing-table"
  const sourceLocationValidation = useValidationState(sourceLocation)
  const viewTableAutofillRef = React.useRef("")
  React.useEffect(() => {
    if (!isExistingTable) return
    const loc = sourceLocation.trim()
    if (
      sourceLocationValidation === "verified" &&
      loc &&
      viewTableAutofillRef.current !== loc &&
      !viewTableName.trim()
    ) {
      viewTableAutofillRef.current = loc
      setViewTableName(deriveViewTableName(loc))
    }
  }, [sourceLocationValidation, isExistingTable, sourceLocation, viewTableName])
  const simpleConfig = isSimpleWizard ? SIMPLE_WIZARD_CONFIG[kind] : null
  // Path-based sources surface the optional "Preview location" control in the
  // data preview header (existing-table uses an inline "View table name" instead).
  const showHeaderPreviewLocation = isS3 || (isSimpleWizard && !isExistingTable)
  const sourceLocationLabel = isS3 ? "S3 source location" : "Source location"
  const activePreviewLocation =
    previewMode === "sample" ? dataSampleLocation : sourceLocation
  // The active location doubles as the preview name once a preview is loading/ready.
  const previewHeaderName = showUnwrapPreview
    ? "Data preview"
    : showHeaderPreviewLocation
      ? (previewReady || previewLoading) && activePreviewLocation.trim()
        ? activePreviewLocation
        : "Data preview"
      : previewReady
        ? "aws_sec_lake_raw"
        : "Data preview"
  React.useEffect(
    () => () => {
      if (sampleVerificationTimer.current) clearTimeout(sampleVerificationTimer.current)
      if (regionVerificationTimer.current) clearTimeout(regionVerificationTimer.current)
      if (unwrapLoadingTimer.current) clearTimeout(unwrapLoadingTimer.current)
    },
    []
  )

  React.useEffect(() => {
    if (unwrapping !== "none") {
      prepareEventsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    // Selecting a different method invalidates a previously applied JSON Array field.
    if (unwrapping !== "json-array") {
      setJsonArrayApplied(false)
    }

    if (unwrapLoadingTimer.current) {
      clearTimeout(unwrapLoadingTimer.current)
      unwrapLoadingTimer.current = null
    }
    // Non-JSON-Array transforms show a short loading wheel, then the side-by-side.
    if (unwrapping !== "none" && unwrapping !== "json-array") {
      setUnwrapReady(false)
      setUnwrapLoading(true)
      unwrapLoadingTimer.current = setTimeout(() => {
        setUnwrapLoading(false)
        setUnwrapReady(true)
        unwrapLoadingTimer.current = null
      }, 1500)
    } else {
      setUnwrapLoading(false)
      setUnwrapReady(false)
    }
  }, [unwrapping])

  // Sweep a skeleton over the preview table, then reveal the (new) data.
  const runPreview = React.useCallback(() => {
    if (sampleVerificationTimer.current) clearTimeout(sampleVerificationTimer.current)
    setSampleVerification("validating")
    sampleVerificationTimer.current = setTimeout(() => {
      setSampleVerification("verified")
      sampleVerificationTimer.current = null
    }, 1500)
  }, [])

  const applyPreviewConfig = () => {
    setPreviewMode(draftPreviewMode)
    if (draftPreviewMode === "sample") {
      setDataSampleLocation(draftSample.trim() || previewSampleFill)
    }
    setPreviewConfigOpen(false)
    runPreview()
  }

  // By default the preview samples the source location once it and the format
  // are both selected; the location then surfaces as the preview name. Once
  // loaded it stays put — we only re-sweep when the source/format actually
  // change (switching to a sample preview is handled by applyPreviewConfig).
  React.useEffect(() => {
    if (!showHeaderPreviewLocation) return
    if (previewMode !== "source") return
    if (!sourceLocation.trim() || !dataFormat) {
      autoPreviewKeyRef.current = null
      return
    }
    const key = `${sourceLocation}|${dataFormat}`
    if (autoPreviewKeyRef.current === key) return
    autoPreviewKeyRef.current = key
    runPreview()
  }, [showHeaderPreviewLocation, previewMode, sourceLocation, dataFormat, runPreview])

  const validateRegion = (value: string) => {
    setAwsRegion(value)
    if (regionVerificationTimer.current) clearTimeout(regionVerificationTimer.current)

    if (!value.trim()) {
      setRegionVerification("idle")
      return
    }

    setRegionVerification("validating")
    regionVerificationTimer.current = setTimeout(() => {
      setRegionVerification("verified")
      regionVerificationTimer.current = null
    }, 1500)
  }

  const dataPreviewSection =
    previewVisible &&
    (activeStep === 1 ||
      (activeStep === 2 && (previewReady || schemasReady || showUnwrapPreview))) ? (
      <section
        aria-label="Data preview"
        className={cn(
          "shrink-0 bg-secondary",
          templatePanelOpen ? undefined : "-mx-5 -mb-5 mt-auto"
        )}
      >
        {isExistingTable ? (
          <ExistingTablePreviewPane
            tableName={sourceLocation}
            onClose={() => setPreviewVisible(false)}
          />
        ) : showSplitPreview ? (
          <SchemaSplitPreview
            region={previewRegion}
            templates={selectedTemplates}
            unwrapConfigured={unwrapConfigured}
          />
        ) : (
          <>
            <div
              className={cn(
                "flex items-center justify-between border-y border-input px-2",
                showHeaderPreviewLocation && !showUnwrapPreview ? "h-10" : "h-8"
              )}
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <h2 className="min-w-0 truncate text-sm font-semibold leading-5 text-foreground">
                  {previewHeaderName}
                </h2>
                {showHeaderPreviewLocation && !showUnwrapPreview ? (
                  <>
                    <Popover
                      open={previewConfigOpen}
                      onOpenChange={(open) => {
                        setPreviewConfigOpen(open)
                        if (open) {
                          setDraftPreviewMode(previewMode)
                          setDraftSample(
                            previewMode === "sample" ? dataSampleLocation : ""
                          )
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Configure data preview source"
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[360px] p-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold leading-5 text-foreground">
                              Data preview source
                            </p>
                            <p className="text-hint text-muted-foreground">
                              Choose what Lakewatch samples for this preview.
                            </p>
                          </div>
                          <RadioGroup
                            value={draftPreviewMode}
                            onValueChange={(value) =>
                              setDraftPreviewMode(value as "source" | "sample")
                            }
                            className="gap-3"
                          >
                            <label
                              htmlFor="preview-source-source"
                              className="flex cursor-pointer items-start gap-2"
                            >
                              <RadioGroupItem
                                value="source"
                                id="preview-source-source"
                                className="mt-0.5"
                              />
                              <span className="flex min-w-0 flex-col">
                                <span className="text-sm text-foreground">
                                  {sourceLocationLabel}
                                </span>
                                <span className="truncate text-hint text-muted-foreground">
                                  {sourceLocation.trim() ||
                                    "Select a source location first"}
                                </span>
                              </span>
                            </label>
                            <label
                              htmlFor="preview-source-sample"
                              className="flex cursor-pointer items-start gap-2"
                            >
                              <RadioGroupItem
                                value="sample"
                                id="preview-source-sample"
                                className="mt-0.5"
                              />
                              <span className="flex min-w-0 flex-1 flex-col gap-2">
                                <span className="text-sm text-foreground">
                                  Preview with sample location
                                </span>
                                {draftPreviewMode === "sample" ? (
                                  <ValidatedInput
                                    aria-label="Sample location"
                                    value={draftSample}
                                    onChange={(event) =>
                                      setDraftSample(event.target.value)
                                    }
                                    onFocus={() =>
                                      setDraftSample(
                                        (current) => current || previewSampleFill
                                      )
                                    }
                                    onClick={() =>
                                      setDraftSample(
                                        (current) => current || previewSampleFill
                                      )
                                    }
                                    placeholder={previewSamplePlaceholder}
                                  />
                                ) : null}
                              </span>
                            </label>
                          </RadioGroup>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={applyPreviewConfig}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <VerificationIndicator
                      state={sampleVerification}
                      label="Data preview"
                    />
                  </>
                ) : null}
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={previewExpanded ? "Collapse data preview" : "Expand data preview"}
                  onClick={() => setPreviewExpanded((current) => !current)}
                >
                  <ChevronDownIcon
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      !previewExpanded && "-rotate-90"
                    )}
                  />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close data preview"
                  onClick={() => setPreviewVisible(false)}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            {previewExpanded ? (
              previewLoading || unwrapLoading ? (
                <RawDataPreviewSkeleton />
              ) : showUnwrapPreview ? (
                <EventUnwrapPreview
                  topLevelField={topLevelField}
                  sourceName={
                    activePreviewLocation.trim() || S3_SOURCE_LOCATION_SAMPLE
                  }
                  instant
                />
              ) : previewReady ? (
                <RawDataPreview
                  region={previewRegion}
                  sourceName={
                    activePreviewLocation.trim() || S3_SOURCE_LOCATION_SAMPLE
                  }
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 px-4 py-6 text-center">
                  <TableIcon className="h-9 w-9 text-muted-foreground" />
                  <p className="text-sm leading-5 text-foreground">
                    {showHeaderPreviewLocation
                      ? "Select a source location and format to preview your data."
                      : "Configure a table to see a preview"}
                  </p>
                </div>
              )
            ) : null}
          </>
        )}
      </section>
    ) : null

  return (
    <div ref={contentRef} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className={cn(
          "flex min-h-0 flex-1 overflow-hidden",
          // When the detail panel is open it becomes a full-height right column so its
          // left divider runs to the top of the box; the wizard content stays on the left.
          templatePanelOpen ? "flex-col lg:flex-row" : "flex-col"
        )}
      >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/lakewatch/datasources">Datasources</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/lakewatch/datasources/new">Add new datasource</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className={PAGE_TITLE_SEMIBOLD}>
              {simpleConfig?.title ?? "Create AWS S3 datasource"}
            </h1>
            <WizardStepMenu
              steps={isSimpleWizard ? getSimpleWizardSteps(kind) : WIZARD_STEPS}
              activeStep={activeStep}
              className={stepperCollapsed ? undefined : "hidden"}
            />
          </div>
        </div>
        <LakewatchDataControls />
      </div>

      <div
        className={cn(
          "grid grid-cols-1 min-h-0 flex-1",
          templatePanelOpen
            ? "mt-4 w-full [grid-template-rows:minmax(0,1fr)]"
            : compact
              ? "mx-auto mt-6 w-full max-w-[920px] pb-4 [grid-template-rows:minmax(0,1fr)]"
              : "mt-6 w-full items-start gap-8 pb-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-x-0 lg:[grid-template-rows:minmax(0,1fr)]"
        )}
      >
        {!stepperCollapsed ? (
          <div>
            <WizardStepper
              activeStep={activeStep}
              steps={isSimpleWizard ? getSimpleWizardSteps(kind) : WIZARD_STEPS}
            />
          </div>
        ) : null}

        {activeStep === 1 ? (
          isSqs ? (
            <form
              className="flex max-h-full w-full min-h-0 max-w-[920px] flex-col self-start justify-self-center overflow-hidden rounded-md border border-input"
              onSubmit={(event) => {
                event.preventDefault()
                setActiveStep(2)
              }}
            >
              <StepPanelHeader
                step={1}
                title="Source"
                description="Configure the SQS queue and region Lakewatch should use to consume messages"
              />

              <div className="flex min-h-0 flex-col">
                <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-8 pt-6 pb-4">
                  <WizardDatasourceNameField
                    catalog={catalog}
                    onCatalogChange={setCatalog}
                    schema={schema}
                    onSchemaChange={setSchema}
                    name={datasourceName}
                    onNameChange={setDatasourceName}
                  />

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="sqs-source-location">SQS Queue URL *</Label>
                    <p className="text-hint text-muted-foreground">
                      {simpleConfig?.sourceHint}
                    </p>
                    <ValidatedInput
                      id="sqs-source-location"
                      value={sourceLocation}
                      onChange={(event) => setSourceLocation(event.target.value)}
                      onFocus={() => {
                        if (!sourceLocation) {
                          setSourceLocation(getCloudSourceLocationSample(kind))
                        }
                      }}
                      onClick={() => {
                        if (!sourceLocation) {
                          setSourceLocation(getCloudSourceLocationSample(kind))
                        }
                      }}
                    />
                  </div>

                  <RunAsControl
                    value={s3RunAs}
                    onValueChange={setS3RunAs}
                    className="self-start"
                  />

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="aws-region">AWS region *</Label>
                    <p className="text-hint text-muted-foreground">
                      The AWS region the SQS queue lives in.
                    </p>
                    <div className="flex items-center gap-2">
                      <AwsRegionTypeahead value={awsRegion} onValueChange={validateRegion} />
                      <VerificationIndicator state={regionVerification} label="AWS region" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Authentication *</Label>
                    <p className="text-hint text-muted-foreground">
                      The credentials Lakewatch uses to read messages from the queue.
                    </p>
                    <RadioGroup
                      value={sqsAuth}
                      onValueChange={setSqsAuth}
                      className="mt-1 gap-2"
                    >
                      <label
                        htmlFor="sqs-auth-default"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <RadioGroupItem value="default" id="sqs-auth-default" />
                        <span className="text-sm text-foreground">
                          Default credentials
                        </span>
                      </label>
                      <label
                        htmlFor="sqs-auth-secret-scope"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <RadioGroupItem
                          value="secret-scope"
                          id="sqs-auth-secret-scope"
                        />
                        <span className="text-sm text-foreground">
                          Workspace secret scope
                        </span>
                      </label>
                      <label
                        htmlFor="sqs-auth-service-credential"
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <RadioGroupItem
                          value="service-credential"
                          id="sqs-auth-service-credential"
                        />
                        <span className="text-sm text-foreground">
                          Service credential
                        </span>
                      </label>
                    </RadioGroup>
                  </div>

                  <WizardFormatField value={dataFormat} onValueChange={setDataFormat} />

                  <WizardComputeModeField />
                </div>

                <div className="flex shrink-0 items-center justify-between px-4 py-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/lakewatch/datasources/new">Cancel</Link>
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Continue
                  </Button>
                </div>
              </div>
            </form>
          ) : isSimpleWizard ? (
            <form
              className="flex max-h-full w-full min-h-0 max-w-[920px] flex-col self-start justify-self-center overflow-hidden rounded-md border border-input"
              onSubmit={(event) => {
                event.preventDefault()
                setActiveStep(2)
              }}
            >
              <StepPanelHeader
                step={1}
                title="Source"
                description="Configure the source location Lakewatch should use to access your data"
              />

              <div className="flex min-h-0 flex-col gap-6 overflow-y-auto px-8 pt-6 pb-4">
              <WizardDatasourceNameField
                catalog={catalog}
                onCatalogChange={setCatalog}
                schema={schema}
                onSchemaChange={setSchema}
                name={datasourceName}
                onNameChange={setDatasourceName}
              />

              <div className="flex flex-col gap-2">
                <Label htmlFor="simple-source-location">Source location *</Label>
                <p className="text-hint text-muted-foreground">
                  {simpleConfig?.sourceHint ?? "Hint text here"}
                </p>
                {isExistingTable ? (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1">
                      <Input
                        id="simple-source-location"
                        value={sourceLocation}
                        onChange={(event) => setSourceLocation(event.target.value)}
                        onFocus={() => {
                          if (!sourceLocation) {
                            setSourceLocation(EXISTING_TABLE_SOURCE_SAMPLE)
                          }
                        }}
                        onClick={() => {
                          if (!sourceLocation) {
                            setSourceLocation(EXISTING_TABLE_SOURCE_SAMPLE)
                          }
                        }}
                        placeholder="Enter a table or browse"
                        className="rounded-r-none border-r-0"
                      />
                      <Button
                        type="button"
                        variant="default"
                        size="icon-sm"
                        className="rounded-l-none"
                        aria-label="Browse Unity Catalog tables"
                        onClick={() => setCatalogPickerOpen(true)}
                      >
                        <FolderIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <ValidationIndicator value={sourceLocation} />
                  </div>
                ) : (
                  <ValidatedInput
                    id="simple-source-location"
                    value={sourceLocation}
                    onChange={(event) => setSourceLocation(event.target.value)}
                    onFocus={() => {
                      if (!sourceLocation) {
                        setSourceLocation(getCloudSourceLocationSample(kind))
                      }
                    }}
                    onClick={() => {
                      if (!sourceLocation) {
                        setSourceLocation(getCloudSourceLocationSample(kind))
                      }
                    }}
                  />
                )}
              </div>

              <RunAsControl
                value={s3RunAs}
                onValueChange={setS3RunAs}
                className="self-start"
              />

              {isExistingTable ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="primary-key-column-0">Primary-key columns</Label>
                  <p className="text-hint text-muted-foreground">
                    Columns that uniquely identify each row.
                  </p>
                  <div className="flex flex-col gap-2">
                    {primaryKeyColumns.map((column, index) => (
                      <Input
                        key={index}
                        id={`primary-key-column-${index}`}
                        value={column}
                        onChange={(event) =>
                          setPrimaryKeyColumns((current) =>
                            current.map((value, i) =>
                              i === index ? event.target.value : value
                            )
                          )
                        }
                        placeholder="Enter a column name"
                      />
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Add primary-key column"
                      className="self-start"
                      onClick={() =>
                        setPrimaryKeyColumns((current) => [...current, ""])
                      }
                    >
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ) : null}

              {isExistingTable ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="simple-secondary-location">View table name</Label>
                  <p className="text-hint text-muted-foreground">
                    Name of the Lakewatch view to expose this table through.
                  </p>
                  <Input
                    id="simple-secondary-location"
                    value={viewTableName}
                    onChange={(event) => setViewTableName(event.target.value)}
                  />
                </div>
              ) : null}

              {isExistingTable ? null : (
                <WizardFormatField
                  value={dataFormat}
                  onValueChange={setDataFormat}
                />
              )}

              <WizardComputeModeField />
              </div>

              <div className="flex shrink-0 items-center justify-between px-4 py-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/lakewatch/datasources/new">Cancel</Link>
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Continue
                </Button>
              </div>
            </form>
          ) : (
          <form
            className="flex max-h-full w-full min-h-0 max-w-[920px] flex-col self-start justify-self-center overflow-hidden rounded-md border border-input"
            onSubmit={(event) => {
              event.preventDefault()
              setActiveStep(2)
            }}
          >
            <StepPanelHeader
              step={1}
              title="Source"
              description="Configure the S3 location and credentials Lakewatch should use to access your data"
            />

            <div className="flex min-h-0 flex-col">
              <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-8 pt-6 pb-4">
              <WizardDatasourceNameField
                catalog={catalog}
                onCatalogChange={setCatalog}
                schema={schema}
                onSchemaChange={setSchema}
                name={datasourceName}
                onNameChange={setDatasourceName}
              />

              <div className="flex flex-col gap-2">
                <Label>S3 source location *</Label>
                <p className="text-hint text-muted-foreground">
                  The S3 path to ingest data from (e.g. s3://my-bucket/logs/).
                </p>
                <div className="flex items-center gap-2">
                  <Select value={sourceLocation} onValueChange={setSourceLocation}>
                    <SelectTrigger className="w-full" aria-label="S3 source location">
                      <SelectValue placeholder="Select an S3 location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s3://lakewatch-security-logs/">
                        s3://lakewatch-security-logs/
                      </SelectItem>
                      <SelectItem value="s3://production-cloudtrail/AWSLogs/">
                        s3://production-cloudtrail/AWSLogs/
                      </SelectItem>
                      <SelectItem value="s3://security-data/vpc-flow/">
                        s3://security-data/vpc-flow/
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <ValidationIndicator value={sourceLocation} />
                </div>
              </div>

              <WizardFormatField value={dataFormat} onValueChange={setDataFormat} />

              <RunAsControl
                value={s3RunAs}
                onValueChange={setS3RunAs}
                className="self-start"
              />

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto self-start gap-1 p-0 !px-0"
                  aria-expanded={advancedOpen}
                  onClick={() => setAdvancedOpen((current) => !current)}
                >
                  Advanced options (optional)
                  <ChevronDownIcon
                    className={cn(
                      "h-4 w-4 transition-transform",
                      advancedOpen && "rotate-180"
                    )}
                  />
                </Button>
                {advancedOpen ? (
                  <div className="flex flex-col gap-5 border-l border-border pl-4">
                    <WizardDataTimeRangeField />

                    <div className="flex flex-col gap-2">
                      <div>
                        <Label htmlFor="managed-file-notifications">
                          Use managed file notifications
                        </Label>
                        <p className="text-hint text-muted-foreground">
                          When enabled, uses managed file events configured on the external location for
                          file notification instead of directory listing.
                        </p>
                      </div>
                      <Switch
                        id="managed-file-notifications"
                        size="sm"
                        checked={managedNotifications}
                        onCheckedChange={setManagedNotifications}
                      />
                    </div>

                    <WizardComputeModeField bare />
                  </div>
                ) : null}
              </div>
              </div>

              <div className="flex shrink-0 items-center justify-between px-4 py-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/lakewatch/datasources/new">Cancel</Link>
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Continue
                </Button>
              </div>
            </div>
          </form>
          )
        ) : (
          <form
            className={cn(
              "flex min-h-0 flex-col overflow-hidden rounded-md border border-border",
              templatePanelOpen
                ? "h-full lg:my-6 lg:ml-5 lg:mr-6"
                : "max-h-full w-full max-w-[920px] self-start justify-self-center"
            )}
            onSubmit={(event) => {
              event.preventDefault()
              const name = datasourceName.trim() || "lakewatch-account-us-west-2"
              const inferredParam = pendingSchemas.length
                ? `?inferred=${pendingSchemas.map(encodeURIComponent).join(",")}`
                : ""
              router.push(
                `/lakewatch/datasources/${encodeURIComponent(name)}${inferredParam}`
              )
            }}
          >
            <StepPanelHeader
              step={2}
              title="Parsers"
              description="Select the parsers Lakewatch should use to classify your logs"
            />

            <div className="flex min-h-0 flex-col overflow-y-auto px-8 py-6">
              {!isExistingTable ? (
                <div
                  ref={prepareEventsRef}
                  className="mb-6 flex scroll-mt-6 flex-col gap-3"
                >
                  <div>
                    <Label>Unwrapping (optional)</Label>
                    <p className="text-hint text-muted-foreground">
                      Choose how Lakewatch turns each source record into one or more logical events.
                    </p>
                  </div>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                    <Label htmlFor="unwrapping-method" className="font-normal">
                      Unwrapping
                    </Label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={unwrapping}
                        onValueChange={(value) => {
                          setUnwrapping(value as UnwrapMode)
                          setPreviewVisible(true)
                        }}
                      >
                        <SelectTrigger id="unwrapping-method" className="min-w-0 flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem
                            value="none"
                            description="Use each source record as one event."
                          >
                            No unwrapping
                          </SelectItem>
                        <SelectItem value="lines" description="Events are line delimited.">
                          Lines
                        </SelectItem>
                        <SelectItem value="json" description="Events are in JSON format.">
                          JSON
                        </SelectItem>
                        <SelectItem
                          value="json-array"
                          description="Events are in JSON Array format."
                        >
                          JSON Array
                        </SelectItem>
                        <SelectItem
                          value="cloudwatch"
                          description="Events are delivered to S3 from CloudWatch Logs."
                        >
                          CloudWatch Logs
                        </SelectItem>
                        <SelectItem value="xml" description="Events are in XML format.">
                          <span className="flex items-center gap-1.5">
                            XML
                            <Badge
                              variant="secondary"
                              className="h-4 px-1 text-[10px] leading-4"
                            >
                              BETA
                            </Badge>
                          </span>
                        </SelectItem>
                        </SelectContent>
                      </Select>
                      {unwrapLoading ? (
                        <LoaderCircle
                          className="h-4 w-4 shrink-0 animate-spin text-muted-foreground"
                          aria-label="Building unwrap preview"
                        />
                      ) : null}
                    </div>
                  </div>

                  {unwrapping === "json-array" ? (
                    <div className="grid grid-cols-[160px_minmax(0,1fr)] items-start gap-3">
                      <Label htmlFor="top-level-field" className="mt-1.5 font-normal">
                        Top-level event field
                      </Label>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-start gap-2">
                          <Input
                            id="top-level-field"
                            value={topLevelField}
                            onChange={(event) => {
                              setTopLevelField(event.target.value)
                              setJsonArrayApplied(false)
                            }}
                            placeholder="e.g. Records"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setPreviewVisible(true)
                              setJsonArrayApplied(false)
                              if (unwrapLoadingTimer.current) {
                                clearTimeout(unwrapLoadingTimer.current)
                              }
                              setUnwrapLoading(true)
                              unwrapLoadingTimer.current = setTimeout(() => {
                                setUnwrapLoading(false)
                                setJsonArrayApplied(true)
                                unwrapLoadingTimer.current = null
                              }, 1500)
                            }}
                          >
                            Apply
                          </Button>
                        </div>
                        <p className="text-hint text-muted-foreground">
                          Lakewatch extracts the elements of this array as individual events.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <IntegrationTemplatesField
                controller={templateController}
                pendingNames={pendingSchemas}
                createCustomHref={
                  unwrapConfigured
                    ? "/lakewatch/schemas/new?unwrapped=1"
                    : "/lakewatch/schemas/new"
                }
              />
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-input px-8 py-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveStep(1)}
              >
                Back
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create datasource
              </Button>
            </div>
          </form>
        )}
      </div>

      {!templatePanelOpen ? dataPreviewSection : null}
      </div>

      {templatePanelOpen ? (
        <IntegrationTemplatePanel
          controller={templateController}
          className="min-h-0 w-full flex-1 border-t border-input lg:w-[520px] lg:flex-none lg:border-l lg:border-t-0"
        />
      ) : null}
      </div>

      {templatePanelOpen ? dataPreviewSection : null}

      {isExistingTable ? (
        <UnityCatalogExplorerModal
          open={catalogPickerOpen}
          onOpenChange={setCatalogPickerOpen}
          onSelect={(location) => {
            setSourceLocation(location)
            setViewTableName("bronze_crowdstrike_alerts_view")
          }}
        />
      ) : null}
    </div>
  )
}

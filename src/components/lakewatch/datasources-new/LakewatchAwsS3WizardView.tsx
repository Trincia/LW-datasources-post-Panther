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
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
  TableIcon,
} from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
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
  CommandInput,
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  "Source location",
  "Ingestion templates",
  "Name and Permissions",
] as const

export type LakewatchDatasourceWizardKind =
  | "aws-s3"
  | "existing-table"
  | "google-cloud-storage"
  | "uc-volume"
  | "azure-blob-storage"

function getPrefixProviderLabel(kind: LakewatchDatasourceWizardKind) {
  if (kind === "google-cloud-storage") return "GCS"
  if (kind === "azure-blob-storage") return "Azure"
  return "S3"
}

function getSimpleWizardSteps(kind: LakewatchDatasourceWizardKind) {
  const prefixLabel = getPrefixProviderLabel(kind)
  return [
    "Configure source",
    `${prefixLabel} prefix & ingestion templates`,
    "Additional details",
  ] as const
}

const SIMPLE_WIZARD_CONFIG: Record<
  Exclude<LakewatchDatasourceWizardKind, "aws-s3">,
  { title: string; sourceHint?: string }
> = {
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

const AZURE_SOURCE_LOCATION_SAMPLE =
  "https://portal.azure.com/#blade/Microsoft_Azure_Storage/ContainerMenuBlade/overview/storageAccountId/%2Fsubscriptions%2F00000000-0000-0000-0000-000000000000%2FresourceGroups%2Flakewatch-rg%2Fproviders%2FMicrosoft.Storage%2FstorageAccounts%2Flakewatchlogs%2FblobServices%2Fdefault%2Fcontainers%2Fsecurity-logs"

function getCloudSourceLocationSample(kind: LakewatchDatasourceWizardKind) {
  if (kind === "azure-blob-storage") return AZURE_SOURCE_LOCATION_SAMPLE
  return GCS_SOURCE_LOCATION_SAMPLE
}

type VerificationState = "idle" | "validating" | "verified"

const DETECTED_SCHEMAS = [
  "AWS.VPCFlow",
  "AWS.ALB",
  "AWS.S3ServerAccess",
  "AWS.CloudTrail",
] as const

type EventPrepMode = "record" | "unwrap"

type PreviewSchema = (typeof DETECTED_SCHEMAS)[number]

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

const UNWRAP_TOTAL_EVENTS = UNWRAP_SOURCE_RECORDS.reduce(
  (total, record) => total + record.Records.length,
  0
)

const UNWRAP_COPYABLE_FIELDS = ["accountId", "region", "bucket", "requestId"] as const

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

function formatSourceRecord(record: UnwrapSourceRecord, arrayPath: string) {
  const { Records, ...rest } = record
  const lines = ["{"]
  for (const [key, value] of Object.entries(rest)) {
    lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
  }
  lines.push(`  ${JSON.stringify(arrayPath)}: [ … ${Records.length} events ]`)
  lines.push("}")
  return lines.join("\n")
}

const SCHEMA_PREVIEW_DATA: Record<PreviewSchema, PreviewTableData> = {
  "AWS.VPCFlow": {
    columns: [
      "version",
      "accountId",
      "interfaceId",
      "srcAddr",
      "dstAddr",
      "srcPort",
      "dstPort",
      "protocol",
      "packets",
      "bytes",
      "action",
    ],
    rows: [
      ["2", "123456789012", "eni-0a91f3c2", "10.0.1.24", "52.216.144.43", "49822", "443", "6", "14", "7840", "ACCEPT"],
      ["2", "123456789012", "eni-0a91f3c2", "10.0.2.17", "10.0.1.24", "54321", "443", "6", "9", "4218", "ACCEPT"],
      ["2", "123456789012", "eni-0c74b8e1", "198.51.100.17", "10.0.3.8", "60114", "22", "6", "3", "180", "REJECT"],
      ["2", "123456789012", "eni-0c74b8e1", "10.0.3.8", "8.8.8.8", "39124", "53", "17", "2", "164", "ACCEPT"],
      ["2", "123456789012", "eni-05d18a77", "10.0.4.31", "10.0.5.12", "44210", "3306", "6", "28", "16244", "ACCEPT"],
      ["2", "123456789012", "eni-05d18a77", "203.0.113.42", "10.0.4.31", "51890", "443", "6", "18", "10392", "ACCEPT"],
    ],
  },
  "AWS.ALB": {
    columns: [
      "time",
      "clientIp",
      "clientPort",
      "targetIp",
      "targetPort",
      "requestMethod",
      "requestUrl",
      "statusCode",
      "receivedBytes",
      "sentBytes",
      "userAgent",
    ],
    rows: [
      ["2024-03-15T14:23:41Z", "203.0.113.42", "51820", "10.0.2.17", "8080", "GET", "/api/v1/health", "200", "0", "124", "ELB-HealthChecker/2.0"],
      ["2024-03-15T14:25:07Z", "198.51.100.17", "60114", "10.0.2.19", "8080", "POST", "/api/v1/events", "202", "1842", "86", "aws-sdk-java/2.25"],
      ["2024-03-15T14:31:19Z", "192.0.2.88", "44210", "10.0.3.8", "8080", "GET", "/login", "302", "0", "245", "Mozilla/5.0"],
      ["2024-03-15T15:02:44Z", "203.0.113.81", "39124", "10.0.3.9", "8080", "GET", "/assets/app.js", "200", "0", "48392", "Mozilla/5.0"],
      ["2024-03-15T16:18:55Z", "198.51.100.64", "54321", "10.0.2.17", "8080", "PUT", "/api/v1/users/42", "200", "712", "364", "curl/8.5.0"],
      ["2024-03-15T16:44:02Z", "192.0.2.31", "49822", "10.0.2.19", "8080", "GET", "/api/v1/reports", "403", "0", "96", "python-requests/2.31"],
    ],
  },
  "AWS.S3ServerAccess": {
    columns: [
      "bucketOwner",
      "bucket",
      "requestTime",
      "remoteIp",
      "requester",
      "requestId",
      "operation",
      "key",
      "httpStatus",
      "bytesSent",
      "userAgent",
    ],
    rows: [
      ["79a59df9", "security-logs-prod", "15/Mar/2024:14:23:41 +0000", "203.0.113.42", "arn:aws:iam::123456789012:role/Ingest", "3E57427F", "REST.GET.OBJECT", "cloudtrail/2024/03/15/part-001.json.gz", "200", "18422", "aws-sdk-java"],
      ["79a59df9", "security-logs-prod", "15/Mar/2024:14:25:07 +0000", "198.51.100.17", "arn:aws:iam::123456789012:role/Ingest", "8A19B40C", "REST.PUT.OBJECT", "vpcflow/2024/03/15/part-014.log.gz", "200", "0", "aws-cli/2.15"],
      ["79a59df9", "security-logs-prod", "15/Mar/2024:14:31:19 +0000", "192.0.2.88", "arn:aws:iam::123456789012:user/auditor", "12C94EF1", "REST.HEAD.OBJECT", "alb/2024/03/15/access-009.log.gz", "200", "0", "Boto3/1.34"],
      ["79a59df9", "security-logs-prod", "15/Mar/2024:15:02:44 +0000", "203.0.113.81", "-", "5D0FA821", "REST.GET.BUCKET", "-", "403", "243", "Mozilla/5.0"],
      ["79a59df9", "security-logs-prod", "15/Mar/2024:16:18:55 +0000", "198.51.100.64", "arn:aws:iam::123456789012:role/Lifecycle", "9BF2A476", "REST.DELETE.OBJECT", "tmp/export-428.csv", "204", "0", "S3Console/0.4"],
      ["79a59df9", "security-logs-prod", "15/Mar/2024:16:44:02 +0000", "192.0.2.31", "arn:aws:iam::123456789012:role/Ingest", "F1439CD8", "REST.GET.OBJECT", "cloudtrail/2024/03/15/part-002.json.gz", "206", "8192", "aws-sdk-go-v2"],
    ],
  },
  "AWS.CloudTrail": {
    columns: [
      "eventTime",
      "eventName",
      "eventSource",
      "userIdentityType",
      "awsRegion",
      "sourceIPAddress",
      "userAgent",
      "requestID",
      "eventID",
      "eventType",
      "readOnly",
    ],
    rows: [
      ["2024-03-15T14:23:41Z", "AssumeRole", "sts.amazonaws.com", "IAMUser", "us-east-1", "203.0.113.42", "aws-cli/2.15", "aa21c4d8", "dce958ed", "AwsApiCall", "true"],
      ["2024-03-15T14:25:07Z", "GetObject", "s3.amazonaws.com", "AssumedRole", "us-east-1", "203.0.113.42", "Boto3/1.34", "bb32d5e9", "86774789", "AwsApiCall", "true"],
      ["2024-03-15T14:31:19Z", "PutObject", "s3.amazonaws.com", "AssumedRole", "us-east-1", "198.51.100.17", "aws-sdk-java/2.25", "cc43e6fa", "f54af1b7", "AwsApiCall", "false"],
      ["2024-03-15T15:02:44Z", "CreateUser", "iam.amazonaws.com", "IAMUser", "us-east-1", "198.51.100.17", "console.amazonaws.com", "dd54f70b", "1b2d48e0", "AwsApiCall", "false"],
      ["2024-03-15T16:18:55Z", "ListBuckets", "s3.amazonaws.com", "Root", "us-east-1", "192.0.2.88", "Mozilla/5.0", "ee65081c", "82ce5b19", "AwsApiCall", "true"],
      ["2024-03-15T16:44:02Z", "DeleteObject", "s3.amazonaws.com", "AssumedRole", "us-east-1", "192.0.2.88", "aws-sdk-go-v2", "ff76192d", "93df6c2a", "AwsApiCall", "false"],
    ],
  },
}

function formatAwsRegion(region: (typeof AWS_REGIONS)[number]) {
  return `${region.label} — ${region.id}`
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
    <div className="mt-5 flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label>Data time range</Label>
        <p className="text-hint text-muted-foreground">
          Limit ingestion to files modified after a specific date, or ingest all available data.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger className="w-fit min-w-[110px]" aria-label="Data time range mode">
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

function WizardProcessingScheduleField() {
  const [cadence, setCadence] = React.useState("at-least-every")
  const [interval, setInterval] = React.useState("10")
  const [unit, setUnit] = React.useState("minutes")
  const [editing, setEditing] = React.useState(false)

  const scheduleLabel = `${SCHEDULE_CADENCE_LABELS[cadence] ?? cadence} ${interval} ${
    SCHEDULE_UNIT_LABELS[unit] ?? unit
  }`

  return (
    <div className="mt-5 flex flex-col gap-2">
      <Label>Processing schedule</Label>
      <div className="flex min-w-0 flex-wrap items-center gap-x-[7px] gap-y-2">
        {editing ? (
          <>
            <Select value={cadence} onValueChange={setCadence}>
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
              onChange={(event) => setInterval(event.target.value)}
              className="w-[65px]"
            />
            <Select value={unit} onValueChange={setUnit}>
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

function RawDataPreview({ region }: { region: string }) {
  return (
    <div className="overflow-hidden">
      <div className="flex h-6 items-center border-b border-input px-2">
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
    </div>
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
  schema: PreviewSchema
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

function SchemaSplitPreview({ region }: { region: string }) {
  const [schemaIndex, setSchemaIndex] = React.useState(0)
  const [selectedRowIndex, setSelectedRowIndex] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [leftPct, setLeftPct] = React.useState(41)
  const splitRef = React.useRef<HTMLDivElement>(null)
  const draggingRef = React.useRef(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

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

  const schema = DETECTED_SCHEMAS[schemaIndex]
  const inputData = getInputPreviewData(region)
  const schemaData = SCHEMA_PREVIEW_DATA[schema]
  const outputData: PreviewTableData = {
    columns: schemaData.columns,
    rows: schemaData.rows.slice(0, inputData.rows.length),
  }

  if (loading) {
    return (
      <div className="flex h-[176px] flex-col items-center justify-center gap-2 border-y border-input">
        <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
        <p className="text-sm leading-5 text-foreground">Building schema preview</p>
      </div>
    )
  }

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
          <span className="text-sm text-foreground">Raw data</span>
          <span className="ml-2 whitespace-nowrap text-hint text-muted-foreground">
            {inputData.rows.length} records, 1 column
          </span>
          <Button variant="default" size="xs" className="ml-2">
            Side-by-side
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
          <PreviewPanelActions />
        </div>
        <PreviewDataTable data={inputData} className="min-w-[650px]" />
      </section>

      <section aria-label={`${schema} output preview`} className="min-w-0">
        <div className="flex h-8 min-w-0 items-center gap-1 px-2">
          <TableIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Output</span>
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-1.5 text-primary hover:text-blue-700"
                aria-label="Select ingestion template"
              >
                <span className="max-w-[140px] truncate text-sm">{schema}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuRadioGroup
                value={schema}
                onValueChange={(value) =>
                  setSchemaIndex(DETECTED_SCHEMAS.indexOf(value as PreviewSchema))
                }
              >
                {DETECTED_SCHEMAS.map((name) => (
                  <DropdownMenuRadioItem key={name} value={name}>
                    {name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="ml-2 whitespace-nowrap text-hint text-muted-foreground">
            10 records, {outputData.columns.length} columns
          </span>
          <PreviewPanelActions />
        </div>
        <PreviewDataTable
          data={outputData}
          className="min-w-[1120px]"
          selectedRowIndex={selectedRowIndex}
          onRowSelect={setSelectedRowIndex}
        />
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
        schema={schema}
        data={outputData}
        rowIndex={selectedRowIndex}
        onRowChange={setSelectedRowIndex}
        onClose={() => setSelectedRowIndex(null)}
      />
    </>
  )
}

function CopyFieldsEditor({
  value,
  onChange,
}: {
  value: string[]
  onChange: (value: string[]) => void
}) {
  const [open, setOpen] = React.useState(false)
  const remaining = UNWRAP_COPYABLE_FIELDS.filter((field) => !value.includes(field))

  return (
    <div className="flex flex-wrap items-center gap-1">
      {value.map((field) => (
        <Badge key={field} variant="default_tag" className="pr-0.5">
          {field}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-4 shrink-0 rounded-sm text-current hover:bg-transparent hover:text-foreground"
            aria-label={`Remove ${field}`}
            onClick={() => onChange(value.filter((item) => item !== field))}
          >
            <X className="size-3" aria-hidden />
          </Button>
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="default"
            size="xs"
            className="gap-1"
            disabled={remaining.length === 0}
          >
            <Plus className="size-3" aria-hidden />
            Add
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[220px] p-0">
          <Command>
            <CommandInput placeholder="Add field to copy" />
            <CommandList>
              <CommandEmpty>No fields available</CommandEmpty>
              <CommandGroup>
                {remaining.map((field) => (
                  <CommandItem
                    key={field}
                    value={field}
                    onSelect={() => {
                      onChange([...value, field])
                      setOpen(false)
                    }}
                  >
                    {field}
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

function UnwrapPreviewPane({
  label,
  position,
  total,
  json,
  onPrevious,
  onNext,
  className,
  loading = false,
}: {
  label: string
  position: number
  total: number
  json: string
  onPrevious: () => void
  onNext: () => void
  className?: string
  loading?: boolean
}) {
  return (
    <section aria-label={label} className={cn("flex min-w-0 flex-col", className)}>
      <div className="flex h-8 min-w-0 items-center gap-1 px-2">
        <TableIcon className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {loading ? (
          <Skeleton className="ml-1 h-3 w-12" />
        ) : (
          <span className="ml-1 whitespace-nowrap text-hint text-muted-foreground">
            {position} of {total}
          </span>
        )}
        <div className="ml-auto flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Show previous ${label.toLowerCase()}`}
            disabled={loading}
            onClick={onPrevious}
          >
            <ChevronLeftIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Show next ${label.toLowerCase()}`}
            disabled={loading}
            onClick={onNext}
          >
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="min-h-0 flex-1 space-y-2 px-3 py-2.5">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      ) : (
        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre px-3 py-2 font-mono text-hint leading-4 text-foreground">
          {json}
        </pre>
      )}
    </section>
  )
}

function EventUnwrapPreview({
  eventArrayPath,
  copyFields,
}: {
  eventArrayPath: string
  copyFields: string[]
}) {
  const [recordIndex, setRecordIndex] = React.useState(0)
  const [eventIndex, setEventIndex] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const record = UNWRAP_SOURCE_RECORDS[recordIndex]
  const events = buildLogicalEvents(record, copyFields)
  const safeEventIndex = Math.min(eventIndex, events.length - 1)

  const changeRecord = (next: number) => {
    const count = UNWRAP_SOURCE_RECORDS.length
    setRecordIndex(((next % count) + count) % count)
    setEventIndex(0)
  }

  const changeEvent = (next: number) => {
    const count = events.length
    setEventIndex(((next % count) + count) % count)
  }

  return (
    <div>
      <div className="grid h-[168px] grid-cols-2 overflow-hidden border-y border-input">
        <UnwrapPreviewPane
          label="Source record"
          position={recordIndex + 1}
          total={UNWRAP_SOURCE_RECORDS.length}
          json={formatSourceRecord(record, eventArrayPath)}
          onPrevious={() => changeRecord(recordIndex - 1)}
          onNext={() => changeRecord(recordIndex + 1)}
          className="border-r border-input"
          loading={loading}
        />
        <UnwrapPreviewPane
          label="Logical events"
          position={safeEventIndex + 1}
          total={events.length}
          json={JSON.stringify(events[safeEventIndex], null, 2)}
          onPrevious={() => changeEvent(safeEventIndex - 1)}
          onNext={() => changeEvent(safeEventIndex + 1)}
          loading={loading}
        />
      </div>
      <div className="flex h-6 items-center gap-1.5 border-b border-input px-3 text-hint text-muted-foreground">
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" aria-hidden />
            Building preview…
          </span>
        ) : (
          <>
            <span className="text-foreground">
              {UNWRAP_SOURCE_RECORDS.length} source records
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="text-foreground">{UNWRAP_TOTAL_EVENTS} logical events</span>
            <span className="mx-1 text-muted-foreground">·</span>
            <span className="inline-flex items-center gap-1">
              <Check className="h-3.5 w-3.5 shrink-0 text-[var(--success)]" aria-hidden />
              Preview up to date
            </span>
          </>
        )}
      </div>
    </div>
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
  const [catalogPickerOpen, setCatalogPickerOpen] = React.useState(false)
  const [s3RunAs, setS3RunAs] = React.useState("beau.trincia@databricks.com")
  const [dataSampleLocation, setDataSampleLocation] = React.useState("")
  const [sampleVerification, setSampleVerification] =
    React.useState<VerificationState>("idle")
  const [awsRegion, setAwsRegion] = React.useState("")
  const [regionVerification, setRegionVerification] =
    React.useState<VerificationState>("idle")
  const [managedNotifications, setManagedNotifications] = React.useState(false)
  const [eventPrep, setEventPrep] = React.useState<EventPrepMode>("record")
  const [unwrapMethod, setUnwrapMethod] = React.useState("json-array")
  const [eventArrayPath, setEventArrayPath] = React.useState("Records")
  const [copyFields, setCopyFields] = React.useState<string[]>(["accountId", "region"])
  const [previewExpanded, setPreviewExpanded] = React.useState(true)
  const [previewVisible, setPreviewVisible] = React.useState(true)
  const [s3Prefix, setS3Prefix] = React.useState("")
  const templateController = useIntegrationTemplates()
  const pendingSchemas: string[] = []
  const [catalog, setCatalog] = React.useState("lakewatch")
  const [schema, setSchema] = React.useState("default")
  const [datasourceName, setDatasourceName] = React.useState("lakewatch-account-us-west-2")
  const sampleVerificationTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const regionVerificationTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const prepareEventsRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
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

  const previewReady =
    sampleVerification === "verified" && regionVerification === "verified"
  const previewLoading = Boolean(dataSampleLocation.trim()) && !previewReady
  const schemasReady =
    templateController.selectedNames.length > 0 || pendingSchemas.length > 0
  const showSplitPreview = (activeStep === 2 || activeStep === 3) && schemasReady
  const templatePanelOpen = activeStep === 2 && templateController.panelOpen
  // Collapse the vertical stepper into a compact "Step X / N" button whenever the
  // available width is tight (e.g. the Genie code panel is open) or the template
  // detail panel is shown, so the step form keeps enough room.
  const compact = contentWidth > 0 && contentWidth < 900
  const stepperCollapsed = templatePanelOpen || compact
  const showUnwrapPreview = activeStep === 1 && eventPrep === "unwrap"
  const previewRegion = awsRegion || "us-west-2"
  const isSimpleWizard = kind !== "aws-s3"
  const isExistingTable = kind === "existing-table"
  const simpleConfig = isSimpleWizard ? SIMPLE_WIZARD_CONFIG[kind] : null
  const prefixProviderLabel = getPrefixProviderLabel(kind)

  React.useEffect(
    () => () => {
      if (sampleVerificationTimer.current) clearTimeout(sampleVerificationTimer.current)
      if (regionVerificationTimer.current) clearTimeout(regionVerificationTimer.current)
    },
    []
  )

  React.useEffect(() => {
    if (eventPrep === "unwrap") {
      prepareEventsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [eventPrep])

  const validateSampleLocation = (value: string) => {
    setDataSampleLocation(value)
    if (sampleVerificationTimer.current) clearTimeout(sampleVerificationTimer.current)

    if (!value.trim()) {
      setSampleVerification("idle")
      return
    }

    setSampleVerification("validating")
    sampleVerificationTimer.current = setTimeout(() => {
      setSampleVerification("verified")
      sampleVerificationTimer.current = null
    }, 1100)
  }

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
    }, 1100)
  }

  const dataPreviewSection =
    previewVisible &&
    (activeStep === 1 ||
      ((activeStep === 2 || activeStep === 3) &&
        (previewReady || schemasReady))) ? (
      <section
        aria-label="Data preview"
        className={cn(
          "shrink-0 bg-secondary",
          templatePanelOpen ? undefined : "-mx-5 -mb-5 mt-auto"
        )}
      >
        {showSplitPreview ? (
          <SchemaSplitPreview region={previewRegion} />
        ) : (
          <>
            <div className="flex h-8 items-center justify-between border-y border-input px-2">
              <h2 className="text-sm font-semibold leading-5 text-foreground">
                {showUnwrapPreview
                  ? "Data preview"
                  : previewReady
                    ? "aws_sec_lake_raw"
                    : "Data preview"}
              </h2>
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
              showUnwrapPreview ? (
                <EventUnwrapPreview eventArrayPath={eventArrayPath} copyFields={copyFields} />
              ) : previewReady ? (
                <RawDataPreview region={previewRegion} />
              ) : previewLoading ? (
                <div className="flex h-20 flex-col items-center justify-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-sm leading-5 text-foreground">Loading data preview</p>
                </div>
              ) : (
                <div className="flex h-20 flex-col items-center justify-center gap-1">
                  <TableIcon className="h-9 w-9 text-muted-foreground" />
                  <p className="text-sm leading-5 text-foreground">
                    Configure a table to see a preview
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
            ? "mt-4 w-full"
            : compact
              ? "mx-auto mt-6 w-full max-w-[679px]"
              : "mx-auto mt-6 w-full items-start gap-8 max-w-[1168px] lg:grid-cols-[220px_minmax(0,679px)] lg:gap-20 xl:gap-40"
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
          isSimpleWizard ? (
            <form
              className="flex w-full flex-col gap-6 lg:pt-20"
              onSubmit={(event) => {
                event.preventDefault()
                setActiveStep(2)
              }}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="simple-source-location">Source location *</Label>
                <p className="text-hint text-muted-foreground">
                  {simpleConfig?.sourceHint ?? "Hint text here"}
                </p>
                {isExistingTable ? (
                  <div className="flex">
                    <Input
                      id="simple-source-location"
                      value={sourceLocation}
                      onChange={(event) => setSourceLocation(event.target.value)}
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
                ) : (
                  <Input
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="simple-secondary-location">
                  {isExistingTable ? "View table name" : "Preview location (optional)"}
                </Label>
                <p className="text-hint text-muted-foreground">Hint text here</p>
                <Input
                  id="simple-secondary-location"
                  value={isExistingTable ? viewTableName : dataSampleLocation}
                  onChange={(event) =>
                    isExistingTable
                      ? setViewTableName(event.target.value)
                      : validateSampleLocation(event.target.value)
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-2">
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
            className="flex h-full w-full min-h-0 flex-col overflow-hidden rounded-md border border-input"
            onSubmit={(event) => {
              event.preventDefault()
              setActiveStep(2)
            }}
          >
            <StepPanelHeader
              step={1}
              title="Source location"
              description="Configure the S3 location and credentials Lakewatch should use to access your data"
            />

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-8 pt-6 pb-4">
              <div className="flex flex-col gap-2">
                <Label>S3 source location *</Label>
                <p className="text-hint text-muted-foreground">
                  The S3 path to ingest data from (e.g. s3://my-bucket/logs/).
                </p>
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
              </div>

              <div className="flex flex-col gap-2">
                <Label>S3 sample location (optional)</Label>
                <p className="text-hint text-muted-foreground">
                  An optional S3 path to a smaller sample of the data (e.g.
                  s3://my-bucket/logs/sample/).
                </p>
                <Select value={dataSampleLocation} onValueChange={validateSampleLocation}>
                  <SelectTrigger className="w-full" aria-label="S3 sample location">
                    <SelectValue placeholder="Select an S3 sample location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s3://lakewatch-security-logs/sample/">
                      s3://lakewatch-security-logs/sample/
                    </SelectItem>
                    <SelectItem value="s3://production-cloudtrail/AWSLogs/sample/">
                      s3://production-cloudtrail/AWSLogs/sample/
                    </SelectItem>
                    <SelectItem value="s3://security-data/vpc-flow/sample/">
                      s3://security-data/vpc-flow/sample/
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Run as</Label>
                <p className="text-hint text-muted-foreground">
                  Select the identity Lakewatch uses to access this S3 location.
                </p>
                <Select value={s3RunAs} onValueChange={setS3RunAs}>
                  <SelectTrigger className="w-full" aria-label="S3 Run as">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beau.trincia@databricks.com">
                      Run as: beau.trincia@databricks.com
                    </SelectItem>
                    <SelectItem value="lakewatch-service-principal">
                      Run as: Lakewatch service principal
                    </SelectItem>
                    <SelectItem value="security-platform@databricks.com">
                      Run as: security-platform@databricks.com
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="aws-region">AWS region</Label>
                <p className="text-hint text-muted-foreground">
                  The AWS region of the S3 bucket (e.g. us-east-1).
                </p>
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <AwsRegionTypeahead value={awsRegion} onValueChange={validateRegion} />
                  </div>
                  <VerificationIndicator state={regionVerification} label="AWS region" />
                </div>
              </div>

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

              <div ref={prepareEventsRef} className="flex scroll-mt-6 flex-col gap-3">
                <div>
                  <Label>Prepare events (optional)</Label>
                  <p className="text-hint text-muted-foreground">
                    Choose how Lakewatch turns each source record into one or more logical events.
                  </p>
                </div>
                <RadioGroup
                  value={eventPrep}
                  onValueChange={(value) => setEventPrep(value as EventPrepMode)}
                  className="gap-2"
                >
                  <label
                    htmlFor="event-prep-record"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <RadioGroupItem value="record" id="event-prep-record" />
                    <span className="text-sm text-foreground">
                      Use each source record as one event
                    </span>
                  </label>
                  <label
                    htmlFor="event-prep-unwrap"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <RadioGroupItem value="unwrap" id="event-prep-unwrap" />
                    <span className="text-sm text-foreground">Unwrap source records</span>
                  </label>
                </RadioGroup>

                {eventPrep === "unwrap" ? (
                  <div className="ml-6 flex flex-col gap-4 border-l border-border pl-4">
                    <div className="grid grid-cols-[160px_minmax(0,1fr)] items-center gap-3">
                      <Label htmlFor="unwrap-method" className="font-normal">
                        Unwrap method
                      </Label>
                      <Select value={unwrapMethod} onValueChange={setUnwrapMethod}>
                        <SelectTrigger id="unwrap-method" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                              <Badge variant="secondary" className="h-4 px-1 text-[10px] leading-4">
                                BETA
                              </Badge>
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-[160px_minmax(0,1fr)] items-center gap-3">
                      <Label htmlFor="event-array-path" className="font-normal">
                        Event array path
                      </Label>
                      <Select value={eventArrayPath} onValueChange={setEventArrayPath}>
                        <SelectTrigger id="event-array-path" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Records">Records</SelectItem>
                          <SelectItem value="logEvents">logEvents</SelectItem>
                          <SelectItem value="events">events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-[160px_minmax(0,1fr)] items-start gap-3">
                      <Label className="mt-1.5 font-normal">Copy to each event</Label>
                      <CopyFieldsEditor value={copyFields} onChange={setCopyFields} />
                    </div>
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
        ) : activeStep === 2 ? (
          <form
            className={cn(
              "flex min-h-0 flex-col overflow-hidden rounded-md border border-border",
              templatePanelOpen ? "lg:my-6 lg:ml-5 lg:mr-6" : "w-full h-full"
            )}
            onSubmit={(event) => {
              event.preventDefault()
              setActiveStep(3)
            }}
          >
            <StepPanelHeader
              step={2}
              title="Ingestion templates"
              description={`Specify the ${prefixProviderLabel} prefix and ingestion templates Lakewatch should use to classify your logs`}
            />

            <div className="flex min-h-[370px] flex-1 flex-col overflow-y-auto px-8 py-6 lg:min-h-0">
              <p className="mb-5 text-sm leading-5 text-foreground">
                Enter the {prefixProviderLabel} prefix you would like Lakewatch to read data from
                followed by the ingestion templates that classify data as it comes into Lakewatch.
                You can also add exclusion filters, which will exclude prefixes from being read.
              </p>

              <div className="flex flex-col gap-2">
                <Label htmlFor="s3-prefix">{prefixProviderLabel} Prefix</Label>
                <p className="text-hint text-muted-foreground">
                  The prefix path within the bucket to read from. Leave blank or use an empty string
                  (&quot;&quot;) to create a wildcard (*) prefix and allow ingestion of all files in
                  the bucket.
                </p>
                <Input
                  id="s3-prefix"
                  value={s3Prefix}
                  placeholder="AWSLogs/123456789012/CloudTrail/"
                  onChange={(event) => setS3Prefix(event.target.value)}
                  onFocus={() =>
                    setS3Prefix((current) =>
                      current || "AWSLogs/123456789012/CloudTrail/us-west-2/"
                    )
                  }
                  onClick={() =>
                    setS3Prefix((current) =>
                      current || "AWSLogs/123456789012/CloudTrail/us-west-2/"
                    )
                  }
                />
              </div>

              <div className="mt-4">
                <IntegrationTemplatesField
                  controller={templateController}
                  pendingNames={pendingSchemas}
                />
              </div>
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
                Continue
              </Button>
            </div>
          </form>
        ) : (
          <form
            className="w-full overflow-hidden rounded-md border border-border"
            onSubmit={(event) => {
              event.preventDefault()
              const name =
                datasourceName.trim() || "lakewatch-account-us-west-2"
              const inferredParam = pendingSchemas.length
                ? `?inferred=${pendingSchemas.map(encodeURIComponent).join(",")}`
                : ""
              router.push(
                `/lakewatch/datasources/${encodeURIComponent(name)}${inferredParam}`
              )
            }}
          >
            <StepPanelHeader
              step={3}
              title="Name and Permissions"
              description="Your configured stack was deployed successfully and Lakewatch now has permissions to pull data."
            />

            <div className="flex flex-col px-6 pt-5 pb-4">
              <Label className="mb-2">Datasource name *</Label>
              <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-2">
                <Select value={catalog} onValueChange={setCatalog}>
                  <SelectTrigger className="w-full" aria-label="Catalog">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lakewatch">lakewatch</SelectItem>
                    <SelectItem value="main">main</SelectItem>
                    <SelectItem value="security">security</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={schema} onValueChange={setSchema}>
                  <SelectTrigger className="w-full" aria-label="Schema">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">default</SelectItem>
                    <SelectItem value="bronze">bronze</SelectItem>
                    <SelectItem value="production">production</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  aria-label="Datasource name"
                  value={datasourceName}
                  onChange={(event) => setDatasourceName(event.target.value)}
                  required
                />
              </div>
              <p className="mt-1 text-hint text-muted-foreground">
                {catalog}.{schema}.{datasourceName || "datasource_name"}
              </p>

              <WizardDataTimeRangeField />

              <WizardProcessingScheduleField />

              <p className="mt-5 text-sm leading-5 text-foreground">
                You can now visit your datasource where you can monitor ingestion and make edits
                using the button below. Although setup is complete, please keep in mind that{" "}
                <span className="text-[var(--warning)]">it may take a few minutes</span> for data to
                be imported from your source.
              </p>

              <div className="mt-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveStep(2)}
                >
                  Back
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  View datasource
                </Button>
              </div>
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

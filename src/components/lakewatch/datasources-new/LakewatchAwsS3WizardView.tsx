"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Filter, LoaderCircle, MoreVertical, Search, X } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparkleIcon,
  TableIcon,
} from "@/components/icons"
import { LakewatchWarehouseSelector } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { DbIcon } from "@/components/ui/db-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  "Schemas",
  "Name, Alerts & Permissions",
] as const

type VerificationState = "idle" | "validating" | "verified"

const SCHEMA_OPTIONS = [
  "AWS.ALB",
  "AWS.AuroraMySQLAudit",
  "AWS.BedrockModelInvocation",
  "AWS.CloudFrontAccess",
  "AWS.CloudTrail",
  "AWS.CloudTrailDigest",
  "AWS.Config",
  "AWS.EKS.Audit",
  "AWS.EKS.Authenticator",
  "AWS.ELB",
  "AWS.GuardDuty",
  "AWS.S3ServerAccess",
  "AWS.SecurityHub",
  "AWS.VPCDns",
  "AWS.VPCFlow",
  "AWS.WAF",
  "Atlassian.Audit",
  "Auth0.Events",
  "Azure.Activity",
  "Azure.Audit",
  "Azure.Monitor.Activity",
  "Bitwarden.Events",
  "Box.Event",
  "CARBONBLACK",
  "CarbonBlack.AlertV2",
  "CarbonBlack.Audit",
  "CarbonBlack.EndpointEvent",
  "CarbonBlack.WatchlistHit",
  "Cisco.ASA",
  "Cisco.Duo.Administrator",
  "Cisco.Duo.Auth",
  "Cisco.Duo.OfflineEnrollment",
  "Cisco.Duo.Telephony",
  "Cisco.Umbrella.DNS",
  "Cisco.Umbrella.Proxy",
  "Cloudflare.Audit",
  "Cloudflare.Firewall",
  "Cloudflare.HttpRequest",
  "Cloudflare.Spectrum",
  "Crowdstrike.ActivityAudit",
  "Crowdstrike.Aidmaster",
  "Crowdstrike.DetectionSummary",
  "Crowdstrike.DNSRequest",
  "Crowdstrike.FDREvent",
  "Crowdstrike.NetworkConnect",
  "Crowdstrike.ProcessRollup2",
  "Crowdstrike.UserInfo",
  "Databricks.Audit",
  "Dropbox.TeamEvent",
  "Duo.Administrator",
  "Duo.Authentication",
  "Fastly.Access",
  "GCP.Audit",
  "GCP.DNS",
  "GCP.Firewall",
  "GCP.HTTPLoadBalancer",
  "GitHub.Audit",
  "GitHub.Webhook",
  "GitLab.API",
  "GitLab.Audit",
  "GSuite.ActivityEvent",
  "GSuite.Reports",
  "Heroku.Runtime",
  "Jamf.ComputerInventory",
  "JumpCloud.DirectoryInsights",
  "Microsoft365.Audit.AzureActiveDirectory",
  "Microsoft365.Audit.Exchange",
  "Microsoft365.Audit.General",
  "Microsoft365.Audit.SharePoint",
  "Microsoft365.Dlp.All",
  "MicrosoftGraph.SecurityAlert",
  "Nginx.Access",
  "Notion.Audit",
  "Okta.SystemLog",
  "OneLogin.Events",
  "OnePassword.AuditEvent",
  "OnePassword.ItemUsage",
  "OnePassword.SignInAttempt",
  "Osquery.Batch",
  "Osquery.Differential",
  "Osquery.Snapshot",
  "Osquery.Status",
  "PaloAlto.Firewall",
  "Ping.Directory",
  "Salesforce.Login",
  "Salesforce.Logout",
  "SentinelOne.Activity",
  "SentinelOne.DeepVisibility",
  "SentinelOne.Threat",
  "Slack.AuditLogs",
  "Snyk.GroupAudit",
  "Snyk.OrgAudit",
  "Snowflake.LoginHistory",
  "Snowflake.QueryHistory",
  "Sophos.Central",
  "Suricata.Alert",
  "Suricata.DNS",
  "Suricata.HTTP",
  "Sysdig.Audit",
  "Tailscale.Audit",
  "Tailscale.Network",
  "Tenable.Vulnerability",
  "Torq.Activity",
  "Windows.EventLogs",
  "Zeek.Conn",
  "Zeek.DNS",
  "Zeek.HTTP",
  "Zscaler.ZIA.WebLog",
  "Zscaler.ZPA.UserActivity",
] as const

const DETECTED_SCHEMAS = [
  "AWS.VPCFlow",
  "AWS.ALB",
  "AWS.S3ServerAccess",
  "AWS.CloudTrail",
] as const

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

const INPUT_PREVIEW_DATA: PreviewTableData = {
  columns: ["Time", "data"],
  rows: [
    ["2024-03-15T14:23:41Z", "AssumeRole sts.amazonaws.com IAMUser 203.0.113.42"],
    ["2024-03-15T14:25:07Z", "GetObject s3.amazonaws.com AssumedRole 203.0.113.42"],
    ["2024-03-15T14:31:19Z", "PutObject s3.amazonaws.com AssumedRole 198.51.100.17"],
    ["2024-03-15T15:02:44Z", "CreateUser iam.amazonaws.com IAMUser 198.51.100.17"],
    ["2024-03-15T16:18:55Z", "ListBuckets s3.amazonaws.com Root 192.0.2.88"],
    ["2024-03-15T16:44:02Z", "DeleteObject s3.amazonaws.com AssumedRole 192.0.2.88"],
  ],
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

function WizardStepper({ activeStep }: { activeStep: number }) {
  return (
    <ol aria-label="Datasource setup progress" className="flex flex-col">
      {WIZARD_STEPS.map((label, index) => {
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
            {index < WIZARD_STEPS.length - 1 ? (
              <span className="ml-[13px] h-9 w-px bg-muted-foreground/60" aria-hidden />
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
    <div className="flex min-h-24 flex-col justify-center gap-1 border-b border-input bg-muted px-6 py-4">
      <p className="text-sm font-semibold text-foreground">STEP {step}</p>
      <h2 className="text-lg font-semibold leading-6 text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
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
    <div className="h-[235px] overflow-hidden">
      <div className="flex h-6 items-center border-b border-input px-2">
        <span className="text-sm font-semibold leading-5 text-foreground">data</span>
      </div>
      <div className="overflow-hidden">
        {RAW_PREVIEW_ROWS.map((row, index) => {
          const rawData = JSON.stringify({
            time: row.time,
            data: {
              awsRegion: region,
              eventCategory: "Management",
              eventID: row.eventId,
              eventName: row.eventName,
              eventSource: "ec2.amazonaws.com",
            },
          })

          return (
            <div
              key={`${row.eventId}-${index}`}
              className="flex h-10 min-w-0 items-center border-b border-input"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Expand preview row ${index + 1}`}
                className="shrink-0"
              >
                <ChevronDownIcon className="h-4 w-4 -rotate-90 text-muted-foreground" />
              </Button>
              <span className="min-w-0 flex-1 truncate pr-2 text-sm leading-5 text-foreground">
                {rawData}
              </span>
            </div>
          )
        })}
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
    <div className="h-[175px] overflow-hidden">
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

function SchemaSplitPreview() {
  const [schemaIndex, setSchemaIndex] = React.useState(0)
  const [selectedRowIndex, setSelectedRowIndex] = React.useState<number | null>(null)
  const schema = DETECTED_SCHEMAS[schemaIndex]
  const outputData = SCHEMA_PREVIEW_DATA[schema]

  const showPreviousSchema = () => {
    setSchemaIndex((current) => (current - 1 + DETECTED_SCHEMAS.length) % DETECTED_SCHEMAS.length)
  }

  const showNextSchema = () => {
    setSchemaIndex((current) => (current + 1) % DETECTED_SCHEMAS.length)
  }

  return (
    <>
    <div className="grid h-[207px] grid-cols-[41%_59%] overflow-hidden border-y border-input">
      <section aria-label="Input preview" className="min-w-0 border-r border-input">
        <div className="flex h-8 min-w-0 items-center gap-1 px-2">
          <span className="text-sm font-semibold text-foreground">Input</span>
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          <TableIcon className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground">Bronze</span>
          <span className="ml-2 whitespace-nowrap text-hint text-muted-foreground">
            10 records, 2 columns
          </span>
          <Button variant="default" size="xs" className="ml-2">
            Side-by-side
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
          <PreviewPanelActions />
        </div>
        <PreviewDataTable data={INPUT_PREVIEW_DATA} className="min-w-[650px]" />
      </section>

      <section aria-label={`${schema} output preview`} className="min-w-0">
        <div className="flex h-8 min-w-0 items-center gap-1 px-2">
          <TableIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Output</span>
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Show previous schema"
            onClick={showPreviousSchema}
          >
            <ChevronLeftIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
          <span className="min-w-[118px] truncate text-sm text-primary">{schema}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Show next schema"
            onClick={showNextSchema}
          >
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
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

function SchemaMultiSelect({
  selected,
  onSelectedChange,
  open,
  onOpenChange,
  query,
  onQueryChange,
}: {
  selected: string[]
  onSelectedChange: (schemas: string[]) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  onQueryChange: (query: string) => void
}) {
  const toggleSchema = (schema: string) => {
    onSelectedChange(
      selected.includes(schema)
        ? selected.filter((item) => item !== schema)
        : [...selected, schema]
    )
  }

  const addTypedSchema = () => {
    const schema = query.trim()
    if (!schema) return
    if (!selected.includes(schema)) onSelectedChange([...selected, schema])
    onQueryChange("")
  }

  const removeSchema = (schema: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onSelectedChange(selected.filter((item) => item !== schema))
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          tabIndex={0}
          aria-controls="schema-options"
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex h-auto min-h-8 w-full cursor-pointer items-center justify-start gap-1 rounded border border-input bg-transparent px-2 py-1 text-sm font-normal outline-none hover:border-primary hover:bg-[var(--action-default-bg-hover)] focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onOpenChange(!open)
            }
          }}
        >
          {selected.length > 0 ? (
            <span className="flex min-w-0 flex-wrap gap-1">
              {selected.map((schema) => (
                <Badge key={schema} variant="default_tag" className="pr-0.5">
                  {schema}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="size-4 shrink-0 rounded-sm text-current hover:bg-transparent hover:text-foreground"
                    aria-label={`Remove ${schema}`}
                    onClick={(event) => removeSchema(schema, event)}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <X className="size-3" aria-hidden />
                  </Button>
                </Badge>
              ))}
            </span>
          ) : (
            <span className="text-muted-foreground">Select schemas</span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0"
      >
        <Command>
          <CommandInput
            placeholder="Type or search schemas"
            value={query}
            onValueChange={onQueryChange}
            onKeyDown={(event) => {
              if (event.key === "Enter" && query.trim()) {
                event.preventDefault()
                addTypedSchema()
              }
            }}
          />
          <CommandList id="schema-options" className="max-h-[264px]">
            <CommandEmpty>
              {query.trim() ? "Press Enter to add this schema" : "No schemas found"}
            </CommandEmpty>
            <CommandGroup>
              {SCHEMA_OPTIONS.map((schema) => {
                const checked = selected.includes(schema)
                return (
                  <CommandItem
                    key={schema}
                    value={schema}
                    onSelect={() => toggleSchema(schema)}
                  >
                    <Checkbox checked={checked} aria-label={`Select ${schema}`} />
                    <span>{schema}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/** Figma 2492:126609 form adapted to dark mode with stepper 2499:117853. */
export function LakewatchAwsS3WizardView() {
  const router = useRouter()
  const [activeStep, setActiveStep] = React.useState(1)
  const [sourceLocation, setSourceLocation] = React.useState("")
  const [awsCredentials, setAwsCredentials] = React.useState("")
  const [dataSampleLocation, setDataSampleLocation] = React.useState("")
  const [sampleVerification, setSampleVerification] =
    React.useState<VerificationState>("idle")
  const [awsRegion, setAwsRegion] = React.useState("")
  const [regionVerification, setRegionVerification] =
    React.useState<VerificationState>("idle")
  const [managedNotifications, setManagedNotifications] = React.useState(false)
  const [previewExpanded, setPreviewExpanded] = React.useState(true)
  const [previewVisible, setPreviewVisible] = React.useState(true)
  const [s3Prefix, setS3Prefix] = React.useState("")
  const [selectedSchemas, setSelectedSchemas] = React.useState<string[]>([])
  const [schemaQuery, setSchemaQuery] = React.useState("")
  const [schemaOpen, setSchemaOpen] = React.useState(false)
  const [detectingSchemas, setDetectingSchemas] = React.useState(false)
  const [alarmEnabled, setAlarmEnabled] = React.useState(true)
  const [alarmNumber, setAlarmNumber] = React.useState("1")
  const [alarmPeriod, setAlarmPeriod] = React.useState("days")
  const [catalog, setCatalog] = React.useState("lakewatch")
  const [schema, setSchema] = React.useState("default")
  const [datasourceName, setDatasourceName] = React.useState("lakewatch-account-us-west-2")
  const [runAs, setRunAs] = React.useState("beau.trincia@databricks.com")
  const detectionTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const sampleVerificationTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const regionVerificationTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const detectSchemasDisabled =
    detectingSchemas || selectedSchemas.length > 0 || schemaQuery.trim().length > 0
  const previewReady = sampleVerification === "verified"
  const previewLoading = Boolean(dataSampleLocation.trim()) && !previewReady
  const schemasReady = DETECTED_SCHEMAS.every((schema) => selectedSchemas.includes(schema))
  const showSplitPreview = activeStep === 2 && schemasReady

  React.useEffect(
    () => () => {
      if (detectionTimer.current) clearTimeout(detectionTimer.current)
      if (sampleVerificationTimer.current) clearTimeout(sampleVerificationTimer.current)
      if (regionVerificationTimer.current) clearTimeout(regionVerificationTimer.current)
    },
    []
  )

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

  const detectSchemas = () => {
    if (detectSchemasDisabled) return
    setSchemaOpen(false)
    setDetectingSchemas(true)
    detectionTimer.current = setTimeout(() => {
      setSelectedSchemas([...DETECTED_SCHEMAS])
      setSchemaQuery("")
      setDetectingSchemas(false)
      detectionTimer.current = null
    }, 1400)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 lg:overflow-hidden">
      <div className="flex items-start justify-between gap-4">
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
                <BreadcrumbPage>Add new datasource</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className={PAGE_TITLE_SEMIBOLD}>Create AWS S3 datasource</h1>
        </div>
        <LakewatchWarehouseSelector />
      </div>

      <div className="mx-auto mt-6 grid w-full max-w-[1168px] grid-cols-1 items-start gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[220px_minmax(0,679px)] lg:gap-20 xl:gap-40">
        <WizardStepper activeStep={activeStep} />

        {activeStep === 1 ? (
          <form
            className="flex w-full flex-col overflow-hidden rounded-md border border-input lg:h-full lg:min-h-0"
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
                <Label>AWS credentials</Label>
                <p className="text-hint text-muted-foreground">
                  Optionally select an existing secret scope, or add new credentials, to access a
                  location that requires AWS credentials.
                </p>
                <div className="flex items-center gap-2">
                  <Select value={awsCredentials} onValueChange={setAwsCredentials}>
                    <SelectTrigger className="min-w-0 flex-1" aria-label="AWS credentials">
                      <SelectValue placeholder="Select credentials" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lakewatch-production">
                        lakewatch-production
                      </SelectItem>
                      <SelectItem value="security-ingestion">security-ingestion</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="default" size="sm">
                    Add new
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="data-sample-location">Data sample location (optional)</Label>
                <p className="text-hint text-muted-foreground">
                  An optional S3 path to a smaller sample of the data used to generate the preview
                  instead of the full source location.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    id="data-sample-location"
                    value={dataSampleLocation}
                    onChange={(event) => validateSampleLocation(event.target.value)}
                    onFocus={() => {
                      if (!dataSampleLocation) {
                        validateSampleLocation("s3://production-cloudtrail/AWSLogs/sample/")
                      }
                    }}
                    onClick={() => {
                      if (!dataSampleLocation) {
                        validateSampleLocation("s3://production-cloudtrail/AWSLogs/sample/")
                      }
                    }}
                    placeholder="s3://my-bucket/sample/"
                  />
                  <VerificationIndicator state={sampleVerification} label="Data sample location" />
                </div>
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
        ) : activeStep === 2 ? (
          <form
            className="w-full overflow-hidden rounded-md border border-border"
            onSubmit={(event) => {
              event.preventDefault()
              setActiveStep(3)
            }}
          >
            <StepPanelHeader
              step={2}
              title="Schemas"
              description="Specify the S3 prefix and schemas Lakewatch should use to classify your logs"
            />

            <div className="flex min-h-[370px] flex-col px-8 py-6">
              <p className="mb-5 text-sm leading-5 text-foreground">
                Enter the S3 prefix you would like Lakewatch to read data from followed by the
                schemas that classify data as it comes into Lakewatch. You can also add exclusion
                filters, which will exclude prefixes from being read.
              </p>

              <div className="flex flex-col gap-2">
                <Label htmlFor="s3-prefix">S3 Prefix</Label>
                <p className="text-hint text-muted-foreground">
                  Leave blank to create a wildcard (*) prefix and allow ingestion of all files in
                  the bucket.
                </p>
                <Input
                  id="s3-prefix"
                  value={s3Prefix}
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

              <div className="mt-4 flex flex-col gap-2">
                <Label>Schemas (optional)</Label>
                <p className="text-hint text-muted-foreground">
                  Select schemas Lakewatch should use to parse S3 objects matching the S3 prefix.
                </p>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                  {detectingSchemas ? (
                    <Skeleton className="h-8 w-full rounded" />
                  ) : (
                    <SchemaMultiSelect
                      selected={selectedSchemas}
                      onSelectedChange={setSelectedSchemas}
                      open={schemaOpen}
                      onOpenChange={setSchemaOpen}
                      query={schemaQuery}
                      onQueryChange={setSchemaQuery}
                    />
                  )}
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={detectSchemasDisabled}
                    onClick={detectSchemas}
                  >
                    {detectingSchemas ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <DbIcon icon={SparkleIcon} color="ai" size={16} />
                    )}
                    Detect schemas
                  </Button>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-6">
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
            </div>
          </form>
        ) : (
          <form
            className="w-full overflow-hidden rounded-md border border-border"
            onSubmit={(event) => {
              event.preventDefault()
              router.push(
                `/lakewatch/datasources/${encodeURIComponent(
                  datasourceName.trim() || "lakewatch-account-us-west-2"
                )}`
              )
            }}
          >
            <StepPanelHeader
              step={3}
              title="Name, Alerts & Permissions"
              description="Your configured stack was deployed successfully and Lakewatch now has permissions to pull data."
            />

            <div className="flex min-h-[512px] flex-col px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="source-alarm">
                  Set an alarm in case this source does not process any events?
                </Label>
                <Switch
                  id="source-alarm"
                  checked={alarmEnabled}
                  onCheckedChange={setAlarmEnabled}
                />
              </div>

              {alarmEnabled ? (
                <div className="mt-5 flex items-end justify-between gap-6">
                  <p className="max-w-[330px] text-sm leading-5 text-foreground">
                    How long should Lakewatch wait before it sends you an alert that no events have
                    been processed?
                  </p>
                  <div className="flex items-end gap-2">
                    <div className="flex w-[72px] flex-col gap-2">
                      <Label htmlFor="alarm-number">Number</Label>
                      <Input
                        id="alarm-number"
                        type="number"
                        min="1"
                        value={alarmNumber}
                        onChange={(event) => setAlarmNumber(event.target.value)}
                      />
                    </div>
                    <div className="flex w-[104px] flex-col gap-2">
                      <Label>Period</Label>
                      <Select value={alarmPeriod} onValueChange={setAlarmPeriod}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hour(s)</SelectItem>
                          <SelectItem value="days">Day(s)</SelectItem>
                          <SelectItem value="weeks">Week(s)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="my-5 h-px bg-border" />

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

              <div className="mt-5 flex flex-col gap-2">
                <Label>Run as</Label>
                <Select value={runAs} onValueChange={setRunAs}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beau.trincia@databricks.com">
                      Run datasource as: beau.trincia@databricks.com
                    </SelectItem>
                    <SelectItem value="lakewatch-service-principal">
                      Run datasource as: Lakewatch service principal
                    </SelectItem>
                    <SelectItem value="security-platform@databricks.com">
                      Run datasource as: security-platform@databricks.com
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="mt-5 text-sm leading-5 text-foreground">
                You can now visit your datasource where you can monitor ingestion and make edits
                using the button below. Although setup is complete, please keep in mind that{" "}
                <span className="text-[var(--warning)]">it may take a few minutes</span> for data to
                be imported from your source.
              </p>

              <div className="mt-auto flex items-center justify-between pt-6">
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

      {previewVisible && (activeStep === 1 || (activeStep === 2 && previewReady)) ? (
        <section
          aria-label="Data preview"
          className="-mx-5 -mb-5 mt-4 shrink-0 bg-secondary"
        >
          {showSplitPreview ? (
            <SchemaSplitPreview />
          ) : (
            <>
          <div className="flex h-8 items-center justify-between border-y border-input px-2">
            <h2 className="text-sm font-semibold leading-5 text-foreground">
              {previewReady ? "aws_sec_lake_raw" : "Data preview"}
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
            previewReady ? (
              <RawDataPreview region={awsRegion || "ap-northeast-1"} />
            ) : previewLoading ? (
              <div className="flex h-[94px] flex-col items-center justify-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
                <p className="text-sm leading-5 text-foreground">Loading data preview</p>
              </div>
            ) : (
              <div className="flex h-[94px] flex-col items-center justify-center gap-1">
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
      ) : null}
    </div>
  )
}

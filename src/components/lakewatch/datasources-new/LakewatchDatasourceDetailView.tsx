"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { MoreHorizontal } from "lucide-react"

import {
  CalendarRangeIcon,
  CatalogIcon,
  InfoSmallIcon,
  SearchIcon,
  TableIcon,
} from "@/components/icons"
import {
  LakewatchDatasourceLogo,
  type LakewatchDatasourceLogoKind,
} from "@/components/lakewatch/datasources-new/LakewatchDatasourceLogo"
import { LakewatchWarehouseSelector } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
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

const SOURCE_STATUSES = [
  ["Source created", "2024-12-21 19:26 UTC"],
  ["Last data received", "2026-07-28 04:25 UTC"],
  ["Last data ingested", "2026-07-28 04:24 UTC"],
] as const

const DATASOURCE_SCHEMAS = [
  {
    path: "s3://audit-logs-7830bcf/vpc-",
    schema: "AWS.VPCFlow",
  },
  {
    path: "s3://audit-logs-7830bcf/AWSLogs/2960625/elasticloadbalancing",
    schema: "AWS.ALB",
  },
  {
    path: "s3://audit-logs-7830bcf/",
    schema: "AWS.S3ServerAccess",
  },
  {
    path: "s3://audit-logs-7830bcf/AWSLogs/2960625/CloudTrail",
    schema: "AWS.CloudTrail",
  },
] as const

const DATASOURCE_LOGOS: Record<string, LakewatchDatasourceLogoKind> = {
  fluentbit: "fluentbit",
  slack: "slack",
  "cloudtrail-vpc": "cloudtrail",
  okta: "okta",
  "1password": "1password",
}

const CHART_SERIES = [
  {
    label: "AWS VPCFlow",
    colorClassName: "bg-[var(--tag-text-purple)]",
    src: "/lakewatch/charts/datasource-vpc-flow.svg",
  },
  {
    label: "AWS S3ServerAccess",
    colorClassName: "bg-[var(--tag-text-teal)]",
    src: "/lakewatch/charts/datasource-s3-access.svg",
  },
  {
    label: "AWS ALB",
    colorClassName: "bg-[var(--tag-text-coral)]",
    src: "/lakewatch/charts/datasource-alb.svg",
  },
] as const

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

function MetricCard({
  label,
  value,
  unit,
  approximate,
}: {
  label: string
  value: string
  unit: string
  approximate?: boolean
}) {
  return (
    <div className="rounded bg-muted/70 p-3">
      <div className="flex items-center gap-1">
        <p className="text-sm font-semibold leading-5 text-foreground">{label}</p>
        <InfoSmallIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-1 whitespace-nowrap text-blue-400">
        {approximate ? <span className="text-hint text-foreground">~ </span> : null}
        <span className={cn(PAGE_TITLE_SEMIBOLD, "text-blue-400")}>{value}</span>{" "}
        <span className="text-hint text-foreground">{unit}</span>
      </p>
    </div>
  )
}

function ProcessingScheduleToolbar() {
  const [cadence, setCadence] = React.useState("at-least-every")
  const [interval, setInterval] = React.useState("10")
  const [unit, setUnit] = React.useState("minutes")
  const [active, setActive] = React.useState(true)
  const [editorMode, setEditorMode] = React.useState("ui")
  const [dirty, setDirty] = React.useState(false)

  const markDirty = () => setDirty(true)

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="flex min-w-0 flex-wrap items-center gap-x-[11px] gap-y-2">
        <p className="shrink-0 text-sm font-semibold leading-5 text-foreground">
          Processing schedule
        </p>
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
        <InfoSmallIcon
          size={16}
          className="shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold leading-5 text-foreground">
            Active
          </span>
          <Switch
            checked={active}
            onCheckedChange={(checked) => {
              setActive(checked)
              markDirty()
            }}
            aria-label="Processing schedule active"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="px-3 font-normal text-primary hover:bg-transparent hover:text-primary"
        >
          Advanced options
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-[7px]">
        <SegmentedControl value={editorMode} onValueChange={setEditorMode}>
          <SegmentedItem value="ui">UI</SegmentedItem>
          <SegmentedItem value="yaml">YAML</SegmentedItem>
        </SegmentedControl>
        <Button variant="default" size="sm">
          Permissions
        </Button>
        <Button
          variant="default"
          size="sm"
          disabled={!dirty}
          onClick={() => setDirty(false)}
        >
          Discard changes
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!dirty}
          onClick={() => setDirty(false)}
        >
          Apply changes
        </Button>
      </div>
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

      <div className="mt-5 grid gap-4 xl:grid-cols-[180px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          {CHART_SERIES.map((series) => (
            <div key={series.label} className="flex items-center gap-2 text-sm text-foreground">
              <span className={`size-2 rounded-full ${series.colorClassName}`} aria-hidden />
              {series.label}
            </div>
          ))}
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <SegmentedControl value={scale} onValueChange={setScale}>
              <SegmentedItem value="linear" className="h-6 px-2 text-hint">
                Linear
              </SegmentedItem>
              <SegmentedItem value="logarithmic" className="h-6 px-2 text-hint">
                Logarithmic
              </SegmentedItem>
            </SegmentedControl>
            <Button variant="default" size="xs" onClick={() => setScale("linear")}>
              Reset
            </Button>
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
              {CHART_SERIES.map((series) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={series.label}
                  src={series.src}
                  alt=""
                  className="absolute inset-0 size-full"
                  aria-hidden
                />
              ))}
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
        </div>
      </div>
    </div>
  )
}

function DateRangeControls() {
  return (
    <div className="flex items-center gap-2">
      <Select defaultValue="auto">
        <SelectTrigger className="w-[80px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">Auto</SelectItem>
          <SelectItem value="hour">Hourly</SelectItem>
          <SelectItem value="day">Daily</SelectItem>
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
  )
}

function EventClassificationChart() {
  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[120px_minmax(0,1fr)]">
      <div className="flex flex-col justify-center gap-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span
            className="size-2.5 shrink-0 rounded-full bg-[var(--success)]"
            aria-hidden
          />
          Classified
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="size-2.5 shrink-0 rounded-full bg-destructive" aria-hidden />
          Unclassified
        </div>
      </div>

      <div className="min-w-0">
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lakewatch/charts/datasource-classification.svg"
              alt=""
              className="absolute inset-0 size-full"
              aria-hidden
            />
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
          <DateRangeControls />
        </div>
        <EventClassificationChart />
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold leading-6 text-foreground">
            Source errors (Dead letter Queue)
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

function DatasourceSchemasTab() {
  return (
    <section>
      <h2 className="text-lg font-semibold leading-6 text-foreground">Schemas</h2>
      <Table className="mt-3">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-foreground">Header label</TableHead>
            <TableHead className="font-semibold text-foreground">Header label</TableHead>
            <TableHead className="w-[120px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {DATASOURCE_SCHEMAS.map((row) => (
            <TableRow key={row.schema}>
              <TableCell className="text-foreground">{row.path}</TableCell>
              <TableCell className="text-foreground">{row.schema}</TableCell>
              <TableCell className="text-right">
                <Button variant="default" size="sm" asChild>
                  <Link href={`/lakewatch/schemas/${encodeURIComponent(row.schema)}`}>
                    View data
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
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
    <div className="absolute left-[29px] top-[43px] flex h-[225px] w-[396px] flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-[var(--shadow-db-xs)]">
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lakewatch/normalization-source.png"
          alt="S3 Bucket"
          className="size-6 shrink-0 rounded object-cover"
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
  top,
}: {
  name: (typeof NORMALIZATION_SCHEMAS)[number]
  top: number
}) {
  return (
    <div
      className="absolute left-[521px] flex h-[155px] w-[353px] flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-[var(--shadow-db-xs)]"
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
        <Button variant="default" size="xs">
          View &amp; edit
        </Button>
        <Switch defaultChecked aria-label={`${name} enabled`} size="sm" />
      </div>
    </div>
  )
}

function AddNormalizationButton({ top }: { top: number }) {
  return (
    <Button
      variant="default"
      size="sm"
      className="absolute left-[897px] gap-1 font-normal"
      style={{ top }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/lakewatch/normalization-plus.svg"
        alt=""
        className="size-4 shrink-0 dark:brightness-150"
        aria-hidden
      />
      Normalization
    </Button>
  )
}

function DatasourceNormalizationsTab({ sourceName }: { sourceName: string }) {
  return (
    <div className="relative min-h-[695px] overflow-x-auto overflow-y-hidden rounded-b-md rounded-t border border-border bg-background">
      <div className="relative h-[695px] min-w-[1360px] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 bg-background" />
          <div
            className="absolute inset-0 bg-[length:100px_100px] bg-left-top opacity-20 dark:invert"
            style={{ backgroundImage: 'url("/lakewatch/normalization-canvas.png")' }}
          />
        </div>

        <NormalizationSourceNode sourceName={sourceName} />

        {[
          {
            src: "/lakewatch/normalization-edge-top.svg",
            className: "left-[425px] top-[120px] h-9 w-24 -scale-y-100",
          },
          {
            src: "/lakewatch/normalization-edge-middle.svg",
            className: "left-[425px] top-[155px] h-36 w-24",
          },
          {
            src: "/lakewatch/normalization-edge-bottom.svg",
            className: "left-[425px] top-[155px] h-[317px] w-24",
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
          <SchematizedNode key={name} name={name} top={[42, 220, 393][index]} />
        ))}

        {[
          { left: 421, top: 151 },
          { left: 517, top: 116 },
          { left: 517, top: 294 },
          { left: 517, top: 467 },
        ].map((point) => (
          <span
            key={`${point.left}-${point.top}`}
            className="pointer-events-none absolute size-2 rounded-full border border-grey-600 bg-background"
            style={{ left: point.left, top: point.top }}
            aria-hidden
          />
        ))}

        <AddNormalizationButton top={104} />
        <AddNormalizationButton top={293} />
        <AddNormalizationButton top={464} />
      </div>
    </div>
  )
}

function DetailHeaderControls() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="default"
        size="sm"
        className="min-w-[213px] justify-between gap-2 font-normal"
      >
        <span className="flex items-center gap-2">
          <CatalogIcon size={16} className="text-muted-foreground" aria-hidden />
          <span className="text-foreground">group_7_demo</span>
        </span>
        <span className="text-muted-foreground">⌄</span>
      </Button>
      <LakewatchWarehouseSelector />
    </div>
  )
}

export function LakewatchDatasourceDetailView() {
  const params = useParams<{ sourceId: string }>()
  const sourceName = decodeURIComponent(params.sourceId ?? "lakewatch-account-us-west-2")
  const logoKind = DATASOURCE_LOGOS[sourceName] ?? "cloudtrail"

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
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

          <div className="flex min-w-0 items-center gap-3">
            <LakewatchDatasourceLogo kind={logoKind} size="detail" />
            <div className="min-w-0">
              <h1 className={`${PAGE_TITLE_SEMIBOLD} truncate`}>{sourceName}</h1>
              <p className="text-hint text-foreground">
                S3 Bucket →{" "}
                <span className="text-primary">audit-logs-7830bcf</span>
              </p>
            </div>
          </div>
        </div>
        <DetailHeaderControls />
      </div>

      <Tabs defaultValue="overview" className="mt-5">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="normalizations">Normalization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <ProcessingScheduleToolbar />

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:gap-8">
            <section>
              <h2 className="text-lg font-semibold leading-6 text-foreground">Basic info</h2>
              <dl className="mt-3 grid grid-cols-[112px_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-foreground">Source ID</dt>
                <dd className="text-primary">422e7cbe-3ec2-4c68-9fcf-f04ef87f8170</dd>
                <dt className="text-foreground">AWS account ID</dt>
                <dd className="text-primary">296062572198</dd>
              </dl>
            </section>

            <section>
              <h2 className="text-lg font-semibold leading-6 text-foreground">Source status</h2>
              <dl className="mt-3 flex flex-col gap-2 text-sm">
                {SOURCE_STATUSES.map(([label, date]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[minmax(0,1fr)_170px] items-center gap-4"
                  >
                    <dt className="flex items-center gap-2 text-foreground">
                      <span
                        className="size-2 rounded-full bg-[var(--success)]"
                        aria-hidden
                      />
                      {label}
                    </dt>
                    <dd className="text-muted-foreground">{date}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <div className="my-6 h-px bg-border" />

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold leading-6 text-foreground">Overview stats</h2>
              <DateRangeControls />
            </div>

            <div className="mt-3 grid items-start gap-4 lg:grid-cols-[214px_minmax(0,1fr)]">
              <div className="grid gap-3">
                <MetricCard label="Vol. of data processed" value="2.48" unit="GBs" />
                <MetricCard
                  label="% of total processed data"
                  value="98.52"
                  unit="%"
                  approximate
                />
                <MetricCard label="# of events processed" value="11.57" unit="M" />
              </div>

              <div className="grid min-w-0 gap-4">
                <DataProcessedChart />
                <div className="min-h-[180px] rounded bg-muted/70 p-4">
                  <h3 className="text-sm text-foreground">Events</h3>
                </div>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="schemas" className="pt-4">
          <DatasourceSchemasTab />
        </TabsContent>
        <TabsContent value="health" className="pt-4">
          <DatasourceHealthTab />
        </TabsContent>
        <TabsContent value="normalizations" className="pt-4">
          <DatasourceNormalizationsTab sourceName={sourceName} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

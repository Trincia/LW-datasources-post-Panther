"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { CalendarRangeIcon, InfoSmallIcon } from "@/components/icons"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const SOURCE_STATUSES = [
  ["Source created", "2024-12-21 19:26 UTC"],
  ["Last data received", "2026-07-28 04:25 UTC"],
  ["Last data ingested", "2026-07-28 04:24 UTC"],
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
        <div className="shrink-0">
          <LakewatchWarehouseSelector />
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-5">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:gap-8">
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

        <TabsContent value="schemas" className="pt-4 text-sm text-muted-foreground">
          Detected schemas will appear here.
        </TabsContent>
        <TabsContent value="health" className="pt-4 text-sm text-muted-foreground">
          Source health metrics will appear here.
        </TabsContent>
        <TabsContent value="configuration" className="pt-4 text-sm text-muted-foreground">
          Datasource configuration will appear here.
        </TabsContent>
      </Tabs>
    </div>
  )
}

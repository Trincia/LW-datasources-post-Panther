"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  LoadingIcon,
  PlusIcon,
  SearchIcon,
  XCircleIcon,
} from "@/components/icons"
import {
  LakewatchDatasourceLogo,
  type LakewatchDatasourceLogoKind,
} from "@/components/lakewatch/datasources-new/LakewatchDatasourceLogo"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { cn } from "@/lib/utils"

type DatasourceRow = {
  id: string
  name: string
  logTypes: string[]
  created: string
  lastReceived: string
  logo: LakewatchDatasourceLogoKind
  runHistory: Array<"success" | "failed" | "running">
  events7d: string
  events24h: string
  dlq: string
}

const DATASOURCES: DatasourceRow[] = [
  {
    id: "fluentbit",
    name: "fluentbit webhook",
    logTypes: ["Custom.Fluentbit.Test"],
    created: "2025-01-13 15:31 UTC",
    lastReceived: "2 years ago",
    logo: "fluentbit",
    runHistory: ["success", "success", "success", "success", "running"],
    events7d: "12.5K/7d",
    events24h: "2K/24hr",
    dlq: "3 events",
  },
  {
    id: "slack",
    name: "Slack",
    logTypes: ["Slack.AuditLogs"],
    created: "2025-08-02 21:35 UTC",
    lastReceived: "19 minutes ago",
    logo: "slack",
    runHistory: ["success", "success", "success", "success", "running"],
    events7d: "12.5K/7d",
    events24h: "2K/24hr",
    dlq: "12 events",
  },
  {
    id: "cloudtrail-vpc",
    name: "AWS-Cloudtrail",
    logTypes: ["AWS.VPC.Flow"],
    created: "2025-12-08 10:29 UTC",
    lastReceived: "A few seconds ago",
    logo: "cloudtrail",
    runHistory: ["success", "success", "success", "failed", "failed"],
    events7d: "12.5K/7d",
    events24h: "2K/24hr",
    dlq: "121 events",
  },
  {
    id: "okta",
    name: "Okta",
    logTypes: ["Databricks.Okta.Raw"],
    created: "2025-12-08 10:29 UTC",
    lastReceived: "2 minutes ago",
    logo: "okta",
    runHistory: ["success", "success", "success", "success", "running"],
    events7d: "12.5K/7d",
    events24h: "2K/24hr",
    dlq: "9 events",
  },
  {
    id: "1password",
    name: "1Password",
    logTypes: ["OnePassword.ItemUsage"],
    created: "2026-04-22 18:30 UTC",
    lastReceived: "2 hours ago",
    logo: "1password",
    runHistory: ["success", "success", "success", "success", "running"],
    events7d: "12.5K/7d",
    events24h: "2K/24hr",
    dlq: "15 events",
  },
]

function MetricCard({
  label,
  value,
  valueClassName,
  trend,
}: {
  label: string
  value: React.ReactNode
  valueClassName?: string
  trend?: "up" | "down"
}) {
  return (
    <div className="min-w-0 rounded bg-muted-foreground/20 p-3">
      <p className="text-sm text-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <span className={cn("text-[22px] font-semibold leading-7", valueClassName)}>{value}</span>
        {trend === "up" ? (
          <ArrowUpIcon size={24} className="text-blue-400" aria-hidden />
        ) : null}
        {trend === "down" ? (
          <ArrowDownIcon size={24} className="text-blue-400" aria-hidden />
        ) : null}
      </div>
    </div>
  )
}

function DataProcessedSparkline() {
  return (
    <div className="relative mt-1 -mx-3.5 -mb-3.5 h-12 overflow-hidden" aria-hidden>
      <img
        alt=""
        src="/lakewatch/charts/data-processed-fill.svg"
        className="absolute inset-x-0 top-0 h-[47px] w-full"
      />
      <img
        alt=""
        src="/lakewatch/charts/data-processed-line.svg"
        className="absolute inset-x-0 top-0 h-[34px] w-full"
      />
    </div>
  )
}

function RunHistory({ history }: { history: DatasourceRow["runHistory"] }) {
  return (
    <div className="flex items-center gap-0.5" aria-label="Recent run history">
      {history.map((status, index) => {
        if (status === "failed") {
          return (
            <XCircleIcon
              key={index}
              size={16}
              className="text-destructive"
              ariaLabel="Failed run"
            />
          )
        }
        if (status === "running") {
          return (
            <LoadingIcon
              key={index}
              size={16}
              className="animate-spin text-[var(--success)]"
              ariaLabel="Running"
            />
          )
        }
        return (
          <CheckCircleIcon
            key={index}
            size={16}
            className="text-[var(--success)]"
            ariaLabel="Successful run"
          />
        )
      })}
    </div>
  )
}

/** Figma 2492:126283 — Datasources list. */
export function LakewatchDatasourcesOverviewView() {
  const [filter, setFilter] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return DATASOURCES
    return DATASOURCES.filter((row) => row.name.toLowerCase().includes(q))
  }, [filter])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className={PAGE_TITLE_SEMIBOLD}>Datasources</h1>
          <div className="relative w-[240px]">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter datasources"
              className="pl-9"
              aria-label="Filter datasources"
            />
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <LakewatchDataControls />
          <Button variant="primary" size="sm" asChild>
            <Link href="/lakewatch/datasources/new">
              <PlusIcon size={16} />
              Create datasource
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-[160px_140px_198px_205px_minmax(280px,1fr)]">
        <MetricCard
          label="Total datasources"
          value={String(DATASOURCES.length)}
          valueClassName="text-blue-400"
        />
        <MetricCard label="Unhealthy" value="1" valueClassName="text-destructive" />
        <MetricCard label="Total events last 7 days" value="12.4 M" trend="up" />
        <MetricCard label="Total events last 24 hours" value="1.8 M" trend="down" />
        <div className="min-w-[280px] flex-[1.5] overflow-hidden rounded bg-muted-foreground/20 p-3.5">
          <p className="text-sm text-foreground">Data processed last 7 days</p>
          <DataProcessedSparkline />
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <Table className="min-w-[1180px] table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[22%]">Source name</TableHead>
              <TableHead className="w-[16%]">Log types</TableHead>
              <TableHead className="w-[14%]">Created</TableHead>
              <TableHead className="w-[13%]">Last data received</TableHead>
              <TableHead className="w-[13%]">Run history</TableHead>
              <TableHead className="w-[14%]">Events</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id} className="h-[60px]">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <LakewatchDatasourceLogo kind={row.logo} />
                    <Link
                      href={`/lakewatch/datasources/${encodeURIComponent(row.id)}`}
                      className="truncate text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {row.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {row.logTypes.map((type) => (
                      <Badge key={type} variant="teal" className="font-normal">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{row.created}</TableCell>
                <TableCell className="text-foreground">{row.lastReceived}</TableCell>
                <TableCell>
                  <RunHistory history={row.runHistory} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 whitespace-nowrap text-hint">
                    <span className="flex items-center gap-0.5 text-muted-foreground">
                      {row.events7d}
                      <ArrowUpIcon size={16} className="text-blue-400" aria-hidden />
                    </span>
                    <span className="flex items-center gap-0.5 text-muted-foreground">
                      {row.events24h}
                      <ArrowDownIcon size={16} className="text-blue-400" aria-hidden />
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

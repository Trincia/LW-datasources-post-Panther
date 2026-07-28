"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FileDocumentIcon,
  PlusIcon,
  SearchIcon,
  TableIcon,
} from "@/components/icons"
import { LakewatchWarehouseSelector } from "@/components/lakewatch/LakewatchWarehouseSelector"
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

type DatasourceStatus = "Healthy" | "Unhealthy"

type DatasourceLogo =
  | "document"
  | "aws"
  | "table"
  | "cloudtrail"
  | "slack"
  | "1password"
  | "crowdstrike"
  | "microsoft365"

type DatasourceRow = {
  id: string
  name: string
  status: DatasourceStatus
  logTypes: string[]
  created: string
  lastReceived: string
  lastProcessed: string
  lastIngested: string
  logo: DatasourceLogo
}

const BRAND_LOGOS: Partial<Record<DatasourceLogo, string>> = {
  cloudtrail: "/lakewatch/ingest-v2-logos/cloudtrail.png",
  slack: "/lakewatch/ingest-v2-logos/slack.svg",
  "1password": "/lakewatch/ingest-v2-logos/1password.svg",
  crowdstrike: "/lakewatch/ingest-v2-logos/crowdstrike.svg",
  microsoft365: "/lakewatch/ingest-v2-logos/microsoft-365.svg",
}

const DATASOURCES: DatasourceRow[] = [
  {
    id: "fluentbit",
    name: "fluentbit webhook",
    status: "Healthy",
    logTypes: ["Custom.Fluentbit.Test"],
    created: "2025-01-13 15:31 UTC",
    lastReceived: "2 years ago",
    lastProcessed: "19 minutes ago",
    lastIngested: "a few seconds ago",
    logo: "document",
  },
  {
    id: "cloudtrail-vpc",
    name: "AWS CloudTrail VPC flow logs",
    status: "Healthy",
    logTypes: ["AWS.VPC.Flow"],
    created: "2025-08-02 21:35 UTC",
    lastReceived: "3 days ago",
    lastProcessed: "7 hours ago",
    lastIngested: "3 days ago",
    logo: "cloudtrail",
  },
  {
    id: "okta",
    name: "okta",
    status: "Healthy",
    logTypes: ["Databricks.Okta.Raw"],
    created: "2025-09-29 12:00 UTC",
    lastReceived: "6 months ago",
    lastProcessed: "5 months ago",
    lastIngested: "2 months ago",
    logo: "table",
  },
  {
    id: "aws-service",
    name: "AWS Service logs",
    status: "Unhealthy",
    logTypes: ["Custom.NetworkFirewall"],
    created: "2025-12-08 10:29 UTC",
    lastReceived: "2 months ago",
    lastProcessed: "an hour ago",
    lastIngested: "2 months ago",
    logo: "aws",
  },
  {
    id: "slack",
    name: "Slack",
    status: "Healthy",
    logTypes: ["Slack.AuditLogs"],
    created: "2026-01-14 09:12 UTC",
    lastReceived: "12 minutes ago",
    lastProcessed: "8 minutes ago",
    lastIngested: "a few seconds ago",
    logo: "slack",
  },
  {
    id: "1password",
    name: "1Password",
    status: "Healthy",
    logTypes: ["OnePassword.ItemUsage"],
    created: "2026-02-03 16:44 UTC",
    lastReceived: "1 hour ago",
    lastProcessed: "45 minutes ago",
    lastIngested: "20 minutes ago",
    logo: "1password",
  },
  {
    id: "crowdstrike",
    name: "Crowdstrike Event streams",
    status: "Healthy",
    logTypes: ["Crowdstrike.DetectionSummary"],
    created: "2026-03-11 11:05 UTC",
    lastReceived: "4 minutes ago",
    lastProcessed: "2 minutes ago",
    lastIngested: "a few seconds ago",
    logo: "crowdstrike",
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    status: "Healthy",
    logTypes: ["Microsoft365.Audit.Exchange"],
    created: "2026-04-22 18:30 UTC",
    lastReceived: "25 minutes ago",
    lastProcessed: "18 minutes ago",
    lastIngested: "5 minutes ago",
    logo: "microsoft365",
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
    <div className="min-w-[200px] flex-1 rounded bg-muted-foreground/20 p-3.5">
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
    <div className="relative mt-1 h-12 w-full overflow-hidden" aria-hidden>
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

function SourceLogo({ kind }: { kind: DatasourceLogo }) {
  const brandSrc = BRAND_LOGOS[kind]
  if (brandSrc) {
    return (
      <img
        src={brandSrc}
        alt=""
        className="size-4 shrink-0 rounded object-contain"
        aria-hidden
      />
    )
  }
  if (kind === "aws") {
    return (
      <div
        className="flex size-4 shrink-0 items-center justify-center rounded bg-[#232F3E] text-[8px] font-semibold text-[#FF9900]"
        aria-hidden
      >
        aws
      </div>
    )
  }
  if (kind === "table") {
    return <TableIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
  }
  return <FileDocumentIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
}

function StatusText({ status }: { status: DatasourceStatus }) {
  return (
    <span
      className={cn(
        "text-sm",
        status === "Healthy" ? "text-[var(--success)]" : "text-destructive"
      )}
    >
      {status}
    </span>
  )
}

/** Figma 2496:115823 — Datasources list (dark) */
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
        <h1 className={PAGE_TITLE_SEMIBOLD}>Datasources</h1>
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="relative w-[216px]">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter datasources"
              className="pr-9"
              aria-label="Filter datasources"
            />
            <SearchIcon
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <LakewatchWarehouseSelector />
          <Button variant="primary" size="sm" asChild>
            <Link href="/lakewatch/datasources/new">
              <PlusIcon size={16} />
              Add datasource
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <MetricCard
          label="Total datasources"
          value={String(DATASOURCES.length)}
          valueClassName="text-blue-400"
        />
        <MetricCard label="Unhealthy" value="1" valueClassName="text-destructive" />
        <MetricCard label="Total events last 7 days" value="12.4 M" trend="up" />
        <MetricCard label="Total events last 24 hours" value="1.8 M" trend="down" />
        <div className="min-w-[280px] flex-[1.5] rounded bg-muted-foreground/20 p-3.5">
          <p className="text-sm text-foreground">Data processed last 7 days</p>
          <DataProcessedSparkline />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Source name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Log types</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last data received</TableHead>
              <TableHead>Last data processed</TableHead>
              <TableHead>Last data processed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <SourceLogo kind={row.logo} />
                    <span className="text-sm text-foreground">{row.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusText status={row.status} />
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
                <TableCell className="text-foreground">{row.lastProcessed}</TableCell>
                <TableCell className="text-foreground">{row.lastIngested}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

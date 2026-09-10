"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  SendIcon,
} from "@/components/icons"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"

const OVERVIEW_ROWS = Array.from({ length: 5 }, (_, index) => ({
  id: index,
  resource: "0000-00000-0000-000-000",
}))

export function LakewatchOverviewView() {
  const [question, setQuestion] = React.useState("")
  const [warehouse, setWarehouse] = React.useState("Lakewatch Warehouse")

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-hint text-muted-foreground">
          This overview represents your selected catalog
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="min-w-48 justify-between">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-[var(--success)]"
                  aria-hidden
                />
                <span className="truncate">{warehouse}</span>
              </span>
              <ChevronDownIcon size={16} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {["Lakewatch Warehouse", "Security Analytics Warehouse"].map(
              (option) => (
                <DropdownMenuItem
                  key={option}
                  onSelect={() => setWarehouse(option)}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-[var(--success)]"
                    aria-hidden
                  />
                  {option}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <section className="mx-auto mt-2 flex w-full max-w-[710px] flex-col items-center gap-2">
        <h1 className={`${PAGE_TITLE_SEMIBOLD} text-center`}>
          What do you want to build or investigate with your data?
        </h1>
        <form
          className="bg-ai-gradient relative h-15 w-full rounded-md p-px shadow-[var(--shadow-db-sm)]"
          onSubmit={(event) => event.preventDefault()}
        >
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask Genie anything about your security data..."
            aria-label="Ask Genie about your security data"
            rows={2}
            className="h-full min-h-0 resize-none rounded-md border-0 bg-background px-3 py-2 pb-8 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-background"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon-xs"
            aria-label="Send to Genie"
            className="absolute bottom-2 right-2"
          >
            <SendIcon size={16} className="text-muted-foreground" />
          </Button>
        </form>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <TrendCard
          title="Datasources"
          summary="10 total datasources"
          href="/lakewatch/datasources"
          metricLabel="Total events"
          chartLabel="Events processed in the last 7 days"
          chartBase="/lakewatch/overview/datasources-trend.png"
          chartLine="/lakewatch/overview/datasources-trend-line.svg"
        />
        <TrendCard
          title="Detections"
          summary="20 active rules"
          href="/lakewatch/detection"
          metricLabel="Signals generated"
          chartLabel="Signals generated in the last 7 days"
          chartBase="/lakewatch/overview/detections-trend.png"
          chartLine="/lakewatch/overview/detections-trend-line.svg"
        />
        <IssueCard
          title="System errors"
          itemLabel="High severity system errors"
          idPrefix="sys"
          href="/lakewatch/system-cases"
          openCount={68}
          unassignedCount={0}
          unassignedClassName="text-[var(--success)]"
        />
        <IssueCard
          title="Alerts"
          itemLabel="High severity alerts"
          idPrefix="sec"
          href="/lakewatch/security-cases"
          openCount={13}
          unassignedCount={13}
          unassignedClassName="text-destructive"
        />
      </div>
    </div>
  )
}

function TrendCard({
  title,
  summary,
  href,
  metricLabel,
  chartLabel,
  chartBase,
  chartLine,
}: {
  title: string
  summary: string
  href: string
  metricLabel: string
  chartLabel: string
  chartBase: string
  chartLine: string
}) {
  return (
    <Card className="gap-4 border-secondary bg-secondary p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold leading-6 text-foreground">
            {title}
          </h2>
          <p className="font-semibold text-foreground">{summary}</p>
        </div>
        <Button variant="link" size="xs" asChild>
          <Link href={href}>View all</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricTile
          label={`${metricLabel} last 7 days`}
          value="12.4 M"
          direction="up"
        />
        <MetricTile
          label={`${metricLabel} in the last 24 hours`}
          value="1.8 M"
          direction="down"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-foreground">{chartLabel}</p>
        <div className="relative grid w-full">
          <Image
            src={chartBase}
            alt=""
            width={581}
            height={93}
            className="col-start-1 row-start-1 h-auto w-full"
          />
          <Image
            src={chartLine}
            alt=""
            width={519}
            height={69}
            className="col-start-1 row-start-1 ml-[9%] mt-1 h-[74%] w-[88%]"
          />
        </div>
      </div>
    </Card>
  )
}

function MetricTile({
  label,
  value,
  direction,
}: {
  label: string
  value: string
  direction: "up" | "down"
}) {
  const Icon = direction === "up" ? ArrowUpIcon : ArrowDownIcon

  return (
    <div className="flex flex-col gap-1 rounded bg-muted p-3">
      <p className="text-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <span className={PAGE_TITLE_SEMIBOLD}>{value}</span>
        <Icon
          size={16}
          className={
            direction === "up"
              ? "text-primary"
              : "text-muted-foreground"
          }
        />
      </div>
    </div>
  )
}

function IssueCard({
  title,
  itemLabel,
  idPrefix,
  href,
  openCount,
  unassignedCount,
  unassignedClassName,
}: {
  title: string
  itemLabel: string
  idPrefix: string
  href: string
  openCount: number
  unassignedCount: number
  unassignedClassName: string
}) {
  return (
    <Card className="gap-4 border-secondary bg-secondary p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold leading-6 text-foreground">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="link" size="xs" asChild>
            <Link href={`${href}?status=active`}>View active</Link>
          </Button>
          <Button variant="link" size="xs" asChild>
            <Link href={href}>View all</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CountMetric value={openCount} label="Open in the last 7 days" />
        <CountMetric
          value={unassignedCount}
          label="Unassigned in the last 7 days"
          valueClassName={unassignedClassName}
          alignRight
        />
      </div>

      <div className="border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="font-semibold text-foreground">{itemLabel}</h3>
          <Button variant="link" size="xs" asChild>
            <Link href={href}>View all</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {OVERVIEW_ROWS.map((row) => (
            <div
              key={row.id}
              className="flex h-8 items-center gap-3 rounded border border-border px-3"
            >
              <span className="shrink-0 text-muted-foreground">
                {idPrefix}-270
              </span>
              <span className="min-w-0 flex-1 truncate text-foreground">
                {row.resource}
              </span>
              <Badge variant="coral" className="font-normal">
                Critical
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function CountMetric({
  value,
  label,
  valueClassName = "text-foreground",
  alignRight = false,
}: {
  value: number
  label: string
  valueClassName?: string
  alignRight?: boolean
}) {
  return (
    <div
      className={`flex items-end gap-2 ${
        alignRight ? "sm:justify-end sm:text-right" : ""
      }`}
    >
      <span className={`${PAGE_TITLE_SEMIBOLD} ${valueClassName}`}>{value}</span>
      <span className="pb-1 text-foreground">{label}</span>
    </div>
  )
}

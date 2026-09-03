"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Activity, Clock, Pencil, ShieldCheck } from "lucide-react"

import {
  getDetectionRule,
  type DetectionRuleDetail,
} from "@/components/lakewatch/detection-rules/detectionRuleDetails"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const SEVERITY_BADGE = {
  Critical: "destructive",
  High: "pink",
  Medium: "lemon",
  Low: "secondary",
  Informational: "teal",
} as const

const FIDELITY_BADGE = {
  High: "lime",
  Medium: "lemon",
  Low: "charcoal",
} as const

export function LakewatchDetectionRuleDetailView() {
  const { ruleId } = useParams<{ ruleId: string }>()
  const rule = getDetectionRule(ruleId)

  if (!rule) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Detection rule not found</h1>
        <Button variant="default" size="sm" asChild>
          <Link href="/lakewatch/detection">Back to detection rules</Link>
        </Button>
      </div>
    )
  }

  const systemErrors = buildSystemErrors(rule)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/lakewatch/detection">Detection rules</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{rule.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className={`${PAGE_TITLE_SEMIBOLD} truncate`}>{rule.name}</h1>
            <Badge variant={SEVERITY_BADGE[rule.severity]}>{rule.severity}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{rule.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LakewatchDataControls />
          <Button variant="primary" size="sm" asChild>
            <Link href={`/lakewatch/detection/${rule.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system-errors">
            System errors
            <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold leading-none text-white">
              {systemErrors.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Activity className="h-4 w-4" />}
            label="Signals (last 24h)"
            value={rule.signals24h.toLocaleString()}
          />
          <MetricCard
            icon={<Activity className="h-4 w-4" />}
            label="Signals (last 7d)"
            value={rule.signals7d.toLocaleString()}
          />
          <MetricCard
            icon={<Clock className="h-4 w-4" />}
            label="Last triggered"
            value={rule.lastTriggered}
            compact
          />
          <MetricCard
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Rule status"
            value={rule.active ? "Active" : "Inactive"}
            compact
            trailing={<Switch size="sm" defaultChecked={rule.active} aria-label="Rule active" />}
          />
          </div>

          <div className="my-6 h-px bg-border" />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="flex flex-col gap-6">
              <section>
                <h2 className="text-lg font-semibold leading-6 text-foreground">Rule definition</h2>
                <Card className="mt-3 gap-5 shadow-none">
                  <DetailRow label="Source table" value={rule.sourceTable} mono />
                  <DetailRow label="Summary string" value={rule.summary} />
                  <DetailRow label="Objective" value={rule.objective} />
                  <div>
                    <p className="text-hint font-semibold text-muted-foreground">Detection query</p>
                    <pre className="mt-2 overflow-x-auto rounded border border-border bg-muted p-4 text-hint leading-5 text-foreground">
                      <code>{rule.query}</code>
                    </pre>
                  </div>
                </Card>
              </section>

              <section>
                <h2 className="text-lg font-semibold leading-6 text-foreground">MITRE ATT&amp;CK</h2>
                <Card className="mt-3 grid gap-5 shadow-none md:grid-cols-3">
                  <DetailRow label="Tactic" value={rule.mitreTactic} />
                  <DetailRow label="Technique" value={rule.mitreTechnique} />
                  <DetailRow label="Sub-technique" value={rule.mitreSubtechnique} />
                </Card>
              </section>
            </div>

            <aside className="flex flex-col gap-6">
              <section>
                <h2 className="text-lg font-semibold leading-6 text-foreground">Configuration</h2>
                <Card className="mt-3 gap-5 shadow-none">
                  <DetailRow label="Location" value={`${rule.catalog}.${rule.schema}`} mono />
                  <DetailRow label="Run as" value={rule.runAs} />
                  <DetailRow label="Category" value={rule.category} />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-hint font-semibold text-muted-foreground">Severity</p>
                      <Badge className="mt-1" variant={SEVERITY_BADGE[rule.severity]}>
                        {rule.severity}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-hint font-semibold text-muted-foreground">Fidelity</p>
                      <Badge className="mt-1" variant={FIDELITY_BADGE[rule.fidelity]}>
                        {rule.fidelity}
                      </Badge>
                    </div>
                  </div>
                  <DetailRow label="Schedule" value={`At least every ${rule.scheduleMinutes} minutes`} />
                  <DetailRow label="Job grouping" value={rule.jobGrouping} />
                  <DetailRow label="Performance" value={rule.performance} />
                  <DetailRow label="Last modified" value={rule.lastModified} />
                </Card>
              </section>

              <section>
                <h2 className="text-lg font-semibold leading-6 text-foreground">Annotations</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {rule.annotations.map((annotation) => (
                    <Badge key={annotation} variant="default_tag">
                      {annotation}
                    </Badge>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="system-errors" className="mt-4">
          <SystemErrorsTable rule={rule} errors={systemErrors} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

type DetectionSystemError = {
  id: string
  title: string
  code: string
  runId: string
  state: "Open" | "Resolved"
  severity: "High" | "Medium" | "Low"
  occurred: string
}

function buildSystemErrors(rule: DetectionRuleDetail): DetectionSystemError[] {
  return [
    {
      id: `${rule.id}-query`,
      title: `Detection query timed out after ${rule.scheduleMinutes} minutes`,
      code: "DETECTION_QUERY_TIMEOUT",
      runId: `run-${rule.id.slice(0, 8)}-2841`,
      state: "Open",
      severity: rule.severity === "Critical" || rule.severity === "High" ? "High" : "Medium",
      occurred: "Sep 3, 2026, 10:42 AM",
    },
    {
      id: `${rule.id}-source`,
      title: `Unable to read source table ${rule.sourceTable}`,
      code: "SOURCE_TABLE_UNAVAILABLE",
      runId: `run-${rule.id.slice(0, 8)}-2776`,
      state: "Resolved",
      severity: "Medium",
      occurred: "Sep 2, 2026, 6:15 PM",
    },
  ]
}

function SystemErrorsTable({
  rule,
  errors,
}: {
  rule: DetectionRuleDetail
  errors: DetectionSystemError[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        System errors related to <span className="font-semibold text-foreground">{rule.name}</span>
      </p>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Error</TableHead>
            <TableHead>Error code</TableHead>
            <TableHead>Run ID</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Occurred</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {errors.map((error) => (
            <TableRow key={error.id}>
              <TableCell className="max-w-[360px] whitespace-normal font-semibold">
                {error.title}
              </TableCell>
              <TableCell className="font-mono text-foreground">{error.code}</TableCell>
              <TableCell className="font-mono text-foreground">{error.runId}</TableCell>
              <TableCell className="text-foreground">{rule.name}</TableCell>
              <TableCell>
                <span className={error.state === "Open" ? "text-destructive" : "text-[var(--success)]"}>
                  {error.state}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    error.severity === "High"
                      ? "pink"
                      : error.severity === "Medium"
                        ? "lemon"
                        : "secondary"
                  }
                >
                  {error.severity}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-foreground">
                {error.occurred}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  compact,
  trailing,
}: {
  icon: React.ReactNode
  label: string
  value: string
  compact?: boolean
  trailing?: React.ReactNode
}) {
  return (
    <Card className="gap-3 p-4 shadow-none">
      <div className="flex items-center justify-between gap-2 text-muted-foreground">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-hint">{label}</span>
        </div>
        {trailing}
      </div>
      <p className={compact ? "text-sm font-semibold text-foreground" : "text-2xl font-semibold text-foreground"}>
        {value}
      </p>
    </Card>
  )
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-hint font-semibold text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  )
}

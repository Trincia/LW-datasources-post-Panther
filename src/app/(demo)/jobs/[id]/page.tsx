"use client"

import * as React from "react"
import Link from "next/link"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  CheckCircleFillIcon, XCircleFillIcon, PlayIcon, PencilIcon, OverflowIcon,
  UserIcon, WorkflowsIcon, ClockIcon, TagIcon,
} from "@/components/icons"
import { MoreVertical } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type RunStatus = "success" | "failed" | "running" | "paused"

type Run = {
  id: string
  startTime: string
  duration: string
  trigger: string
  status: RunStatus
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const JOB = {
  id: "1070413125428882",
  name: "Trace Metrics Collector",
  status: "success" as RunStatus,
  trigger: "Scheduled",
  schedule: "Every day at 06:00 UTC",
  cluster: "job-cluster-default",
  runAs: "Alex Rivera",
  tags: ["applied", "production"],
  createdAt: "Mar 12, 2024",
  updatedAt: "Mar 28, 2024",
}

const RUNS: Run[] = [
  { id: "run-9482", startTime: "Apr 1, 2026 06:00 UTC", duration: "4m 12s", trigger: "Scheduled", status: "success" },
  { id: "run-9481", startTime: "Mar 31, 2026 06:00 UTC", duration: "3m 58s", trigger: "Scheduled", status: "success" },
  { id: "run-9480", startTime: "Mar 30, 2026 06:00 UTC", duration: "4m 07s", trigger: "Scheduled", status: "failed" },
  { id: "run-9479", startTime: "Mar 29, 2026 06:00 UTC", duration: "4m 01s", trigger: "Scheduled", status: "success" },
  { id: "run-9478", startTime: "Mar 28, 2026 06:00 UTC", duration: "3m 55s", trigger: "Scheduled", status: "success" },
  { id: "run-9477", startTime: "Mar 27, 2026 06:00 UTC", duration: "4m 18s", trigger: "Scheduled", status: "success" },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RunStatus }) {
  if (status === "success") return <Badge variant="teal">Success</Badge>
  if (status === "failed")  return <Badge variant="destructive">Failed</Badge>
  if (status === "running") return <Badge variant="indigo">Running</Badge>
  return <Badge variant="secondary">Paused</Badge>
}

function RunStatusIcon({ status }: { status: RunStatus }) {
  if (status === "success") return <CheckCircleFillIcon size={14} className="text-[var(--success)] shrink-0" />
  if (status === "failed")  return <XCircleFillIcon size={14} className="text-destructive shrink-0" />
  return <span className="inline-block h-px w-3 shrink-0 rounded bg-muted-foreground/30" />
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5 text-sm text-foreground">{children}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const [activeNav, setActiveNav] = React.useState("workflows")

  return (
    <AppShell activeItem={activeNav} onNavigate={setActiveNav}>
      <div className="flex flex-col gap-4 p-6">

        <PageHeader
          breadcrumbs={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/jobs">Workflows</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/jobs">Jobs</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{JOB.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          title={JOB.name}
          badge={<StatusBadge status={JOB.status} />}
          actions={
            <>
              <Button variant="ghost" size="icon-xs" aria-label="More">
                <MoreVertical className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm">
                <PencilIcon size={14} />
                Edit
              </Button>
              <Button size="sm">
                <PlayIcon size={14} />
                Run now
              </Button>
            </>
          }
        />

        {/* ── Body layout: metadata panel + tabbed content ──────────────── */}
        <div className="flex gap-4 items-start">

          {/* Left: metadata panel */}
          <div className="w-56 shrink-0 flex flex-col gap-4 rounded-md border border-border bg-background p-4">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Details</span>

            <MetaRow label="Trigger">
              <ClockIcon size={14} className="text-muted-foreground shrink-0" />
              {JOB.trigger}
            </MetaRow>

            <MetaRow label="Schedule">
              {JOB.schedule}
            </MetaRow>

            <MetaRow label="Cluster">
              <WorkflowsIcon size={14} className="text-muted-foreground shrink-0" />
              {JOB.cluster}
            </MetaRow>

            <MetaRow label="Run as">
              <UserIcon size={14} className="text-muted-foreground shrink-0" />
              {JOB.runAs}
            </MetaRow>

            <MetaRow label="Tags">
              <div className="flex flex-wrap gap-1">
                {JOB.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </MetaRow>

            <div className="border-t border-border pt-3 flex flex-col gap-3">
              <MetaRow label="Created">{JOB.createdAt}</MetaRow>
              <MetaRow label="Last updated">{JOB.updatedAt}</MetaRow>
            </div>
          </div>

          {/* Right: tabbed content */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="runs">
              <TabsList variant="line">
                <TabsTrigger value="runs">Runs</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>

              {/* ── Runs tab ─────────────────────────────────────────── */}
              <TabsContent value="runs" className="mt-4">
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Run ID</TableHead>
                        <TableHead>Start time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-16" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {RUNS.map((run) => (
                        <TableRow key={run.id} className="group cursor-pointer">
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <RunStatusIcon status={run.status} />
                              <span className="text-primary hover:underline">{run.id}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{run.startTime}</TableCell>
                          <TableCell className="text-muted-foreground">{run.duration}</TableCell>
                          <TableCell className="text-muted-foreground">{run.trigger}</TableCell>
                          <TableCell>
                            <StatusBadge status={run.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon-xs" aria-label="More">
                                <OverflowIcon size={14} className="text-muted-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* ── Settings tab ─────────────────────────────────────── */}
              <TabsContent value="settings" className="mt-4">
                <div className="rounded-md border border-border bg-background p-6">
                  <p className="text-sm text-muted-foreground">Job configuration settings will appear here.</p>
                </div>
              </TabsContent>

              {/* ── Alerts tab ───────────────────────────────────────── */}
              <TabsContent value="alerts" className="mt-4">
                <div className="rounded-md border border-border bg-background p-6">
                  <p className="text-sm text-muted-foreground">Alert rules and notification settings will appear here.</p>
                </div>
              </TabsContent>

            </Tabs>
          </div>

        </div>
      </div>
    </AppShell>
  )
}

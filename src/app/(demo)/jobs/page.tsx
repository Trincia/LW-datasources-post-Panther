"use client"

import * as React from "react"
import Link from "next/link"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SegmentedControl, SegmentedItem } from "@/components/ui/segmented-control"
import { SplitButton } from "@/components/ui/split-button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  IngestionIcon, PipelineIcon, WorkflowsIcon, UserIcon,
  CheckCircleFillIcon, XCircleFillIcon, PlayIcon, PencilIcon, OverflowIcon,
  ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon, SpeechBubbleIcon, SearchIcon,
} from "@/components/icons"
import { ArrowUpDown } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type RunResult = "success" | "failed" | "paused"

type Job = {
  id: string
  name: string
  type: "Job" | "Pipeline"
  tags: string[]
  runAs: string
  trigger: string
  runs: RunResult[]
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const JOBS: Job[] = [
  { id: "1070413125428882", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "Alex Rivera",           trigger: "Scheduled",          runs: ["success","success","success","success","success"] },
  { id: "1180156526663268", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "Jordan Kim",            trigger: "Scheduled",          runs: ["success","success","success","success","paused"]  },
  { id: "2205187525231874", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "Sam Nakamura",          trigger: "Scheduled",          runs: ["success","success","success","success","success"] },
  { id: "2205187525456296", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "Morgan Ellis",          trigger: "Paused · Scheduled", runs: ["paused","paused","paused","success","paused"]  },
  { id: "2205187529774183", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "j.chen@example...",     trigger: "Scheduled",          runs: ["success","success","failed","success","success"] },
  { id: "2205187529788508", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "j.chen@example...",     trigger: "Scheduled",          runs: ["success","success","success","success","success"] },
  { id: "2357704768041035", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "Jordan Kim",            trigger: "Scheduled",          runs: ["success","success","success","success","success"] },
  { id: "2357704768041078", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "Jordan Kim",            trigger: "Scheduled",          runs: ["success","success","success","success","success"] },
  { id: "2357704769666064", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "Jordan Kim",            trigger: "Scheduled",          runs: ["success","success","success","success","success"] },
  { id: "2357704772885819", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "Taylor Okonkwo",        trigger: "Scheduled",          runs: ["success","success","success","success","success"] },
  { id: "2478800509302866", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "Casey Patel",           trigger: "Scheduled",          runs: ["success","success","success","success","success"] },
  { id: "2986608027194381", name: "Trace Metrics Collector", type: "Job", tags: ["applied"], runAs: "Jordan Kim",            trigger: "Scheduled",          runs: ["success","success","success","success","success"] },
]

const CREATE_CARDS = [
  { icon: IngestionIcon, title: "Ingestion pipeline", desc: "Ingest data from apps, databases and files" },
  { icon: PipelineIcon,  title: "ETL pipeline",        desc: "Build ETL pipelines using SQL and Python" },
  { icon: WorkflowsIcon, title: "Job",                  desc: "Orchestrate notebooks, pipelines, queries and more" },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function RunDot({ status }: { status: RunResult }) {
  if (status === "success") return <CheckCircleFillIcon size={14} className="text-[var(--success)] shrink-0" />
  if (status === "failed")  return <XCircleFillIcon     size={14} className="text-destructive shrink-0" />
  return <span className="inline-block h-px w-3 shrink-0 rounded bg-muted-foreground/30" />
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [activeNav, setActiveNav]         = React.useState("workflows")
  const [createOpen, setCreateOpen]       = React.useState(true)
  const [typeFilter, setTypeFilter]       = React.useState("jobs")
  const [ownerFilter, setOwnerFilter]     = React.useState("accessible")
  const [tagsFilter, setTagsFilter]       = React.useState("")
  const [runAsFilter, setRunAsFilter]     = React.useState("")

  return (
    <AppShell activeItem={activeNav} onNavigate={setActiveNav}>
      <div className="flex flex-col gap-4 p-6">

        <PageHeader title="Jobs & Pipelines" />

        {/* ── Create new ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCreateOpen((v) => !v)}
            className="gap-1 px-0 justify-start text-foreground hover:text-primary hover:bg-transparent"
          >
            {createOpen
              ? <ChevronDownIcon  size={14} className="text-muted-foreground" />
              : <ChevronRightIcon size={14} className="text-muted-foreground" />}
            <span>Create new</span>
          </Button>

          {createOpen && (
            <div className="grid grid-cols-3 gap-3">
              {CREATE_CARDS.map((card) => (
                <Button
                  key={card.title}
                  variant="ghost"
                  className="h-auto w-full justify-start gap-3 rounded border border-border bg-background px-4 py-3 text-left hover:bg-secondary"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary">
                    <card.icon size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-foreground">{card.title}</span>
                    <span className="truncate text-xs text-muted-foreground">{card.desc}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <Tabs defaultValue="jobs">

          {/* Tab bar + send feedback */}
          <div className="flex items-center justify-between border-b border-border">
            <TabsList variant="line" className="border-b-0">
              <TabsTrigger value="jobs">Jobs &amp; pipelines</TabsTrigger>
              <TabsTrigger value="runs">Runs</TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="xs" className="gap-1 text-primary">
              <SpeechBubbleIcon size={14} />
              Send feedback
            </Button>
          </div>

          <TabsContent value="jobs" className="mt-4 flex flex-col gap-3">

            {/* ── Filter toolbar ─────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2">

              {/* Search */}
              <div className="relative">
                <SearchIcon size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="w-52 pl-8 text-xs" placeholder="Filter by name or ID s..." />
              </div>

              {/* Type toggle */}
              <SegmentedControl value={typeFilter} onValueChange={setTypeFilter}>
                <SegmentedItem value="all">All</SegmentedItem>
                <SegmentedItem value="jobs">Jobs</SegmentedItem>
                <SegmentedItem value="pipelines">Pipelines</SegmentedItem>
              </SegmentedControl>

              {/* Owner toggle */}
              <SegmentedControl value={ownerFilter} onValueChange={setOwnerFilter}>
                <SegmentedItem value="all">All</SegmentedItem>
                <SegmentedItem value="owned">Owned by me</SegmentedItem>
                <SegmentedItem value="accessible">Accessible by me</SegmentedItem>
                <SegmentedItem value="favorites">Favorites</SegmentedItem>
              </SegmentedControl>

              <Select value={tagsFilter} onValueChange={setTagsFilter}>
                <SelectTrigger className="w-auto min-w-[80px]">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">applied</SelectItem>
                  <SelectItem value="production">production</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                </SelectContent>
              </Select>

              <Select value={runAsFilter} onValueChange={setRunAsFilter}>
                <SelectTrigger className="w-auto min-w-[90px]">
                  <SelectValue placeholder="Run as" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="me">Run as me</SelectItem>
                  <SelectItem value="service">Service principal</SelectItem>
                </SelectContent>
              </Select>

              <SplitButton className="ml-auto">Create</SplitButton>
            </div>

            {/* ── Table ──────────────────────────────────────────────── */}
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-72">
                      <div className="flex items-center gap-1">
                        Name <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Run as</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Recent runs</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {JOBS.map((job) => (
                    <TableRow key={job.id} className="group cursor-pointer">

                      {/* Name */}
                      <TableCell className="max-w-72 truncate">
                        <Link href={`/jobs/${job.id}`} className="truncate text-primary hover:underline">
                          [{job.id}] {job.name}
                        </Link>
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <WorkflowsIcon size={14} className="shrink-0 text-muted-foreground" />
                          <span>{job.type}</span>
                        </div>
                      </TableCell>

                      {/* Tags */}
                      <TableCell className="text-muted-foreground text-xs">
                        {job.tags.join(", ")}
                      </TableCell>

                      {/* Run as */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <UserIcon size={14} className="shrink-0" />
                          <span className="max-w-[140px] truncate">{job.runAs}</span>
                        </div>
                      </TableCell>

                      {/* Trigger */}
                      <TableCell className="text-muted-foreground">{job.trigger}</TableCell>

                      {/* Recent runs */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {job.runs.map((r, i) => <RunDot key={i} status={r} />)}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon-xs" aria-label="Run">
                            <PlayIcon size={14} className="text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon-xs" aria-label="Edit">
                            <PencilIcon size={14} className="text-muted-foreground" />
                          </Button>
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

            {/* ── Pagination ─────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="xs" disabled className="gap-1">
                <ChevronLeftIcon size={12} /> Previous
              </Button>
              <Button variant="ghost" size="xs" className="gap-1">
                Next <ChevronRightIcon size={12} />
              </Button>
            </div>

          </TabsContent>

          <TabsContent value="runs" className="mt-4">
            <p className="text-sm text-muted-foreground">Run history will appear here.</p>
          </TabsContent>

        </Tabs>
      </div>
    </AppShell>
  )
}

"use client"

import * as React from "react"
import { AppShell, PageHeader } from "@/components/shell"
import { FilterBar } from "@/components/shell/FilterBar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationPrevious, PaginationNext,
} from "@/components/ui/pagination"
import { CheckCircleFillIcon, XCircleFillIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type ClusterStatus = "Running" | "Stopped" | "Terminated"

type Cluster = {
  id: string
  name: string
  description: string
  status: ClusterStatus
  creator: string
  tags: string[]
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const ALL_PURPOSE: Cluster[] = [
  { id: "1", name: "Shared",                description: "Daily ETL processing",  status: "Running",  creator: "Alex Rivera",  tags: [] },
  { id: "2", name: "Agent eval CI cluster", description: "Weekly aggregation",     status: "Stopped",  creator: "Jordan Kim",   tags: [] },
  { id: "3", name: "Reyden",                description: "Real-time ingestion",    status: "Running",  creator: "Sam Nakamura", tags: [] },
  { id: "4", name: "Dev sandbox",           description: "Exploratory analysis",   status: "Stopped",  creator: "Morgan Ellis", tags: [] },
]

const JOB_COMPUTE: Cluster[] = [
  { id: "5", name: "Job cluster A",  description: "Nightly batch job",     status: "Running",    creator: "Taylor Okonkwo", tags: [] },
  { id: "6", name: "Job cluster B",  description: "Data quality checks",   status: "Terminated", creator: "Casey Patel",    tags: [] },
]

const SQL_WAREHOUSES: Cluster[] = [
  { id: "7", name: "Starter Warehouse", description: "Shared SQL endpoint", status: "Running", creator: "Alex Rivera", tags: [] },
  { id: "8", name: "Pro Warehouse",     description: "Dedicated endpoint",  status: "Stopped", creator: "Jordan Kim",  tags: [] },
]

// ─── Status indicator ─────────────────────────────────────────────────────────

function StatusCell({ status }: { status: ClusterStatus }) {
  if (status === "Running") {
    return (
      <span className="flex items-center gap-1.5 text-[var(--success)]">
        <CheckCircleFillIcon className="h-3.5 w-3.5 shrink-0" />
        Running
      </span>
    )
  }
  if (status === "Stopped") {
    return (
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <XCircleFillIcon className="h-3.5 w-3.5 shrink-0" />
        Stopped
      </span>
    )
  }
  return (
    <span className="text-muted-foreground">Terminated</span>
  )
}

// ─── Cluster table ────────────────────────────────────────────────────────────

const PAGE_SIZE = 4

function ClusterTable({ clusters }: { clusters: Cluster[] }) {
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")
  const [creatorFilter, setCreatorFilter] = React.useState("")
  const [tagsFilter, setTagsFilter] = React.useState("")

  const filtered = clusters.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.includes(search)
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchCreator = !creatorFilter || c.creator === creatorFilter
    return matchSearch && matchStatus && matchCreator
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageRows = filtered.slice(start, start + PAGE_SIZE)

  const creators = [...new Set(clusters.map((c) => c.creator))]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FilterBar
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1) }}
          searchPlaceholder="Filter by name or ID..."
          selects={[
            {
              value: statusFilter,
              onValueChange: (v) => { setStatusFilter(v === "_all" ? "" : v); setPage(1) },
              placeholder: "Status",
              options: [
                { value: "_all",       label: "All statuses" },
                { value: "Running",    label: "Running" },
                { value: "Stopped",    label: "Stopped" },
                { value: "Terminated", label: "Terminated" },
              ],
            },
            {
              value: creatorFilter,
              onValueChange: (v) => { setCreatorFilter(v === "_all" ? "" : v); setPage(1) },
              placeholder: "Creator",
              options: [
                { value: "_all", label: "All creators" },
                ...creators.map((c) => ({ value: c, label: c })),
              ],
            },
            {
              value: tagsFilter,
              onValueChange: (v) => { setTagsFilter(v === "_all" ? "" : v); setPage(1) },
              placeholder: "Tags",
              options: [{ value: "_all", label: "All tags" }],
            },
          ]}
          className="flex-1"
        />
        <Button size="sm" onClick={() => {}}>
          Create Compute
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                No clusters found.
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((cluster) => (
              <TableRow key={cluster.id}>
                <TableCell className="font-medium">{cluster.name}</TableCell>
                <TableCell>{cluster.description}</TableCell>
                <TableCell><StatusCell status={cluster.status} /></TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end">
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }}
                aria-disabled={page === 1}
                className={cn(page === 1 && "pointer-events-none opacity-40")}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 text-sm text-muted-foreground">
                {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }}
                aria-disabled={page === totalPages}
                className={cn(page === totalPages && "pointer-events-none opacity-40")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComputePage() {
  return (
    <AppShell activeItem="compute" workspace="Production" userInitial="N">
      <div className="flex flex-col gap-4 p-6">
        <PageHeader title="Compute" />

        <Tabs defaultValue="all-purpose">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="all-purpose">All-purpose compute</TabsTrigger>
            <TabsTrigger value="job-compute">Job compute</TabsTrigger>
            <TabsTrigger value="sql-warehouses">SQL warehouses</TabsTrigger>
          </TabsList>

          <TabsContent value="all-purpose" className="mt-4">
            <ClusterTable clusters={ALL_PURPOSE} />
          </TabsContent>
          <TabsContent value="job-compute" className="mt-4">
            <ClusterTable clusters={JOB_COMPUTE} />
          </TabsContent>
          <TabsContent value="sql-warehouses" className="mt-4">
            <ClusterTable clusters={SQL_WAREHOUSES} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

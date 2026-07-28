"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell, PageHeader } from "@/components/shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  BarChartIcon, StarFillIcon, OverflowIcon,
  SearchIcon,
} from "@/components/icons"
import { ArrowUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type DashStatus = "Published" | "Draft"

type Dashboard = {
  id: string
  name: string
  status: DashStatus
  owner: string
  updatedAt: string
  tags: string[]
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const FEATURED = [
  { id: "f1", name: "Executive KPIs",       desc: "Revenue, orders, and growth trends",    color: "bg-blue-50 dark:bg-blue-950/40" },
  { id: "f2", name: "Supply Chain Monitor", desc: "Inventory, lead times, and throughput", color: "bg-purple-50 dark:bg-purple-950/40" },
  { id: "f3", name: "Customer Segments",    desc: "Cohort analysis and LTV breakdown",     color: "bg-teal-50 dark:bg-teal-950/40" },
]

const DASHBOARDS: Dashboard[] = [
  { id: "1", name: "Executive KPIs",            status: "Published", owner: "Joy Xie",       updatedAt: "Mar 30, 2026, 02:15 PM", tags: ["finance"] },
  { id: "2", name: "Supply Chain Monitor",       status: "Published", owner: "Alex Rivera",   updatedAt: "Mar 28, 2026, 11:40 AM", tags: ["ops"] },
  { id: "3", name: "Customer Segments",          status: "Published", owner: "Jordan Kim",    updatedAt: "Mar 25, 2026, 09:00 AM", tags: ["marketing"] },
  { id: "4", name: "Avocado Dashboard",          status: "Draft",     owner: "Joy Xie",       updatedAt: "Mar 20, 2026, 04:30 PM", tags: [] },
  { id: "5", name: "Regional Sales Summary",     status: "Published", owner: "Sam Nakamura",  updatedAt: "Mar 18, 2026, 03:00 PM", tags: ["sales"] },
  { id: "6", name: "Order Analysis",             status: "Published", owner: "Morgan Ellis",  updatedAt: "Mar 15, 2026, 01:00 PM", tags: ["ops", "finance"] },
  { id: "7", name: "7-Day Trailing Revenue",     status: "Draft",     owner: "Casey Patel",   updatedAt: "Mar 10, 2026, 10:30 AM", tags: ["finance"] },
  { id: "8", name: "MTD Pipeline Dashboard",     status: "Published", owner: "Taylor Okonkwo", updatedAt: "Mar 08, 2026, 09:15 AM", tags: ["sales"] },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardsPage() {
  const [activeNav, setActiveNav] = React.useState("dashboards")
  const [search, setSearch]       = React.useState("")
  const [ownerFilter, setOwnerFilter] = React.useState("")
  const [starred, setStarred]     = React.useState<Record<string, boolean>>({ "1": true })
  const router = useRouter()

  const filtered = DASHBOARDS.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
    const matchOwner  = !ownerFilter || d.owner === ownerFilter
    return matchSearch && matchOwner
  })

  return (
    <AppShell activeItem={activeNav} onNavigate={setActiveNav}>
      <div className="flex flex-col gap-6 p-6">

        <PageHeader
          title="Dashboards"
          actions={
            <Button variant="default" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create dashboard
            </Button>
          }
        />

        {/* ── Featured ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Featured</h2>
          <div className="grid grid-cols-3 gap-3">
            {FEATURED.map((item) => (
              <Link
                key={item.id}
                href="/dashboards/detail"
                className="group flex flex-col gap-3 rounded-md border border-border bg-background hover:border-primary/40 transition-colors overflow-hidden"
              >
                <div className={cn("flex h-28 items-center justify-center", item.color)}>
                  <BarChartIcon size={32} className="text-primary/30 group-hover:text-primary/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-0.5 px-3 pb-3">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </span>
                  <span className="text-hint text-muted-foreground">{item.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <SearchIcon size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="w-52 pl-8" placeholder="Search dashboards" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-auto min-w-[100px]">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Joy Xie">Joy Xie</SelectItem>
              <SelectItem value="Alex Rivera">Alex Rivera</SelectItem>
              <SelectItem value="Jordan Kim">Jordan Kim</SelectItem>
              <SelectItem value="Sam Nakamura">Sam Nakamura</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-auto min-w-[80px]">
              <SelectValue placeholder="Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="finance">finance</SelectItem>
              <SelectItem value="ops">ops</SelectItem>
              <SelectItem value="sales">sales</SelectItem>
              <SelectItem value="marketing">marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>
                  <div className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Last updated</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((dash) => (
                <TableRow key={dash.id} className="group cursor-pointer" onClick={() => router.push("/dashboards/detail")}>
                  {/* Star */}
                  <TableCell className="w-8 pr-0">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        setStarred((p) => ({ ...p, [dash.id]: !p[dash.id] }))
                      }}
                      aria-label={starred[dash.id] ? "Remove from favorites" : "Add to favorites"}
                      className={cn(
                        "transition-colors",
                        starred[dash.id]
                          ? "text-[var(--color-star)]"
                          : "text-transparent group-hover:text-muted-foreground/40 hover:!text-[var(--color-star)]"
                      )}
                    >
                      <StarFillIcon size={14} />
                    </Button>
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BarChartIcon size={16} className="shrink-0 text-primary" />
                      <Link
                        href="/dashboards/detail"
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {dash.name}
                      </Link>
                    </div>
                  </TableCell>

                  {/* Status — plain text with dot indicator */}
                  <TableCell>
                    <span className={cn(
                      "flex items-center gap-1.5 text-sm",
                      dash.status === "Published" ? "text-foreground" : "text-muted-foreground"
                    )}>
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        dash.status === "Published" ? "bg-[var(--success)]" : "bg-muted-foreground/40"
                      )} />
                      {dash.status}
                    </span>
                  </TableCell>

                  {/* Tags */}
                  <TableCell>
                    <div className="flex gap-1">
                      {dash.tags.map((t) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">{dash.owner}</TableCell>
                  <TableCell className="text-muted-foreground">{dash.updatedAt}</TableCell>

                  {/* Overflow */}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="More options"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <OverflowIcon size={14} className="text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>
    </AppShell>
  )
}

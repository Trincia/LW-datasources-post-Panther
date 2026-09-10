"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowsUpDownIcon, PlusIcon, SearchIcon } from "@/components/icons"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
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
import { NORMALIZER_GROUPS } from "@/components/lakewatch/normalizers/normalizers"

function SortableHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <TableHead className={`h-10 py-3 font-semibold ${className ?? ""}`}>
      <span className="flex items-center justify-between gap-2">
        {children}
        <ArrowsUpDownIcon size={16} className="text-muted-foreground" aria-hidden />
      </span>
    </TableHead>
  )
}

/** Figma 1:6896 — Normalizers list (P1). */
export function LakewatchNormalizersView() {
  const [query, setQuery] = React.useState("")

  const groups = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return NORMALIZER_GROUPS.map((group) => {
      if (!normalizedQuery) return group
      return {
        ...group,
        rows: group.rows.filter(
          (row) =>
            row.identifier.toLowerCase().includes(normalizedQuery) ||
            row.displayName.toLowerCase().includes(normalizedQuery) ||
            row.sourceParser.toLowerCase().includes(normalizedQuery) ||
            row.targetEventClass.toLowerCase().includes(normalizedQuery) ||
            row.type.toLowerCase().includes(normalizedQuery) ||
            row.creator.toLowerCase().includes(normalizedQuery)
        ),
      }
    }).filter((group) => group.rows.length > 0)
  }, [query])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className={PAGE_TITLE_SEMIBOLD}>Normalizers</h1>
            <div className="flex shrink-0 items-center gap-4">
            <Button variant="primary" size="sm" asChild>
              <Link href="/lakewatch/normalizers/new">
                <PlusIcon size={16} />
                Create
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative w-[240px]">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter normalizers"
            aria-label="Filter normalizers"
            className="pl-9"
          />
        </div>

        <div className="min-h-0 overflow-x-auto">
          <Table className="min-w-[1180px] table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 w-[32%] py-3">Normalizer name</TableHead>
                <TableHead className="h-10 w-[15%] py-3">Source Parser / Log Type</TableHead>
                <TableHead className="h-10 w-[16%] py-3">Target OCSF Event Class</TableHead>
                <SortableHeader className="w-[9%]">Type</SortableHeader>
                <SortableHeader className="w-[17%]">Latest version date/time</SortableHeader>
                <SortableHeader className="w-[11%]">Creator</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <React.Fragment key={group.id}>
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="bg-muted/50 py-2">
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{group.name}</span>
                        <span className="text-muted-foreground">Class {group.classUid}</span>
                        <Badge variant="secondary" className="font-normal">
                          {group.rows.length}
                        </Badge>
                      </span>
                    </TableCell>
                  </TableRow>
                  {group.rows.map((row) => (
                    <TableRow key={row.identifier} className="h-14">
                      <TableCell className="py-4">
                        <Link
                          href={`/lakewatch/normalizers/${encodeURIComponent(row.identifier)}`}
                          title={row.displayName}
                          className="block truncate text-primary underline underline-offset-4"
                        >
                          {row.displayName}
                        </Link>
                      </TableCell>
                      <TableCell className="py-4 text-foreground">{row.sourceParser}</TableCell>
                      <TableCell className="py-4 text-foreground">{row.targetEventClass}</TableCell>
                      <TableCell className="py-4">
                        {row.type === "built-in" ? (
                          <Badge variant="teal">Built-in</Badge>
                        ) : (
                          <Badge variant="brown">Custom</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-foreground">{row.latestVersion}</TableCell>
                      <TableCell className="py-4 text-foreground">{row.creator}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

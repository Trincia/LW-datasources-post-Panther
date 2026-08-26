"use client"

import * as React from "react"
import Link from "next/link"

import { CatalogIcon, DatasourceNavIcon, SearchDataIcon } from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { getDataModel } from "@/components/lakewatch/data-models/dataModels"
import { getNormalizerBlueprint } from "@/components/lakewatch/normalizers/normalizers"
import type { SourceField } from "@/components/lakewatch/normalizers/normalizerModel"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Deterministic mock value generation ────────────────────────────────────

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function makeRng(seed: string): () => number {
  let state = hashString(seed) || 1
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 4294967296
  }
}

const EMAILS = ["alice.nguyen", "diego.ramos", "priya.shah", "marcus.lee", "sara.kim"]

function flattenLeaves(fields: SourceField[]): SourceField[] {
  const out: SourceField[] = []
  for (const field of fields) {
    if (field.children && field.children.length) out.push(...flattenLeaves(field.children))
    else out.push(field)
  }
  return out
}

function sourceSampleValue(seedKey: string, field: SourceField, rowSeed: string): string {
  const rng = makeRng(`${seedKey}:${field.path}:${rowSeed}`)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
  const type = field.type.toLowerCase()
  const leaf = (field.path.split(".").pop() ?? "").toLowerCase()

  if (field.nullable && rng() < 0.4) return "(null)"

  if (type.includes("timestamp")) {
    const base = Date.UTC(2026, 7, 20, 21, 40, 0)
    return new Date(base - Math.floor(rng() * 6_000_000))
      .toISOString()
      .replace("T", " ")
      .slice(0, 19)
  }
  if (type.includes("bool")) return rng() < 0.5 ? "true" : "false"
  if (type.includes("int") || type.includes("long") || type.includes("double") || type.includes("number")) {
    const numeric = Number(field.sample)
    if (Number.isFinite(numeric)) {
      const spread = Math.abs(numeric) || 100
      return String(Math.max(0, Math.round(numeric + (rng() - 0.5) * spread)))
    }
    return String(Math.floor(rng() * 100000))
  }
  if (leaf.includes("ip") || /^\d+\.\d+\.\d+\.\d+$/.test(field.sample)) {
    return `${10 + Math.floor(rng() * 40)}.${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}`
  }
  if (field.sample.includes("@")) return `${pick(EMAILS)}@acme.com`
  if (leaf === "id" || leaf.endsWith("_id") || leaf.endsWith("uid") || leaf.endsWith("_uid")) {
    return Math.floor(rng() * 1e12)
      .toString(16)
      .padStart(12, "0")
  }
  // Plain strings: keep the representative sample so the column reads coherently.
  return field.sample
}

const SAMPLE_ROW_OPTIONS = [100, 500, 1000, 5000]

// ─── Source data preview view ───────────────────────────────────────────────

export function LakewatchSourceDataPreviewView({
  modelId,
  sourceId,
}: {
  modelId: string
  sourceId: string
}) {
  const model = getDataModel(modelId)
  const blueprint = getNormalizerBlueprint(sourceId)
  const [sampleRows, setSampleRows] = React.useState(1000)

  const leaves = React.useMemo(
    () => (blueprint ? flattenLeaves(blueprint.source.fields) : []),
    [blueprint]
  )
  const previewRows = React.useMemo(
    () => Array.from({ length: Math.min(50, sampleRows) }, (_, index) => `r${index}`),
    [sampleRows]
  )

  if (!blueprint) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Source not found</h1>
        <p className="text-sm text-muted-foreground">No source matches “{sourceId}”.</p>
        <Button variant="link" size="sm" asChild className="w-fit px-0">
          <Link href={`/lakewatch/normalized-data/${encodeURIComponent(modelId)}`}>
            Back to Data models
          </Link>
        </Button>
      </div>
    )
  }

  const isParser = blueprint.source.kind === "parsed"

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/lakewatch/normalized-data">Data models</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/lakewatch/normalized-data/${encodeURIComponent(modelId)}`}>
                  {model?.name ?? modelId}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{blueprint.sourceParser} data</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              {isParser ? (
                <DatasourceNavIcon size={20} className="shrink-0 text-muted-foreground" />
              ) : (
                <CatalogIcon size={20} className="shrink-0 text-muted-foreground" />
              )}
              <h1 className={PAGE_TITLE_SEMIBOLD}>{blueprint.source.name}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <LakewatchDataControls />
              <Button variant="default" size="sm">
                <SearchDataIcon size={16} />
                Query
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <code className="text-hint text-foreground">{blueprint.source.table}</code>
            <Badge variant={isParser ? "teal" : "secondary"} className="font-normal">
              {isParser ? "Parser" : "UC table"}
            </Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Preview of the source data feeding {model?.name ?? "this data model"}.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-hint text-muted-foreground">Sample</span>
            <Select value={String(sampleRows)} onValueChange={(value) => setSampleRows(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_ROW_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option.toLocaleString()} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data table */}
        <div className="overflow-x-auto rounded-md border border-border">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {leaves.map((field) => (
                  <TableHead key={field.path} className="whitespace-nowrap font-semibold">
                    {field.path}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((rowSeed) => (
                <TableRow key={rowSeed}>
                  {leaves.map((field) => (
                    <TableCell key={field.path} className="whitespace-nowrap py-2 text-foreground">
                      {sourceSampleValue(blueprint.identifier, field, rowSeed)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-hint text-muted-foreground">
          Showing {previewRows.length} of {sampleRows.toLocaleString()} sampled rows ·{" "}
          {leaves.length} columns · {blueprint.source.records}
        </p>
      </div>
    </div>
  )
}

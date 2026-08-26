"use client"

import * as React from "react"
import Link from "next/link"

import {
  CatalogIcon,
  DatabaseIcon,
  DataModelNavIcon,
  SchemasNavIcon,
} from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { getDataModel } from "@/components/lakewatch/data-models/dataModels"
import {
  getOcsfClass,
  NORMALIZER_BLUEPRINTS,
} from "@/components/lakewatch/normalizers/normalizers"
import type {
  Mapping,
  NormalizerBlueprint,
  SourceField,
} from "@/components/lakewatch/normalizers/normalizerModel"
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

// ─── Layout constants ───────────────────────────────────────────────────────

const PAD = 32
const RAW_W = 208
const PARSER_W = 288
const NORM_W = 268
const RAW_X = PAD
const PARSER_X = RAW_X + RAW_W + 96
const NORM_X = PARSER_X + PARSER_W + 120
const ROW_H = 150
const ROW_SLOT = 208
const RAW_H = 128

function flattenLeaves(fields: SourceField[]): SourceField[] {
  const out: SourceField[] = []
  for (const field of fields) {
    if (field.children && field.children.length) out.push(...flattenLeaves(field.children))
    else out.push(field)
  }
  return out
}

function shortExpr(expression: string): string {
  const trimmed = expression.replace(/\s+/g, " ").trim()
  if (/^to_timestamp\((.+)\)$/i.test(trimmed)) return trimmed.replace(/^to_timestamp\((.+)\)$/i, "$1")
  if (trimmed.length > 26) return `${trimmed.slice(0, 24)}…`
  return trimmed
}

function fieldMappings(bp: NormalizerBlueprint): Mapping[] {
  return bp.mappings.filter(
    (mapping) => mapping.origin !== "system" && mapping.target !== "raw_data"
  )
}

// ─── Graph view ─────────────────────────────────────────────────────────────

export function LakewatchNormalizedDataGraphView({ modelId }: { modelId: string }) {
  const model = getDataModel(modelId)

  const feeders = React.useMemo(
    () => (model ? NORMALIZER_BLUEPRINTS.filter((bp) => bp.targetGroupId === model.id) : []),
    [model]
  )
  const ocsfFields = model ? (getOcsfClass(model.id)?.fields ?? []) : []

  if (!model) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Normalized data not found</h1>
        <Button variant="link" size="sm" asChild className="w-fit px-0">
          <Link href="/lakewatch/normalized-data">Back to Normalized data</Link>
        </Button>
      </div>
    )
  }

  const n = feeders.length
  const colHeight = PAD + n * ROW_SLOT
  const shownOcsf = ocsfFields.filter((f) => f.path !== "raw_data").slice(0, 12)
  const normH = 74 + shownOcsf.length * 22
  const normTop = Math.max(PAD, (colHeight - normH) / 2)
  const canvasW = NORM_X + NORM_W + PAD
  const canvasH = Math.max(colHeight, normTop + normH + PAD)
  const normLeftX = NORM_X
  const normRightAnchorY = normTop + normH / 2

  const rowTop = (i: number) => PAD + i * ROW_SLOT

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border px-5 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/lakewatch/normalized-data">Normalized data</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/lakewatch/normalized-data/${encodeURIComponent(model.id)}`}>
                {model.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Lineage graph</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <DataModelNavIcon size={20} className="shrink-0 text-muted-foreground" />
            <h1 className={PAGE_TITLE_SEMIBOLD}>{model.name} lineage</h1>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <LakewatchDataControls />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-hint text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <DatabaseIcon size={14} className="text-muted-foreground" />
            Raw data
          </span>
          <span aria-hidden>→</span>
          <span className="flex items-center gap-1.5">
            <SchemasNavIcon size={14} className="text-muted-foreground" />
            Parser / parsed table
          </span>
          <span aria-hidden>→</span>
          <span className="flex items-center gap-1.5">
            <DataModelNavIcon size={14} className="text-muted-foreground" />
            Normalized data ({model.eventClass})
          </span>
        </div>
      </div>

      {/* Dot-grid canvas */}
      <div className="min-h-0 flex-1 overflow-auto bg-muted/20">
        <div
          className="relative"
          style={{
            width: canvasW,
            height: canvasH,
            backgroundImage:
              "radial-gradient(circle, var(--border) 1.1px, transparent 1.1px)",
            backgroundSize: "18px 18px",
            backgroundPosition: "-1px -1px",
          }}
        >
          {/* Edges */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={canvasW}
            height={canvasH}
          >
            {feeders.map((bp, i) => {
              const rawRightX = RAW_X + RAW_W
              const rawMidY = rowTop(i) + RAW_H / 2
              const parserLeftX = PARSER_X
              const parserMidY = rowTop(i) + ROW_H / 2
              const parserRightX = PARSER_X + PARSER_W
              const normY =
                normTop + 34 + ((i + 0.5) / n) * (normH - 68)
              const c1 = (parserLeftX - rawRightX) / 2
              const c2 = (normLeftX - parserRightX) / 2
              const mapped = fieldMappings(bp).length
              const labelX = (parserRightX + normLeftX) / 2
              const labelY = (parserMidY + normY) / 2
              return (
                <g key={bp.identifier}>
                  <path
                    d={`M ${rawRightX} ${rawMidY} C ${rawRightX + c1} ${rawMidY}, ${parserLeftX - c1} ${parserMidY}, ${parserLeftX} ${parserMidY}`}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={1.5}
                  />
                  <path
                    d={`M ${parserRightX} ${parserMidY} C ${parserRightX + c2} ${parserMidY}, ${normLeftX - c2} ${normY}, ${normLeftX} ${normY}`}
                    fill="none"
                    stroke="var(--primary)"
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                  />
                  <circle cx={normLeftX} cy={normY} r={2.5} fill="var(--primary)" />
                  <foreignObject x={labelX - 40} y={labelY - 11} width={80} height={22}>
                    <div className="flex justify-center">
                      <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-[var(--shadow-db-sm)]">
                        {mapped} fields
                      </span>
                    </div>
                  </foreignObject>
                </g>
              )
            })}
          </svg>

          {/* Raw + parser cards per feeder */}
          {feeders.map((bp, i) => {
            const isParser = bp.source.kind === "parsed"
            const leaves = flattenLeaves(bp.source.fields)
            const maps = fieldMappings(bp).slice(0, 4)
            return (
              <React.Fragment key={bp.identifier}>
                {/* Raw data card */}
                <div
                  className="absolute overflow-hidden rounded-md border border-border bg-background shadow-[var(--shadow-db-sm)]"
                  style={{ left: RAW_X, top: rowTop(i), width: RAW_W }}
                >
                  <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-2.5 py-1.5">
                    <DatabaseIcon size={14} className="shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-hint font-semibold text-foreground">
                      {bp.sourceParser}
                    </span>
                    <Badge variant={isParser ? "teal" : "secondary"} className="shrink-0 px-1 font-normal">
                      {isParser ? "Raw" : "UC"}
                    </Badge>
                  </div>
                  <div className="px-2.5 py-1.5">
                    <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {isParser ? "Raw events" : "Existing table"}
                    </p>
                    {leaves.slice(0, 3).map((field) => (
                      <div key={field.path} className="truncate text-[11px] text-muted-foreground">
                        {field.path}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parser / parsed-table card */}
                <div
                  className="absolute overflow-hidden rounded-md border border-border bg-background shadow-[var(--shadow-db-sm)]"
                  style={{ left: PARSER_X, top: rowTop(i), width: PARSER_W }}
                >
                  <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-2.5 py-1.5">
                    {isParser ? (
                      <SchemasNavIcon size={14} className="shrink-0 text-muted-foreground" />
                    ) : (
                      <CatalogIcon size={14} className="shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-hint font-semibold text-foreground">
                      {isParser ? `${bp.sourceParser} parser` : "Unity Catalog table"}
                    </span>
                  </div>
                  <div className="px-2.5 py-1.5">
                    <code className="mb-1 block truncate text-[10px] text-muted-foreground">
                      {bp.source.table}
                    </code>
                    <div className="flex flex-col gap-0.5">
                      {maps.map((mapping) => (
                        <div key={mapping.id} className="flex items-center gap-1 text-[11px]">
                          <code className="min-w-0 flex-1 truncate text-foreground">
                            {shortExpr(mapping.expression)}
                          </code>
                          <span className="shrink-0 text-muted-foreground">→</span>
                          <code className="min-w-0 flex-1 truncate text-primary">
                            {mapping.target}
                          </code>
                        </div>
                      ))}
                      {fieldMappings(bp).length > maps.length ? (
                        <span className="text-[10px] text-muted-foreground">
                          +{fieldMappings(bp).length - maps.length} more mappings
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )
          })}

          {/* Normalized data table card */}
          <div
            className="absolute overflow-hidden rounded-md border border-primary/40 bg-background shadow-[var(--shadow-db-lg)]"
            style={{ left: NORM_X, top: normTop, width: NORM_W }}
          >
            <div className="flex items-center gap-1.5 border-b border-border bg-primary/5 px-2.5 py-2">
              <DataModelNavIcon size={14} className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-hint font-semibold text-foreground">
                {model.name}
              </span>
              <Badge variant="indigo" className="shrink-0 px-1 font-normal">
                {model.classUid}
              </Badge>
            </div>
            <div className="px-2.5 py-1.5">
              <code className="mb-1 block truncate text-[10px] text-muted-foreground">
                {model.table}
              </code>
              <div className="flex flex-col">
                {shownOcsf.map((field) => (
                  <div
                    key={field.path}
                    className="flex items-center justify-between gap-2 border-t border-border/60 py-1 text-[11px] first:border-t-0"
                  >
                    <code className="min-w-0 truncate text-foreground">{field.path}</code>
                    <Badge
                      variant={
                        field.requirement === "required"
                          ? "destructive"
                          : field.requirement === "recommended"
                            ? "default_tag"
                            : "secondary"
                      }
                      className="shrink-0 px-1 font-normal"
                    >
                      {field.requirement === "required"
                        ? "REQ"
                        : field.requirement === "recommended"
                          ? "REC"
                          : "OPT"}
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {feeders.length} sources · {model.records}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

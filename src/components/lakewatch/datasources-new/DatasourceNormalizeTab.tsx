"use client"

import * as React from "react"
import Link from "next/link"

import { DataModelNavIcon, DatasourceNavIcon, ErdIcon } from "@/components/icons"
import {
  DATASOURCE_SCHEMAS,
  DESTINATION_TABLES,
  type DatasourceSchemaRow,
} from "@/components/lakewatch/datasources-new/datasourceParsers"
import {
  DATA_MODELS,
  materializationLabel,
  type DataModel,
} from "@/components/lakewatch/data-models/dataModels"
import { NORMALIZER_BLUEPRINTS } from "@/components/lakewatch/normalizers/normalizers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "")
}

/** Loose match between a normalizer's source parser and this datasource's parser schema. */
function matchesName(sourceParser: string, parserSchema: string): boolean {
  const a = normalizeName(sourceParser)
  const b = normalizeName(parserSchema)
  if (!a || !b) return false
  if (a.includes(b) || b.includes(a)) return true
  const key = b.replace(/^aws/, "")
  return key.length > 3 && a.includes(key)
}

type ServedModel = {
  model: DataModel
  parserTables: { parser: string; table: string }[]
  /** Comma-joined source-parser names to highlight in the model's lineage graph. */
  highlight: string
}

export function DatasourceNormalizeTab({
  schemas = DATASOURCE_SCHEMAS,
  destinationTables = DESTINATION_TABLES,
}: {
  schemas?: readonly DatasourceSchemaRow[]
  destinationTables?: Record<string, string[]>
}) {
  const served = React.useMemo<ServedModel[]>(() => {
    const parserSchemas = schemas.map((row) => row.schema)
    const results: ServedModel[] = []
    for (const model of DATA_MODELS) {
      const feeders = NORMALIZER_BLUEPRINTS.filter((bp) => bp.targetGroupId === model.id)
      const matched = feeders.filter((bp) =>
        parserSchemas.some((ps) => matchesName(bp.sourceParser, ps))
      )
      if (matched.length === 0) continue

      // This datasource's own parser tables that flow into the model.
      const parserTables: { parser: string; table: string }[] = []
      for (const ps of parserSchemas) {
        if (!matched.some((bp) => matchesName(bp.sourceParser, ps))) continue
        const tables = destinationTables[ps] ?? []
        if (tables.length === 0) {
          parserTables.push({ parser: ps, table: "—" })
        } else {
          for (const table of tables) parserTables.push({ parser: ps, table })
        }
      }

      const highlight = Array.from(new Set(matched.map((bp) => bp.sourceParser))).join(",")
      results.push({ model, parserTables, highlight })
    }
    return results
  }, [schemas, destinationTables])

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold leading-6 text-foreground">Data models</h2>
        <p className="text-sm text-muted-foreground">
          OCSF data models this datasource contributes to. Open the lineage graph to see this
          datasource’s raw and parser tables flowing in, or jump to the data model itself.
        </p>
      </div>

      {served.length === 0 ? (
        <Card className="items-start">
          <p className="text-sm text-muted-foreground">
            This datasource doesn’t feed any data models yet.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {served.map(({ model, parserTables, highlight }) => (
            <Card key={model.id} className="gap-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-2">
                  <DataModelNavIcon size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{model.name}</span>
                      <Badge variant="indigo" className="font-normal">
                        Class {model.classUid}
                      </Badge>
                      <Badge variant="secondary" className="font-normal">
                        {materializationLabel(model.materialization)}
                      </Badge>
                    </div>
                    <code className="truncate text-hint text-muted-foreground">{model.table}</code>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="default" size="sm" asChild>
                    <Link
                      href={`/lakewatch/normalized-data/${encodeURIComponent(model.id)}/graph?highlight=${encodeURIComponent(highlight)}`}
                    >
                      <ErdIcon size={16} />
                      Graph view
                    </Link>
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/lakewatch/normalized-data/${encodeURIComponent(model.id)}`}>
                      <DataModelNavIcon size={16} />
                      Data model
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 rounded-md border border-border bg-muted/30 p-3">
                <p className="text-hint font-semibold text-foreground">Fed by this datasource</p>
                <div className="flex flex-wrap gap-2">
                  {parserTables.map(({ parser, table }) => (
                    <span
                      key={`${parser}::${table}`}
                      className="flex items-center gap-1.5 rounded border border-border bg-background px-2 py-1 text-hint"
                    >
                      <DatasourceNavIcon size={12} className="shrink-0 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{parser}</span>
                      <span className="text-muted-foreground">→</span>
                      <code className="text-muted-foreground">{table}</code>
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import { Database, Table2 } from "lucide-react"

import { PlusIcon } from "@/components/icons"
import { PreviewSkeleton } from "@/components/lakewatch/PreviewSkeleton"
import {
  DATASOURCE_SCHEMAS,
  DESTINATION_TABLES,
  type DatasourceSchemaRow,
} from "@/components/lakewatch/datasources-new/datasourceParsers"
import {
  NORMALIZERS,
  type NormalizerRow,
} from "@/components/lakewatch/normalizers/normalizers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PreviewTable = {
  title: string
  subtitle: string
  columns: string[]
  rows: string[][]
}

// A compact set of parsed (destination-table) samples, mirroring the transformed
// columns shown in the parser preview so the Normalize preview feels consistent.
const PARSED_SAMPLES: Record<string, Omit<PreviewTable, "title" | "subtitle">> = {
  "AWS.CloudTrail": {
    columns: ["event_time", "event_name", "source_ip", "actor", "outcome"],
    rows: [
      ["2026-08-11 14:32:07", "ConsoleLogin", "52.94.133.11", "sarah.dev", "Success"],
      ["2026-08-11 14:33:19", "AssumeRole", "10.0.4.22", "ci-deploy-bot", "Success"],
      ["2026-08-11 14:35:41", "CreateBucket", "203.0.113.42", "admin.ops", "Success"],
      ["2026-08-11 14:37:02", "GetObject", "198.51.100.9", "analytics.svc", "Success"],
      ["2026-08-11 14:38:55", "DeleteObject", "52.94.133.99", "sarah.dev", "Failure"],
    ],
  },
  "AWS.VPCFlow": {
    columns: ["start_time", "src_addr", "dst_addr", "dst_port", "action", "bytes"],
    rows: [
      ["2026-08-11 14:32:07", "10.0.1.15", "52.94.133.11", "443", "ACCEPT", "1032"],
      ["2026-08-11 14:32:08", "10.0.4.22", "10.0.1.15", "51201", "ACCEPT", "640"],
      ["2026-08-11 14:32:11", "203.0.113.42", "10.0.2.30", "22", "REJECT", "120"],
      ["2026-08-11 14:32:12", "10.0.2.30", "198.51.100.9", "55120", "ACCEPT", "1810"],
      ["2026-08-11 14:32:15", "52.94.133.99", "10.0.1.15", "3389", "REJECT", "40"],
    ],
  },
  "AWS.ALB": {
    columns: ["time", "client_ip", "elb_status", "target_status", "verb", "url"],
    rows: [
      ["2026-08-11 14:32:07", "52.94.133.11", "200", "200", "GET", "/orders"],
      ["2026-08-11 14:32:09", "203.0.113.42", "404", "404", "GET", "/missing"],
      ["2026-08-11 14:32:12", "198.51.100.9", "200", "200", "POST", "/login"],
      ["2026-08-11 14:32:15", "52.94.133.99", "502", "502", "GET", "/report"],
      ["2026-08-11 14:32:18", "10.0.4.22", "200", "200", "GET", "/health"],
    ],
  },
  "AWS.S3ServerAccess": {
    columns: ["request_time", "remote_ip", "requester", "operation", "key", "http_status"],
    rows: [
      ["2026-08-11 14:32:07", "52.94.133.11", "sarah.dev", "REST.GET.OBJECT", "logs/app.log", "200"],
      ["2026-08-11 14:32:10", "10.0.4.22", "ci-deploy", "REST.PUT.OBJECT", "builds/v42.tar", "200"],
      ["2026-08-11 14:32:14", "203.0.113.42", "—", "REST.GET.OBJECT", "private/keys.json", "403"],
      ["2026-08-11 14:32:17", "198.51.100.9", "analytics", "REST.GET.OBJECT", "exports/daily.csv", "200"],
      ["2026-08-11 14:32:21", "52.94.133.99", "sarah.dev", "REST.DELETE.OBJECT", "logs/old.log", "204"],
    ],
  },
}

const GENERIC_PARSED_SAMPLE: Omit<PreviewTable, "title" | "subtitle"> = {
  columns: ["event_time", "event_name", "source_ip", "actor", "outcome"],
  rows: [
    ["2026-08-11 14:32:07", "user.session.start", "52.94.133.11", "sarah.dev", "SUCCESS"],
    ["2026-08-11 14:33:19", "user.authentication", "10.0.4.22", "ci-deploy-bot", "SUCCESS"],
    ["2026-08-11 14:35:41", "user.mfa.challenge", "203.0.113.42", "admin.ops", "SUCCESS"],
    ["2026-08-11 14:37:02", "user.session.access", "198.51.100.9", "analytics.svc", "SUCCESS"],
    ["2026-08-11 14:38:55", "user.session.end", "52.94.133.99", "sarah.dev", "FAILURE"],
  ],
}

// OCSF output samples keyed by the normalizer's target event class family. Column
// names use dotted OCSF paths; values stay readable in `text-foreground`.
const OCSF_SAMPLES: Record<string, Omit<PreviewTable, "title" | "subtitle">> = {
  authentication: {
    columns: ["time", "class_uid", "activity_id", "status_id", "src_endpoint.ip", "actor.user.name"],
    rows: [
      ["2026-08-11 14:32:07", "3002", "1", "1", "52.94.133.11", "sarah.dev"],
      ["2026-08-11 14:33:19", "3002", "1", "1", "10.0.4.22", "ci-deploy-bot"],
      ["2026-08-11 14:35:41", "3002", "1", "1", "203.0.113.42", "admin.ops"],
      ["2026-08-11 14:37:02", "3002", "2", "1", "198.51.100.9", "analytics.svc"],
      ["2026-08-11 14:38:55", "3002", "2", "2", "52.94.133.99", "sarah.dev"],
    ],
  },
  api_activity: {
    columns: ["time", "class_uid", "activity_id", "status_id", "api.operation", "actor.user.name"],
    rows: [
      ["2026-08-11 14:32:07", "6003", "2", "1", "ConsoleLogin", "sarah.dev"],
      ["2026-08-11 14:33:19", "6003", "3", "1", "AssumeRole", "ci-deploy-bot"],
      ["2026-08-11 14:35:41", "6003", "1", "1", "CreateBucket", "admin.ops"],
      ["2026-08-11 14:37:02", "6003", "2", "1", "GetObject", "analytics.svc"],
      ["2026-08-11 14:38:55", "6003", "4", "2", "DeleteObject", "sarah.dev"],
    ],
  },
  process_activity: {
    columns: ["time", "class_uid", "activity_id", "process.name", "actor.user.name", "status_id"],
    rows: [
      ["2026-08-11 14:32:07", "1007", "1", "sshd", "root", "1"],
      ["2026-08-11 14:33:19", "1007", "1", "python3", "ci-deploy-bot", "1"],
      ["2026-08-11 14:35:41", "1007", "2", "curl", "admin.ops", "1"],
      ["2026-08-11 14:37:02", "1007", "1", "node", "analytics.svc", "1"],
      ["2026-08-11 14:38:55", "1007", "3", "rm", "sarah.dev", "2"],
    ],
  },
}

const GENERIC_OCSF_SAMPLE = OCSF_SAMPLES.authentication

function parsedSample(schema: string): Omit<PreviewTable, "title" | "subtitle"> {
  return PARSED_SAMPLES[schema] ?? GENERIC_PARSED_SAMPLE
}

function ocsfFamily(eventClass: string): string {
  const base = eventClass.split("(")[0].trim().toLowerCase()
  if (base.includes("api")) return "api_activity"
  if (base.includes("process")) return "process_activity"
  if (base.includes("auth") || base.includes("logon")) return "authentication"
  return "authentication"
}

function ocsfSample(eventClass: string): Omit<PreviewTable, "title" | "subtitle"> {
  return OCSF_SAMPLES[ocsfFamily(eventClass)] ?? GENERIC_OCSF_SAMPLE
}

/** Derives the OCSF output table name for a normalizer's target event class. */
function ocsfTableName(eventClass: string): string {
  return `lakewatch.default.ocsf_${ocsfFamily(eventClass)}`
}

/** Loose match: does this normalizer's source parser line up with the parser row? */
function matchesParser(normalizer: NormalizerRow, parser: string): boolean {
  const norm = normalizer.sourceParser.toLowerCase().replace(/[^a-z0-9]+/g, "")
  const target = parser.toLowerCase().replace(/[^a-z0-9]+/g, "")
  const key = target.replace(/^aws/, "")
  return (
    norm.includes(target) ||
    target.includes(norm) ||
    (key.length > 3 && norm.includes(key))
  )
}

function PreviewPane({
  icon: Icon,
  table,
}: {
  icon: typeof Database
  table: PreviewTable
}) {
  return (
    <div className="flex min-w-0 flex-col bg-background">
      <div className="flex h-9 items-center gap-2 border-b border-border/50 bg-muted px-4">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate text-sm font-semibold text-foreground">
          {table.title}
        </span>
        <span className="truncate text-hint text-muted-foreground">{table.subtitle}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border/50">
              {table.columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-4 py-2 text-hint font-semibold text-foreground"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr key={index} className="border-b border-border/50 last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="whitespace-nowrap px-4 py-2 text-xs text-foreground"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NormalizeCard({
  parser,
  destinationTable,
  normalizerOptions,
  applied,
  focused,
  onApply,
  onFocus,
}: {
  parser: string
  destinationTable: string
  normalizerOptions: NormalizerRow[]
  applied: NormalizerRow | null
  focused: boolean
  onApply: (normalizer: NormalizerRow) => void
  onFocus: () => void
}) {
  const [selected, setSelected] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)
  const loadTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (loadTimer.current) clearTimeout(loadTimer.current)
    },
    [],
  )

  const runApply = () => {
    const normalizer = normalizerOptions.find((item) => item.identifier === selected)
    if (!normalizer) return
    onApply(normalizer)
    setLoading(true)
    if (loadTimer.current) clearTimeout(loadTimer.current)
    loadTimer.current = setTimeout(() => setLoading(false), 1500)
  }

  const showPreview = applied !== null && focused

  const leftTable: PreviewTable = {
    title: destinationTable,
    subtitle: "Parsed",
    ...parsedSample(parser),
  }
  const rightTable: PreviewTable | null = applied
    ? {
        title: ocsfTableName(applied.targetEventClass),
        subtitle: applied.targetEventClass,
        ...ocsfSample(applied.targetEventClass),
      }
    : null

  return (
    <Card className="gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">{parser}</p>
          <p className="truncate text-hint text-muted-foreground" title={destinationTable}>
            {destinationTable}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-[280px]" aria-label={`Normalizer for ${parser}`}>
              <SelectValue placeholder="Select a normalizer" />
            </SelectTrigger>
            <SelectContent>
              {normalizerOptions.map((normalizer) => (
                <SelectItem
                  key={normalizer.identifier}
                  value={normalizer.identifier}
                  description={normalizer.targetEventClass}
                >
                  {normalizer.displayName}
                </SelectItem>
              ))}
              <SelectSeparator />
              <Link
                href="/lakewatch/normalizers/new"
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary outline-hidden hover:bg-accent"
              >
                <PlusIcon size={16} />
                Create normalizer
              </Link>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!selected}
            onClick={runApply}
          >
            Apply
          </Button>
        </div>
      </div>

      {applied ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="teal">Normalized</Badge>
          <span className="text-muted-foreground">Output table</span>
          <span className="font-mono text-hint text-foreground">
            {ocsfTableName(applied.targetEventClass)}
          </span>
          {!focused ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 font-normal"
              onClick={onFocus}
            >
              View preview
            </Button>
          ) : null}
        </div>
      ) : null}

      {showPreview ? (
        <div className="overflow-hidden rounded border border-border">
          <div className="flex h-10 items-center justify-between border-b border-border bg-muted px-3">
            <p className="text-sm font-semibold text-foreground">Preview</p>
            <p className="text-hint text-muted-foreground">
              Sample rows normalized to {applied?.targetEventClass}
            </p>
          </div>
          {loading ? (
            <PreviewSkeleton className="h-[240px]" panes={2} rows={5} />
          ) : rightTable ? (
            <div className="grid grid-cols-1 gap-px bg-border/50 lg:grid-cols-2">
              <PreviewPane icon={Database} table={leftTable} />
              <PreviewPane icon={Table2} table={rightTable} />
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}

export function DatasourceNormalizeTab({
  schemas = DATASOURCE_SCHEMAS,
  destinationTables = DESTINATION_TABLES,
}: {
  schemas?: readonly DatasourceSchemaRow[]
  destinationTables?: Record<string, string[]>
}) {
  // Each parser destination table can have one applied normalizer; only one card
  // shows its preview at a time (the most recently applied / focused).
  const [appliedByTable, setAppliedByTable] = React.useState<Record<string, NormalizerRow>>({})
  const [focusedKey, setFocusedKey] = React.useState<string | null>(null)

  const rows = React.useMemo(() => {
    const items: { parser: string; table: string; key: string }[] = []
    for (const row of schemas) {
      const tables = destinationTables[row.schema] ?? []
      if (tables.length === 0) {
        items.push({ parser: row.schema, table: "—", key: row.schema })
        continue
      }
      for (const table of tables) {
        items.push({ parser: row.schema, table, key: `${row.schema}::${table}` })
      }
    }
    return items
  }, [schemas, destinationTables])

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold leading-6 text-foreground">Normalize</h2>
        <p className="text-sm text-muted-foreground">
          Apply an OCSF normalizer to each parser destination table and preview the
          normalized output side by side.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {rows.map(({ parser, table, key }) => {
          const options = [...NORMALIZERS].sort((a, b) => {
            const aMatch = matchesParser(a, parser) ? 0 : 1
            const bMatch = matchesParser(b, parser) ? 0 : 1
            return aMatch - bMatch
          })
          return (
            <NormalizeCard
              key={key}
              parser={parser}
              destinationTable={table}
              normalizerOptions={options}
              applied={appliedByTable[key] ?? null}
              focused={focusedKey === key}
              onApply={(normalizer) => {
                setAppliedByTable((prev) => ({ ...prev, [key]: normalizer }))
                setFocusedKey(key)
              }}
              onFocus={() => setFocusedKey(key)}
            />
          )
        })}
      </div>
    </section>
  )
}

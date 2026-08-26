"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Braces,
  CircleDashed,
  Clock,
  Copy,
  Database,
  FileCode,
  Hash,
  Loader2,
  Send,
  Target,
  ToggleLeft,
  Type as TypeGlyphIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  CatalogIcon,
  CheckIcon,
  ChevronRightIcon,
  DatabaseClockIcon,
  DataModelNavIcon,
  FolderIcon,
  PipelineIcon,
  SchemaIcon,
  SearchIcon,
  SparkleIcon,
  TableIcon,
} from "@/components/icons"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DbIcon } from "@/components/ui/db-icon"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SegmentedControl,
  SegmentedItem,
} from "@/components/ui/segmented-control"
import { Textarea } from "@/components/ui/textarea"
import type {
  Mapping,
  NormalizerBlueprint,
  SourceDataset,
  SourceField,
  TargetClass,
  TargetField,
} from "@/components/lakewatch/normalizers/normalizerModel"
import { findTemplate, getOcsfClass, OCSF_CLASSES } from "@/components/lakewatch/normalizers/normalizers"
import {
  DATA_MODELS,
  getDataModel,
  materializationLabel,
  type DataModel,
} from "@/components/lakewatch/data-models/dataModels"
import { cn } from "@/lib/utils"

type Recommendation = {
  id: string
  source: string
  target: string
  expression: string
  confidence: number
  rationale: string
}

const SOURCES: SourceDataset[] = [
  {
    id: "okta-parsed",
    kind: "parsed",
    name: "Okta System Log",
    table: "lakewatch.silver.okta_system_log",
    records: "312,480 records / 24h",
    fields: [
      { path: "event_time", type: "timestamp", sample: "2026-08-20 21:42:10" },
      { path: "event_type", type: "string", sample: "user.session.start" },
      {
        path: "actor",
        type: "struct<id:string,email:string,name:string>",
        sample: "{…}",
        children: [
          { path: "actor.id", type: "string", sample: "00u1a2b3c4D5e6F7g8h9" },
          { path: "actor.email", type: "string", sample: "alice.nguyen@acme.com" },
          { path: "actor.name", type: "string", sample: "Alice Nguyen" },
        ],
      },
      { path: "client.ip_address", type: "string", sample: "203.0.113.24" },
      { path: "outcome.result", type: "string", sample: "SUCCESS" },
      { path: "session.id", type: "string", sample: "102rPxN9qQ1TkSxb5oQz" },
      { path: "authentication.is_mfa", type: "boolean", sample: "true" },
      { path: "target.account_uid", type: "string", sample: "(null)", nullable: true },
      { path: "display_message", type: "string", sample: "User login to Okta" },
    ],
  },
  {
    id: "cloudtrail-parsed",
    kind: "parsed",
    name: "AWS CloudTrail",
    table: "lakewatch.silver.aws_cloudtrail",
    records: "1.8M records / 24h",
    fields: [
      { path: "event_time", type: "timestamp", sample: "2026-08-20 21:38:02" },
      { path: "event_name", type: "string", sample: "AssumeRole" },
      { path: "event_source", type: "string", sample: "sts.amazonaws.com" },
      { path: "user_identity.arn", type: "string", sample: "arn:aws:iam::2960625:user/alice" },
      { path: "source_ip_address", type: "string", sample: "198.51.100.18" },
      { path: "aws_region", type: "string", sample: "us-west-2" },
    ],
  },
  {
    id: "slack-parsed",
    kind: "parsed",
    name: "Slack Audit Logs",
    table: "lakewatch.silver.slack_audit_logs",
    records: "84,201 records / 24h",
    fields: [
      { path: "event_time", type: "timestamp", sample: "2026-08-20 20:17:55" },
      { path: "action", type: "string", sample: "user_login" },
      { path: "actor.user_id", type: "string", sample: "U08TPMK9AP4" },
      { path: "actor.email", type: "string", sample: "alice@acme.com" },
      { path: "context.ip_address", type: "string", sample: "203.0.113.24" },
    ],
  },
  {
    id: "okta-raw",
    kind: "raw",
    name: "Okta raw events",
    table: "lakewatch.bronze.okta_system_log_raw",
    records: "314,912 records / 24h",
    fields: [
      { path: "raw_record", type: "variant", sample: '{"uuid":"f1d2c3...","eventType":"user.session.start"}' },
      { path: "ingest_time", type: "timestamp", sample: "2026-08-20 21:42:12" },
      { path: "_metadata.file_path", type: "string", sample: "/Volumes/lakewatch/raw/okta/..." },
    ],
  },
  {
    id: "cloudtrail-raw",
    kind: "raw",
    name: "CloudTrail raw events",
    table: "lakewatch.bronze.aws_cloudtrail_raw",
    records: "1.9M records / 24h",
    fields: [
      { path: "raw_record", type: "variant", sample: '{"eventVersion":"1.09","eventSource":"sts.amazonaws.com"}' },
      { path: "ingest_time", type: "timestamp", sample: "2026-08-20 21:38:05" },
      { path: "_metadata.file_path", type: "string", sample: "s3://audit-logs/AWSLogs/..." },
    ],
  },
]

const OKTA_RECOMMENDATIONS: Recommendation[] = [
  { id: "r1", source: "event_time", target: "time", expression: "unix_millis(event_time)", confidence: 98, rationale: "Parsed event timestamp matches the OCSF event time." },
  { id: "r2", source: "event_type", target: "activity_id", expression: "CASE event_type WHEN 'user.session.start' THEN 1 WHEN 'user.session.end' THEN 2 ELSE 0 END", confidence: 94, rationale: "Okta session events align with OCSF Logon and Logoff activities." },
  { id: "r3", source: "actor.id", target: "user.uid", expression: "actor.id", confidence: 99, rationale: "Stable Okta actor identifier." },
  { id: "r4", source: "actor.email", target: "user.email_addr", expression: "actor.email", confidence: 99, rationale: "Parsed and validated email address." },
  { id: "r5", source: "actor.name", target: "user.name", expression: "actor.name", confidence: 97, rationale: "Human-readable actor name." },
  { id: "r6", source: "client.ip_address", target: "src_endpoint.ip", expression: "client.ip_address", confidence: 99, rationale: "Source IP of the authentication request." },
  { id: "r7", source: "outcome.result", target: "status_id", expression: "CASE outcome.result WHEN 'SUCCESS' THEN 1 WHEN 'FAILURE' THEN 2 ELSE 0 END", confidence: 93, rationale: "Maps Okta outcomes to the OCSF status enumeration." },
  { id: "r8", source: "session.id", target: "session.uid", expression: "session.id", confidence: 96, rationale: "Session correlation identifier." },
  { id: "r9", source: "authentication.is_mfa", target: "session.is_mfa", expression: "authentication.is_mfa", confidence: 95, rationale: "Direct parsed boolean mapping." },
  { id: "r10", source: "display_message", target: "message", expression: "display_message", confidence: 92, rationale: "Human-readable event description." },
]

const SYSTEM_MAPPINGS: Mapping[] = [
  { id: "system-class", source: "3002", target: "class_uid", expression: "3002", origin: "system" },
  { id: "system-category", source: "3", target: "category_uid", expression: "3", origin: "system" },
  { id: "system-version", source: "'1.3.0'", target: "metadata.version", expression: "'1.3.0'", origin: "system" },
  { id: "system-product", source: "'Okta System Log'", target: "metadata.product.name", expression: "'Okta System Log'", origin: "system" },
]

function StudioColumn({
  icon,
  title,
  subtitle,
  children,
  footer,
  headerAction,
  className,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
  headerAction?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex min-h-0 min-w-0 flex-col border-r border-border last:border-r-0", className)}>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        {icon}
        <div className="min-w-0">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="truncate text-hint text-muted-foreground">{subtitle}</p>
        </div>
        {headerAction ? <div className="ml-auto shrink-0">{headerAction}</div> : null}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer ? <footer className="shrink-0 border-t border-border p-3">{footer}</footer> : null}
    </section>
  )
}

function RequirementBadge({
  value,
  className,
}: {
  value: TargetField["requirement"]
  className?: string
}) {
  return (
    <Badge
      variant={value === "required" ? "destructive" : value === "recommended" ? "default_tag" : "secondary"}
      className={cn("px-1 font-normal", className ?? "ml-auto")}
    >
      {value === "required" ? "REQ" : value === "recommended" ? "REC" : "OPT"}
    </Badge>
  )
}

// ─── Source data profiling (mock) ──────────────────────────────────────────────
// Deterministic synthetic value distributions so the Field summary + Raw data
// views feel live and stay stable across renders for a given field + row count.

type ValueCount = { value: string; count: number }
type FieldSummary = { distinct: number; coverage: number; top: ValueCount[] }

const SAMPLE_ROW_OPTIONS = [100, 500, 1000, 5000, 10000]

// Destination materialization options offered when saving a normalizer.
const DESTINATION_FORMATS: {
  id: "view" | "materialized_view" | "pipeline"
  label: string
  description: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}[] = [
  {
    id: "view",
    label: "View",
    Icon: TableIcon,
    description: "Computed live at query time. No storage; always current, higher read cost.",
  },
  {
    id: "materialized_view",
    label: "Materialized view",
    Icon: DatabaseClockIcon,
    description: "Incrementally refreshed and stored. Fast reads; refreshes on a schedule.",
  },
  {
    id: "pipeline",
    label: "Pipeline",
    Icon: PipelineIcon,
    description: "Continuously written by a Lakeflow pipeline. Streaming, near real-time.",
  },
]

// A destination the normalizer writes to. Either an existing data model (its
// output is appended to that governed table) or a bare OCSF event class (a new
// data model is created on save).
type DestinationOption = {
  value: string
  label: string
  description: string
  kind: "model" | "class"
  target: TargetClass
  model?: DataModel
}

function buildDestinationOptions(): DestinationOption[] {
  const modelOptions: DestinationOption[] = DATA_MODELS.flatMap((model) => {
    const target = getOcsfClass(model.id)
    if (!target) return []
    return [
      {
        value: `model:${model.id}`,
        label: model.name,
        description: `${materializationLabel(model.materialization)} · class_uid ${target.classUid}`,
        kind: "model",
        target,
        model,
      },
    ]
  })
  const classOptions: DestinationOption[] = OCSF_CLASSES.map((cls) => ({
    value: `class:${cls.id}`,
    label: cls.name,
    description: `${cls.category} · class_uid ${cls.classUid}`,
    kind: "class",
    target: cls,
  }))
  return [...modelOptions, ...classOptions]
}

// ─── YAML spec generation ────────────────────────────────────────────────────
// Renders the current studio state as a normalization spec, mirroring the
// lakewatch OCSF preset format (name / title / description / source / output /
// silver / gold). This is a read-only projection of the mappings — the app only
// generates it, it never runs it.

function toSnake(input: string): string {
  return input
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/^_+|_+$/g, "")
}

function splitTable(table: string): { catalog: string; schema: string; table: string } {
  const parts = table.split(".")
  if (parts.length >= 3) {
    return { catalog: parts[0], schema: parts[1], table: parts.slice(2).join(".") }
  }
  return { catalog: "main", schema: "raw", table }
}

/** A source mapping that reads a real column (vs a system/literal constant). */
function isColumnMapping(mapping: Mapping): boolean {
  return !/^'.*'$/.test(mapping.source) && !/^\d+$/.test(mapping.source)
}

export function buildNormalizationYaml(args: {
  name: string
  source: SourceDataset
  target: TargetClass
  mappings: Mapping[]
}): string {
  const { source, target, mappings } = args
  const src = splitTable(source.table)
  const specName = toSnake(args.name || `${src.table}_normalized`)
  const title = `${source.name} → OCSF ${target.name}`
  const lines: string[] = []

  lines.push("# Generated normalization spec — read-only projection of the mappings below.")
  lines.push("# The app only GENERATES this spec; it never runs it.")
  lines.push(`name: ${specName}`)
  lines.push(`title: ${JSON.stringify(title)}`)
  lines.push("description: >")
  lines.push(
    `  Maps ${source.name} records onto a trimmed OCSF ${target.name} shape (class_uid ${target.classUid}).`
  )
  lines.push("  Silver renames and casts the source columns; gold assembles the nested OCSF output.")
  lines.push("")
  lines.push("# The single source table or view this spec normalizes.")
  lines.push("source:")
  lines.push(`  catalog: ${src.catalog}`)
  lines.push(`  schema: ${src.schema}`)
  lines.push(`  table: ${src.table}`)
  lines.push("")
  lines.push("# Where the generated views would be created.")
  lines.push("output:")
  lines.push(`  catalog: ${src.catalog}`)
  lines.push("  schema: normalized")
  lines.push("")

  const columnMappings = mappings.filter(isColumnMapping)
  lines.push("# Silver: rename + cast raw columns into flat, typed intermediates.")
  lines.push("silver:")
  lines.push("  transforms:")
  if (columnMappings.length) {
    for (const mapping of columnMappings) {
      lines.push(`    - name: ${toSnake(mapping.target)}`)
      lines.push(`      expr: ${JSON.stringify(mapping.expression)}`)
    }
  } else {
    lines.push("    [] # no column mappings yet")
  }
  lines.push("")
  lines.push("# Gold: assemble the nested OCSF output. Keys are OCSF field paths.")
  lines.push("gold:")
  lines.push(`  event_class: ${JSON.stringify(target.name)}`)
  lines.push(`  class_uid: ${target.classUid}`)
  lines.push("  fields:")
  const byTarget = new Map(mappings.map((mapping) => [mapping.target, mapping]))
  for (const field of target.fields) {
    const mapping = byTarget.get(field.path)
    const value = mapping ? mapping.expression : "null"
    const suffix =
      !mapping && field.requirement !== "optional" ? "  # TODO: unmapped" : ""
    lines.push(`    ${JSON.stringify(field.path)}: ${value}${suffix}`)
  }

  return lines.join("\n")
}

// ─── Generated SQL (DDL) ─────────────────────────────────────────────────────
// Projects the mappings into the DDL the spec maps to: a silver VIEW that
// renames + casts raw columns, and a gold view/materialized-view/streaming-table
// that assembles the nested OCSF output with named_struct(). Read-only — the app
// only generates these statements, it never runs them.

type SqlStatement = { kind: string; name: string; sql: string }
type SqlEntry = { path: string[]; value: string }

/** Silver column alias for an OCSF target path (e.g. "src_endpoint.ip" → src_endpoint_ip). */
function silverAlias(targetPath: string): string {
  return targetPath.replace(/[.]/g, "_").replace(/[^A-Za-z0-9_]/g, "_")
}

function groupEntries(entries: SqlEntry[]): { order: string[]; groups: Map<string, SqlEntry[]> } {
  const groups = new Map<string, SqlEntry[]>()
  const order: string[] = []
  for (const entry of entries) {
    const key = entry.path[0]
    if (!groups.has(key)) {
      groups.set(key, [])
      order.push(key)
    }
    groups.get(key)!.push(entry)
  }
  return { order, groups }
}

function buildNamedStruct(entries: SqlEntry[]): string {
  const { order, groups } = groupEntries(entries)
  const parts = order.map((key) => {
    const group = groups.get(key)!
    const scalar = group.find((entry) => entry.path.length === 1)
    if (group.length === 1 && scalar) return `'${key}', ${scalar.value}`
    const children = group
      .filter((entry) => entry.path.length > 1)
      .map((entry) => ({ path: entry.path.slice(1), value: entry.value }))
    return `'${key}', ${buildNamedStruct(children)}`
  })
  return `named_struct(${parts.join(", ")})`
}

function buildGoldSelect(entries: SqlEntry[]): string[] {
  const { order, groups } = groupEntries(entries)
  return order.map((key) => {
    const group = groups.get(key)!
    const scalar = group.find((entry) => entry.path.length === 1)
    if (group.length === 1 && scalar) return `  ${scalar.value} AS \`${key}\``
    const children = group
      .filter((entry) => entry.path.length > 1)
      .map((entry) => ({ path: entry.path.slice(1), value: entry.value }))
    return `  ${buildNamedStruct(children)} AS \`${key}\``
  })
}

function buildGeneratedSql(args: {
  source: SourceDataset
  target: TargetClass
  mappings: Mapping[]
  materialization: "view" | "materialized_view" | "pipeline"
}): SqlStatement[] {
  const { source, target, mappings, materialization } = args
  const src = splitTable(source.table)
  const silverName = `${src.table}_silver`
  const silverFq = `\`${src.catalog}\`.\`normalized\`.\`${silverName}\``
  const rawFq = `\`${src.catalog}\`.\`${src.schema}\`.\`${src.table}\``

  const columnMappings = mappings.filter(isColumnMapping)
  const silverSelect = columnMappings.map((mapping) => {
    const expr = mapping.expression === mapping.source ? `\`${mapping.source}\`` : `(${mapping.expression})`
    return `  ${expr} AS \`${silverAlias(mapping.target)}\``
  })
  const firstCol = columnMappings[0]
  const silverSql =
    `CREATE OR REPLACE VIEW ${silverFq} AS\nSELECT\n` +
    (silverSelect.length ? silverSelect.join(",\n") : "  *") +
    `\nFROM ${rawFq}` +
    (firstCol ? `\nWHERE \`${firstCol.source}\` IS NOT NULL` : "")

  const keyword =
    materialization === "view"
      ? "VIEW"
      : materialization === "pipeline"
        ? "STREAMING TABLE"
        : "MATERIALIZED VIEW"
  const goldName = toSnake(target.name)
  const goldFq = `\`${src.catalog}\`.\`normalized\`.\`${goldName}\``
  const entries: SqlEntry[] = mappings.map((mapping) => ({
    path: mapping.target.split("."),
    value: isColumnMapping(mapping) ? `\`${silverAlias(mapping.target)}\`` : mapping.expression,
  }))
  const goldSql =
    `CREATE OR REPLACE ${keyword} ${goldFq} AS\nSELECT\n` +
    (entries.length ? buildGoldSelect(entries).join(",\n") : "  *") +
    `\nFROM ${silverFq}`

  return [
    { kind: "VIEW", name: silverName, sql: silverSql },
    { kind: keyword, name: goldName, sql: goldSql },
  ]
}

// Unity Catalog browse tree derived from the SOURCES table paths, e.g.
// "lakewatch.silver.okta_system_log" → catalog `lakewatch`, schema `silver`
// (parsed) / `bronze` (raw), table `okta_system_log`.
type UnityCatalogTable = {
  sourceId: string
  catalog: string
  schema: string
  table: string
  label: string
  kind: SourceDataset["kind"]
}
const UNITY_CATALOG_TABLES: UnityCatalogTable[] = SOURCES.map((source) => {
  const [catalog, schema, table] = source.table.split(".")
  return { sourceId: source.id, catalog, schema, table, label: source.name, kind: source.kind }
})

const ENUM_VALUE_POOLS: Record<string, string[]> = {
  event_type: [
    "user.session.start",
    "user.session.end",
    "user.authentication.sso",
    "user.mfa.verify",
    "user.session.expire",
    "policy.evaluate.sign_on",
  ],
  event_name: ["AssumeRole", "ConsoleLogin", "GetObject", "PutObject", "DescribeInstances", "CreateUser"],
  event_source: ["sts.amazonaws.com", "signin.amazonaws.com", "s3.amazonaws.com", "ec2.amazonaws.com", "iam.amazonaws.com"],
  action: ["user_login", "user_logout", "file_downloaded", "message_posted", "channel_created"],
  "outcome.result": ["SUCCESS", "FAILURE", "CHALLENGE"],
  aws_region: ["us-west-2", "us-east-1", "eu-west-1", "ap-southeast-2", "us-east-2"],
}

function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Leaf name shown in the summary/table headers — last dotted segment.
function leafName(path: string): string {
  return path.includes(".") ? path.slice(path.lastIndexOf(".") + 1) : path
}

// Recursively collect leaf (non-struct) fields.
function flattenLeaves(fields: SourceField[]): SourceField[] {
  return fields.flatMap((field) =>
    field.children?.length ? flattenLeaves(field.children) : [field]
  )
}

type CardinalityBucket = "boolean" | "null" | "low" | "high"

function bucketFor(field: SourceField): CardinalityBucket {
  if (field.nullable) return "null"
  if (field.type === "boolean") return "boolean"
  if (ENUM_VALUE_POOLS[field.path]) return "low"
  const p = field.path.toLowerCase()
  if (/(result|status|region|severity|category|kind|action|outcome|type|name|email|actor|\buser\b|account)/.test(p)) {
    return "low"
  }
  return "high"
}

function base32(rng: () => number, length: number): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  return Array.from({ length }, () => alphabet[Math.floor(rng() * alphabet.length)]).join("")
}

// A small, coherent set of values for low-cardinality fields.
function lowCardValues(field: SourceField, distinct: number, rng: () => number): string[] {
  const pool = ENUM_VALUE_POOLS[field.path]
  if (pool) return pool.slice(0, Math.min(distinct, pool.length))
  const p = field.path.toLowerCase()
  if (/email/.test(p)) {
    const values = Array.from({ length: distinct - 1 }, (_, i) => `range.tester${i + 1}@orangeboulder.cloud`)
    values.push("ob.admin@orangeboulder.cloud")
    return values
  }
  if (/name/.test(p)) {
    const values = Array.from({ length: distinct - 1 }, (_, i) => `Range Tester${i + 1}`)
    values.push("OrangeBoulder Administrator")
    return values
  }
  if (/(uuid|_id|\bid\b|actor|\buser\b|session|account)/.test(p)) {
    return Array.from({ length: distinct }, () => base32(rng, 26))
  }
  if (/(result|status|outcome)/.test(p)) return ["SUCCESS", "FAILURE", "CHALLENGE"].slice(0, distinct)
  if (/region/.test(p)) return ["us-west-2", "us-east-1", "eu-west-1", "ap-southeast-2"].slice(0, distinct)
  const base = field.sample || p
  return Array.from({ length: distinct }, (_, i) => (i === 0 ? base : `${base}.${i.toString(36)}`))
}

function uniqueValueFor(field: SourceField, rng: () => number): string {
  const hex = (n: number) =>
    Array.from({ length: n }, () => Math.floor(rng() * 16).toString(16)).join("")
  if (field.type === "timestamp" || /time/i.test(field.path)) {
    const start = Date.UTC(2026, 0, 15)
    const ts = start + Math.floor(rng() * 30 * 86400000)
    return new Date(ts).toISOString()
  }
  if (/ip/i.test(field.path)) {
    return `${1 + Math.floor(rng() * 223)}.${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}`
  }
  if (/arn/i.test(field.path)) {
    return `arn:aws:iam::${100000 + Math.floor(rng() * 899999)}:user/${hex(6)}`
  }
  if (field.type === "variant" || /record/i.test(field.path)) {
    return `{"uuid":"${hex(12)}", "eventType":"…"}`
  }
  return base32(rng, 26)
}

function buildFieldSummary(field: SourceField, sampleRows: number): FieldSummary {
  const rng = makeRng(hashString(field.path) ^ Math.imul(sampleRows, 2654435761))
  const bucket = bucketFor(field)

  if (bucket === "null") {
    return { distinct: 0, coverage: 0, top: [{ value: "(null)", count: sampleRows }] }
  }

  if (bucket === "boolean") {
    const trueShare = 0.4 + rng() * 0.35
    const trueCount = Math.round(sampleRows * trueShare)
    const top = [
      { value: "true", count: trueCount },
      { value: "false", count: sampleRows - trueCount },
    ].sort((a, b) => b.count - a.count)
    return { distinct: 2, coverage: 100, top }
  }

  const coverage = rng() < 0.7 ? 100 : 88 + Math.floor(rng() * 11)
  const populated = Math.max(1, Math.round((sampleRows * coverage) / 100))

  if (bucket === "high") {
    const distinct = Math.round(populated * (0.97 + rng() * 0.05))
    const top = Array.from({ length: Math.min(10, populated) }, () => ({
      value: uniqueValueFor(field, rng),
      count: 1,
    }))
    return { distinct: Math.max(distinct, top.length), coverage, top }
  }

  // Low cardinality: a head of comparably-sized values plus a small long-tail value.
  const distinct = 3 + Math.floor(rng() * 4)
  const values = lowCardValues(field, distinct, rng)
  const size = values.length
  const tail = Math.max(1, Math.round(populated * (0.001 + rng() * 0.004)))
  const headTotal = Math.max(size - 1, populated - tail)
  const weights = Array.from({ length: size - 1 }, () => 0.85 + rng() * 0.3)
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0)
  let allocated = 0
  const headCounts = weights.map((weight, index) => {
    if (index === weights.length - 1) return headTotal - allocated
    const count = Math.max(1, Math.round((headTotal * weight) / weightSum))
    allocated += count
    return count
  })
  const top = values
    .map((value, index) => ({ value, count: index < size - 1 ? headCounts[index] : tail }))
    .sort((a, b) => b.count - a.count)
  return { distinct: size, coverage, top }
}

function buildRawRows(leaves: SourceField[], sampleRows: number): Record<string, string>[] {
  const rowCount = Math.min(sampleRows, 40)
  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const row: Record<string, string> = {}
    for (const field of leaves) {
      const rng = makeRng(hashString(`${field.path}:${rowIndex}`))
      const bucket = bucketFor(field)
      if (bucket === "null") {
        row[field.path] = "(null)"
      } else if (bucket === "boolean") {
        row[field.path] = rng() > 0.5 ? "true" : "false"
      } else if (bucket === "low") {
        const values = lowCardValues(field, 3 + Math.floor(rng() * 4), rng)
        row[field.path] = values[Math.floor(rng() * values.length)]
      } else {
        row[field.path] = uniqueValueFor(field, rng)
      }
    }
    return row
  })
}

function TypeGlyph({ type }: { type: string }) {
  const className = "h-3 w-3 shrink-0 text-muted-foreground"
  if (type.startsWith("struct") || type.startsWith("array") || type === "variant") return <Braces className={className} />
  if (type === "timestamp") return <Clock className={className} />
  if (type === "boolean") return <ToggleLeft className={className} />
  if (["int", "long", "double", "float", "number"].includes(type)) return <Hash className={className} />
  return <TypeGlyphIcon className={className} />
}

function SummaryBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "muted" }) {
  return (
    <span className="block h-1 w-12 shrink-0 overflow-hidden rounded-full bg-muted-foreground/20">
      <span
        className={cn("block h-full rounded-full", tone === "primary" ? "bg-primary" : "bg-muted-foreground/60")}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </span>
  )
}

function SourceFieldSummaryRow({
  field,
  sampleRows,
  depth = 0,
  selectedSource,
  onSelect,
  onDragStartField,
  onDragEndField,
}: {
  field: SourceField
  sampleRows: number
  depth?: number
  selectedSource: string | null
  onSelect: (path: string) => void
  onDragStartField: (path: string, event: React.DragEvent) => void
  onDragEndField: () => void
}) {
  const [open, setOpen] = React.useState(true)
  const isStruct = Boolean(field.children?.length)
  const summary = React.useMemo(
    () => (isStruct ? null : buildFieldSummary(field, sampleRows)),
    [field, sampleRows, isStruct]
  )
  const selected = selectedSource === field.path
  const maxCount = summary?.top[0]?.count ?? 1

  return (
    <div className={cn("rounded border border-transparent", selected && "border-primary/40 bg-primary/5")}>
      <div
        role="button"
        tabIndex={0}
        draggable={!isStruct}
        onDragStart={isStruct ? undefined : (event) => onDragStartField(field.path, event)}
        onDragEnd={isStruct ? undefined : onDragEndField}
        onClick={() => (isStruct ? setOpen((value) => !value) : onSelect(field.path))}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            if (isStruct) setOpen((value) => !value)
            else onSelect(field.path)
          }
        }}
        style={{ paddingLeft: depth * 16 }}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5",
          isStruct ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
          selected && "text-primary"
        )}
      >
        <button
          type="button"
          aria-label={open ? `Collapse ${field.path}` : `Expand ${field.path}`}
          onClick={(event) => {
            event.stopPropagation()
            setOpen((value) => !value)
          }}
          className="flex size-4 shrink-0 items-center justify-center"
        >
          <ChevronRightIcon
            size={12}
            className={cn("text-muted-foreground transition-transform", open && "rotate-90")}
          />
        </button>
        <TypeGlyph type={field.type} />
        <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
          <code className="shrink-0 truncate text-sm font-semibold text-foreground">{leafName(field.path)}</code>
          <span className="truncate text-hint text-muted-foreground">{field.type}</span>
        </span>
        {isStruct ? (
          <>
            <span className="w-9 shrink-0 text-right text-hint text-muted-foreground">100%</span>
            <SummaryBar value={100} />
          </>
        ) : (
          <>
            <span className="shrink-0 text-hint text-muted-foreground">
              {summary!.distinct.toLocaleString()} distinct
            </span>
            <span className="w-9 shrink-0 text-right text-hint text-muted-foreground">{summary!.coverage}%</span>
            <SummaryBar value={summary!.coverage} />
          </>
        )}
      </div>
      {open && isStruct ? (
        <div className="flex flex-col gap-1">
          {field.children!.map((child) => (
            <SourceFieldSummaryRow
              key={child.path}
              field={child}
              sampleRows={sampleRows}
              depth={depth + 1}
              selectedSource={selectedSource}
              onSelect={onSelect}
              onDragStartField={onDragStartField}
              onDragEndField={onDragEndField}
            />
          ))}
        </div>
      ) : null}
      {open && !isStruct ? (
        <div className="pb-2 pr-2" style={{ paddingLeft: depth * 16 + 32 }}>
          <p className="py-1 text-hint uppercase text-muted-foreground">
            {`Top ${summary!.top.length} ${summary!.top.length === 1 ? "value" : "values"}`}
          </p>
          <div className="flex flex-col gap-1">
            {summary!.top.map((entry, index) => (
              <div key={`${entry.value}-${index}`} className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate text-hint text-foreground">{entry.value}</code>
                <SummaryBar value={(entry.count / maxCount) * 100} tone="muted" />
                <span className="w-14 shrink-0 text-right text-hint text-muted-foreground">
                  {entry.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RawDataTable({
  columns,
  rows,
}: {
  columns: { path: string; type: string }[]
  rows: Record<string, string>[]
}) {
  return (
    <div className="overflow-x-auto pb-3">
      <table className="w-full min-w-max border-collapse">
        <thead>
          <tr className="border-b border-border">
            {columns.map((field) => (
              <th
                key={field.path}
                className="whitespace-nowrap px-3 py-2 text-left text-hint font-semibold text-foreground"
              >
                <span className="flex items-center gap-1">
                  <TypeGlyph type={field.type} />
                  <code>{field.path}</code>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border/60 hover:bg-muted/40">
              {columns.map((field) => (
                <td
                  key={field.path}
                  className="max-w-[240px] truncate whitespace-nowrap px-3 py-1.5 font-mono text-hint text-foreground"
                >
                  {row[field.path]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Shared Field summary / Table toggle + row-count selector rendered in both the
// source and destination column headers so the two views stay in tandem.
function DataViewControls({
  view,
  onViewChange,
  sampleRows,
  onSampleRowsChange,
  caption,
}: {
  view: "summary" | "table"
  onViewChange: (value: "summary" | "table") => void
  sampleRows: number
  onSampleRowsChange: (value: number) => void
  caption: string
}) {
  return (
    <div className="flex flex-col gap-2 px-3 py-2">
      <SegmentedControl
        value={view}
        onValueChange={(value) => onViewChange(value as "summary" | "table")}
        className="w-full"
      >
        <SegmentedItem value="summary" className="flex-1">
          Field summary
        </SegmentedItem>
        <SegmentedItem value="table" className="flex-1">
          Table
        </SegmentedItem>
      </SegmentedControl>
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-hint text-muted-foreground">{caption}</span>
        <Select value={String(sampleRows)} onValueChange={(value) => onSampleRowsChange(Number(value))}>
          <SelectTrigger className="w-auto shrink-0 gap-1" aria-label="Rows to profile">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SAMPLE_ROW_OPTIONS.map((count) => (
              <SelectItem key={count} value={String(count)}>
                {count.toLocaleString()} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Destination-side accordion row. Reuses the profiling helpers + SummaryBar, but
// is a drop target / click-to-map surface that shows OCSF mapping status. When a
// mapping exists its values are profiled from the mapped SOURCE field so the
// distribution lines up next to the source column.
function DestinationFieldSummaryRow({
  field,
  summary,
  mapped,
  proposed,
  isDropTarget,
  onClickMap,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  field: TargetField
  summary: FieldSummary | null
  mapped: boolean
  proposed: boolean
  isDropTarget: boolean
  onClickMap: () => void
  onDragOver: (event: React.DragEvent) => void
  onDragLeave: (event: React.DragEvent) => void
  onDrop: (event: React.DragEvent) => void
}) {
  const [open, setOpen] = React.useState(true)
  const maxCount = summary?.top[0]?.count ?? 1

  return (
    <div
      className={cn(
        "rounded border border-transparent",
        isDropTarget && "border-primary bg-primary/10 ring-1 ring-primary ring-inset"
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClickMap}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onClickMap()
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className="flex cursor-pointer items-center gap-2 px-2 py-1.5"
      >
        <button
          type="button"
          aria-label={open ? `Collapse ${field.path}` : `Expand ${field.path}`}
          onClick={(event) => {
            event.stopPropagation()
            setOpen((value) => !value)
          }}
          className="flex size-4 shrink-0 items-center justify-center"
        >
          <ChevronRightIcon
            size={12}
            className={cn("text-muted-foreground transition-transform", open && "rotate-90")}
          />
        </button>
        {mapped ? (
          <CheckIcon size={16} className="shrink-0 text-[var(--success)]" />
        ) : proposed ? (
          <DbIcon icon={SparkleIcon} color="ai" size={16} />
        ) : (
          <CircleDashed className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <code
          className={cn(
            "min-w-0 flex-1 truncate text-sm",
            mapped || proposed ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {field.path}
        </code>
        <RequirementBadge value={field.requirement} className="shrink-0" />
        {summary ? (
          <>
            <span className="shrink-0 text-hint text-muted-foreground">
              {summary.distinct.toLocaleString()} distinct
            </span>
            <span className="w-9 shrink-0 text-right text-hint text-muted-foreground">{summary.coverage}%</span>
            <SummaryBar value={summary.coverage} />
          </>
        ) : (
          <span className="shrink-0 text-hint text-muted-foreground">—</span>
        )}
      </div>
      {open ? (
        <div className="pb-2 pl-8 pr-2">
          {summary ? (
            <>
              <p className="py-1 text-hint uppercase text-muted-foreground">
                {`Top ${summary.top.length} ${summary.top.length === 1 ? "value" : "values"}`}
              </p>
              <div className="flex flex-col gap-1">
                {summary.top.map((entry, index) => (
                  <div key={`${entry.value}-${index}`} className="flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate text-hint text-foreground">{entry.value}</code>
                    <SummaryBar value={(entry.count / maxCount) * 100} tone="muted" />
                    <span className="w-14 shrink-0 text-right text-hint text-muted-foreground">
                      {entry.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-1 text-hint text-muted-foreground">Not mapped yet — drag a source field here.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

// Unity Catalog "Miller columns" browser: catalog → schema → table. Selecting a
// table sets the same sourceId the Source-data Select uses.
function SourceCatalogPicker({
  open,
  onOpenChange,
  selectedSourceId,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSourceId: string
  onSelect: (sourceId: string) => void
}) {
  const catalogs = React.useMemo(
    () => Array.from(new Set(UNITY_CATALOG_TABLES.map((item) => item.catalog))),
    []
  )
  const [activeCatalog, setActiveCatalog] = React.useState(catalogs[0] ?? "")
  const schemas = React.useMemo(
    () =>
      Array.from(
        new Set(
          UNITY_CATALOG_TABLES.filter((item) => item.catalog === activeCatalog).map((item) => item.schema)
        )
      ),
    [activeCatalog]
  )
  const [activeSchema, setActiveSchema] = React.useState(schemas[0] ?? "")
  React.useEffect(() => {
    if (!schemas.includes(activeSchema)) setActiveSchema(schemas[0] ?? "")
  }, [schemas, activeSchema])
  const tables = UNITY_CATALOG_TABLES.filter(
    (item) => item.catalog === activeCatalog && item.schema === activeSchema
  )

  const paneItem = (active: boolean) =>
    cn(
      "h-auto w-full justify-start gap-2 rounded px-2 py-1.5 font-normal",
      active && "bg-primary/10 font-semibold text-primary hover:bg-primary/10"
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select source table</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,0.75fr)_minmax(0,1.6fr)] gap-px overflow-hidden rounded-md border border-border bg-border">
            <div className="flex min-h-0 flex-col bg-background">
              <p className="border-b border-border px-3 py-2 text-hint font-semibold text-foreground">Catalog</p>
              <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto p-1.5">
                {catalogs.map((catalog) => (
                  <Button
                    key={catalog}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveCatalog(catalog)}
                    className={paneItem(catalog === activeCatalog)}
                  >
                    <CatalogIcon
                      className={cn("h-4 w-4 shrink-0", catalog === activeCatalog ? "text-primary" : "text-muted-foreground")}
                    />
                    <span className="min-w-0 flex-1 truncate text-left">{catalog}</span>
                    <ChevronRightIcon size={12} className="shrink-0 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex min-h-0 flex-col bg-background">
              <p className="border-b border-border px-3 py-2 text-hint font-semibold text-foreground">Schema</p>
              <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto p-1.5">
                {schemas.map((schema) => (
                  <Button
                    key={schema}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveSchema(schema)}
                    className={paneItem(schema === activeSchema)}
                  >
                    <SchemaIcon
                      className={cn("h-4 w-4 shrink-0", schema === activeSchema ? "text-primary" : "text-muted-foreground")}
                    />
                    <span className="min-w-0 flex-1 truncate text-left">{schema}</span>
                    <ChevronRightIcon size={12} className="shrink-0 text-muted-foreground" />
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex min-h-0 flex-col bg-background">
              <p className="border-b border-border px-3 py-2 text-hint font-semibold text-foreground">Table</p>
              <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto p-1.5">
                {tables.map((item) => {
                  const active = item.sourceId === selectedSourceId
                  return (
                    <Button
                      key={item.sourceId}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onSelect(item.sourceId)
                        onOpenChange(false)
                      }}
                      className={cn(paneItem(active), "h-auto whitespace-normal py-2")}
                    >
                      <TableIcon
                        className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")}
                      />
                      <span className="flex min-w-0 flex-1 flex-col text-left">
                        <span className="break-words text-foreground">{item.table}</span>
                        <span className="break-words text-hint text-muted-foreground">{item.label}</span>
                      </span>
                      <Badge variant={item.kind === "parsed" ? "teal" : "charcoal"} className="shrink-0">
                        {item.kind === "parsed" ? "Parsed" : "Raw"}
                      </Badge>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export function LakewatchCreateNormalizerStudio({
  initialNormalizer,
  presetTargetValue,
  lockDestination = false,
}: {
  /** When provided, the studio opens pre-filled with this normalizer's source,
   * OCSF destination, and complete (100% mapped) field mappings. */
  initialNormalizer?: NormalizerBlueprint
  /** Preset the destination (e.g. "model:authentication") for the add-source flow. */
  presetTargetValue?: string
  /** When true the destination picker is locked (add-source into a fixed model). */
  lockDestination?: boolean
} = {}) {
  const router = useRouter()
  const isExisting = Boolean(initialNormalizer)

  // A pre-filled normalizer contributes its own source/target so they resolve
  // even when they are not part of the default studio catalogs.
  const sources = React.useMemo<SourceDataset[]>(
    () =>
      initialNormalizer
        ? [initialNormalizer.source, ...SOURCES.filter((item) => item.id !== initialNormalizer.source.id)]
        : SOURCES,
    [initialNormalizer]
  )
  const destinationOptions = React.useMemo(() => buildDestinationOptions(), [])
  const modelOptions = React.useMemo(
    () => destinationOptions.filter((option) => option.kind === "model"),
    [destinationOptions]
  )
  const classOptions = React.useMemo(
    () => destinationOptions.filter((option) => option.kind === "class"),
    [destinationOptions]
  )
  // A pre-filled normalizer feeds the existing data model for its OCSF class.
  const initialTargetValue = initialNormalizer
    ? getDataModel(initialNormalizer.target.id)
      ? `model:${initialNormalizer.target.id}`
      : `class:${initialNormalizer.target.id}`
    : ""

  const [normalizerName, setNormalizerName] = React.useState(initialNormalizer?.name ?? "")
  const [sourceId, setSourceId] = React.useState(initialNormalizer?.source.id ?? "")
  const [targetId, setTargetId] = React.useState(
    initialNormalizer ? initialTargetValue : (presetTargetValue ?? "")
  )
  const [sourceQuery, setSourceQuery] = React.useState("")
  const [targetQuery, setTargetQuery] = React.useState("")
  const [dataView, setDataView] = React.useState<"summary" | "table">("summary")
  const [sampleRows, setSampleRows] = React.useState(1000)
  const [catalogPickerOpen, setCatalogPickerOpen] = React.useState(false)
  const [selectedSource, setSelectedSource] = React.useState<string | null>(null)
  const [mappings, setMappings] = React.useState<Mapping[]>(initialNormalizer?.mappings ?? [])
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([])
  const [prompt, setPrompt] = React.useState("")
  const [assistantNote, setAssistantNote] = React.useState(
    initialNormalizer
      ? "This normalizer is fully mapped. Every OCSF field is covered — edit any mapping or ask Genie to refine it."
      : "Select source data and a destination to begin."
  )
  const [autoRunning, setAutoRunning] = React.useState(false)
  const [autoProgress, setAutoProgress] = React.useState(0)
  const [autoStatus, setAutoStatus] = React.useState("")
  const [dragOverTarget, setDragOverTarget] = React.useState<string | null>(null)
  const [saveOpen, setSaveOpen] = React.useState(false)
  const [yamlOpen, setYamlOpen] = React.useState(false)
  const [sqlOpen, setSqlOpen] = React.useState(false)
  const [destinationFormat, setDestinationFormat] =
    React.useState<"view" | "materialized_view" | "pipeline">("materialized_view")
  const autoTimer = React.useRef<ReturnType<typeof setInterval> | null>(null)

  React.useEffect(
    () => () => {
      if (autoTimer.current) clearInterval(autoTimer.current)
    },
    [],
  )

  const source = sources.find((item) => item.id === sourceId) ?? null
  const activeDestination = destinationOptions.find((option) => option.value === targetId) ?? null
  const target = activeDestination?.target ?? null
  const selectedModel = activeDestination?.model ?? null
  const ready = Boolean(source && target)
  const specYaml = React.useMemo(
    () =>
      source && target
        ? buildNormalizationYaml({ name: normalizerName, source, target, mappings })
        : "",
    [source, target, mappings, normalizerName]
  )
  const generatedSql = React.useMemo(
    () =>
      source && target
        ? buildGeneratedSql({
            source,
            target,
            mappings,
            materialization: selectedModel?.materialization ?? destinationFormat,
          })
        : [],
    [source, target, mappings, selectedModel, destinationFormat]
  )
  const visibleSourceFields = source
    ? source.fields.filter((field) =>
        `${field.path} ${field.type} ${field.sample}`.toLowerCase().includes(sourceQuery.toLowerCase())
      )
    : []
  const rawColumns = React.useMemo(
    () => flattenLeaves(visibleSourceFields.length ? visibleSourceFields : source ? source.fields : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source?.id, sourceQuery]
  )
  const rawRows = React.useMemo(
    () => (source ? buildRawRows(flattenLeaves(source.fields), sampleRows) : []),
    [source, sampleRows]
  )
  const visibleTargetFields = target
    ? target.fields.filter((field) =>
        field.path.toLowerCase().includes(targetQuery.toLowerCase())
      )
    : []
  const mappedTargets = new Set(mappings.map((mapping) => mapping.target))
  const proposedTargets = new Set(recommendations.map((item) => item.target))
  const relevantFields = target
    ? target.fields.filter((field) => field.requirement !== "optional")
    : []
  const mappedRelevant = relevantFields.filter((field) => mappedTargets.has(field.path)).length
  const coverage = relevantFields.length
    ? Math.round((mappedRelevant / relevantFields.length) * 100)
    : 0

  // Add-source flow: suggest a normalizer template that maps the picked parser
  // source into the (preset) destination class. Raw / UC-table sources have none.
  const sourceTemplate = React.useMemo(
    () =>
      source && target && source.kind === "parsed"
        ? (findTemplate(source.name, target.id) ?? null)
        : null,
    [source, target]
  )

  // Destination profiling reuses the source distributions so the two columns
  // line up side-by-side. Look up the SOURCE field a target is mapped to.
  const sourceLeafByPath = React.useMemo(
    () => new Map(flattenLeaves(source ? source.fields : []).map((leaf) => [leaf.path, leaf])),
    [source]
  )
  const resolveTargetSource = (targetPath: string): string | null => {
    const mapping = mappings.find((item) => item.target === targetPath)
    if (mapping) return mapping.source
    const rec = recommendations.find((item) => item.target === targetPath)
    return rec ? rec.source : null
  }
  const summaryForTarget = (targetPath: string): FieldSummary | null => {
    const src = resolveTargetSource(targetPath)
    if (!src) return null
    const leaf = sourceLeafByPath.get(src)
    if (leaf) return buildFieldSummary(leaf, sampleRows)
    // System / literal mapping (e.g. class_uid, product name) — a single constant.
    const literal = src.replace(/^'(.*)'$/, "$1")
    return { distinct: 1, coverage: 100, top: [{ value: literal, count: sampleRows }] }
  }
  const destColumns = visibleTargetFields.map((field) => ({ path: field.path, type: "string" }))
  const destRows = rawRows.map((row) => {
    const out: Record<string, string> = {}
    for (const field of visibleTargetFields) {
      const src = resolveTargetSource(field.path)
      if (!src) {
        out[field.path] = "—"
      } else if (sourceLeafByPath.has(src)) {
        out[field.path] = row[src] ?? "—"
      } else {
        out[field.path] = src.replace(/^'(.*)'$/, "$1")
      }
    }
    return out
  })

  const resetForContext = (nextSourceId: string, nextTargetValue: string) => {
    if (autoTimer.current) clearInterval(autoTimer.current)
    setAutoRunning(false)
    setAutoProgress(0)
    setAutoStatus("")
    setSelectedSource(null)
    const nextSource = sources.find((item) => item.id === nextSourceId)
    const nextTarget = destinationOptions.find((option) => option.value === nextTargetValue)?.target
    if (!nextSource || !nextTarget) {
      setMappings([])
      setRecommendations([])
      setAssistantNote("Select source data and a destination to begin.")
      return
    }
    setMappings(
      SYSTEM_MAPPINGS.map((mapping) => {
        if (mapping.target === "class_uid") {
          return { ...mapping, source: String(nextTarget.classUid), expression: String(nextTarget.classUid) }
        }
        if (mapping.target === "category_uid") {
          const category = String(Math.floor(nextTarget.classUid / 1000))
          return { ...mapping, source: category, expression: category }
        }
        if (mapping.target === "metadata.product.name") {
          return { ...mapping, source: `'${nextSource.name}'`, expression: `'${nextSource.name}'` }
        }
        return mapping
      })
    )
    // Recommendations are no longer pre-populated — the user runs Auto-normalize,
    // or maps fields manually by dragging / clicking.
    setRecommendations([])
    setAssistantNote(
      "Run Auto-normalize to generate recommended mappings, or drag source fields onto OCSF fields to map them manually."
    )
  }

  const acceptRecommendation = (recommendation: Recommendation) => {
    setMappings((current) => [
      ...current.filter((mapping) => mapping.target !== recommendation.target),
      {
        id: `genie-${recommendation.id}`,
        source: recommendation.source,
        target: recommendation.target,
        expression: recommendation.expression,
        origin: "genie",
      },
    ])
    setRecommendations((current) => current.filter((item) => item.id !== recommendation.id))
  }

  const applyMapping = (sourcePath: string, targetPath: string) => {
    setMappings((current) => [
      ...current.filter((mapping) => mapping.target !== targetPath),
      {
        id: `manual-${sourcePath}-${targetPath}`,
        source: sourcePath,
        target: targetPath,
        expression: sourcePath,
        origin: "manual",
      },
    ])
    setRecommendations((current) => current.filter((item) => item.target !== targetPath))
    setSelectedSource(null)
  }

  const mapToTarget = (targetPath: string) => {
    if (!selectedSource) return
    applyMapping(selectedSource, targetPath)
  }

  // Shared progressive reveal used by Auto-normalize and Apply-template: streams
  // the queued recommendations in over `duration`ms with a status + progress bar.
  const runProgressive = (queue: Recommendation[], startNote: string, doneNote: string, duration = 20000) => {
    setRecommendations([])
    setAutoRunning(true)
    setAutoProgress(0)
    setAutoStatus("Scanning source schema…")
    setAssistantNote(startNote)

    const start = Date.now()
    const statusFor = (p: number) =>
      p < 20
        ? "Scanning source schema…"
        : p < 45
          ? "Profiling field values…"
          : p < 75
            ? "Matching to OCSF fields…"
            : "Scoring mapping confidence…"

    if (autoTimer.current) clearInterval(autoTimer.current)
    autoTimer.current = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(100, Math.round((elapsed / duration) * 100))
      setAutoProgress(progress)
      setAutoStatus(statusFor(progress))
      const revealCount = Math.min(queue.length, Math.floor((progress / 100) * queue.length))
      setRecommendations(queue.slice(0, revealCount))
      if (elapsed >= duration) {
        if (autoTimer.current) clearInterval(autoTimer.current)
        autoTimer.current = null
        setRecommendations(queue)
        setAutoProgress(100)
        setAutoRunning(false)
        setAutoStatus("")
        setAssistantNote(doneNote)
      }
    }, 300)
  }

  // Auto-normalize simulates Genie profiling the schema over ~20s, revealing the
  // recommended mappings progressively with a status + progress indicator.
  const runAutoNormalize = () => {
    if (!source || !target || autoRunning) return
    const isOktaAuth = source.id === "okta-parsed" && target.id === "authentication"
    const base: Recommendation[] = isOktaAuth
      ? OKTA_RECOMMENDATIONS
      : target.fields.slice(0, Math.min(6, source.fields.length)).map((field, index) => ({
          id: `generated-${field.path}`,
          source: source.fields[index].path,
          target: field.path,
          expression: source.fields[index].path,
          confidence: 90 - index * 3,
          rationale: "Genie matched compatible field semantics and observed values.",
        }))
    const queue = base.filter((item) => !mappedTargets.has(item.target))
    if (queue.length === 0) {
      setAssistantNote("All required and recommended fields are already mapped.")
      return
    }
    runProgressive(
      queue,
      `Auto-normalizing ${source.name} → ${target.name}…`,
      `Genie found ${queue.length} recommended mappings from the ${source.name} schema. Review and accept below.`
    )
  }

  // Apply a suggested normalizer template: seed recommendations from the
  // template's field mappings and stream them in like Auto-normalize.
  const applyTemplate = (template: NormalizerBlueprint) => {
    if (!source || !target || autoRunning) return
    const queue: Recommendation[] = template.mappings
      .filter((mapping) => mapping.origin !== "system" && !mappedTargets.has(mapping.target))
      .map((mapping, index) => ({
        id: `template-${mapping.target}`,
        source: mapping.expression,
        target: mapping.target,
        expression: mapping.expression,
        confidence: 97 - index,
        rationale: `Mapped from the “${template.displayName}” template.`,
      }))
    if (queue.length === 0) {
      setAssistantNote("Every field from this template is already mapped.")
      return
    }
    runProgressive(
      queue,
      `Applying “${template.displayName}”…`,
      `Applied ${queue.length} mappings from “${template.displayName}”. Review and accept below, or refine with Genie.`,
      9000
    )
  }

  const submitPrompt = () => {
    if (!prompt.trim()) return
    setAssistantNote(
      `I reviewed “${prompt.trim()}”. The next recommendations prioritize required OCSF fields and preserve the raw event for provenance.`
    )
    setPrompt("")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1 text-hint text-muted-foreground">
            <Link href="/lakewatch/normalizers" className="text-primary hover:underline">
              Normalizers
            </Link>
            <ChevronRightIcon size={12} />
            <span className="truncate">{isExisting ? normalizerName : "Create normalizer"}</span>
          </div>
          <h1 className={PAGE_TITLE_SEMIBOLD}>{isExisting ? normalizerName : "Create normalizer"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isExisting
              ? `Mapping ${initialNormalizer!.source.name} into OCSF ${initialNormalizer!.target.name}.`
              : "Map a parsed or raw datasource into an OCSF event class."}
          </p>
          <Button
            variant="link"
            size="sm"
            className="mt-1 h-auto justify-start p-0"
            disabled={!ready}
            onClick={() => setSqlOpen(true)}
          >
            Show generated SQL
          </Button>
        </div>
        <div className="flex shrink-0 items-end gap-4">
          <div className="flex w-[280px] flex-col gap-1.5">
            <Label htmlFor="normalizer-name">Normalizer name</Label>
            <Input
              id="normalizer-name"
              value={normalizerName}
              onChange={(event) => setNormalizerName(event.target.value)}
              placeholder="e.g. Okta System Log to OCSF Authentication"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" asChild>
              <Link href="/lakewatch/normalizers">Cancel</Link>
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!normalizerName.trim() || !ready}
              onClick={() => setSaveOpen(true)}
            >
              {isExisting ? "Save changes" : "Save normalizer"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(280px,0.9fr)_minmax(280px,0.9fr)_minmax(390px,1.2fr)] overflow-x-auto">
        <StudioColumn
          icon={<Database className="h-4 w-4 text-muted-foreground" />}
          title="Source data"
          subtitle="Choose parsed or raw datasource data"
          footer={source ? <span className="text-hint text-muted-foreground">{source.records}</span> : undefined}
        >
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-2">
              <Select
                value={sourceId || undefined}
                onValueChange={(value) => {
                  setSourceId(value)
                  resetForContext(value, targetId)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Parsed tables</SelectLabel>
                    {sources.filter((item) => item.kind === "parsed").map((item) => (
                      <SelectItem key={item.id} value={item.id} description={item.table}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Raw datasource tables</SelectLabel>
                    {sources.filter((item) => item.kind === "raw").map((item) => (
                      <SelectItem key={item.id} value={item.id} description={item.table}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Browse Unity Catalog"
                onClick={() => setCatalogPickerOpen(true)}
              >
                <FolderIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            {source ? (
              <>
                <div className="rounded-md border border-border bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <code className="truncate text-hint text-foreground">{source.table}</code>
                    <Badge variant={source.kind === "parsed" ? "teal" : "charcoal"}>
                      {source.kind === "parsed" ? "Parsed" : "Raw"}
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <SearchIcon
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={sourceQuery}
                    onChange={(event) => setSourceQuery(event.target.value)}
                    placeholder="Filter source fields"
                    className="pl-9"
                  />
                </div>
              </>
            ) : (
              <p className="rounded-md border border-dashed border-border p-3 text-hint text-muted-foreground">
                Select a parsed or raw datasource table to view its fields.
              </p>
            )}
          </div>
          {source ? (
            <div className="border-t border-border">
              <DataViewControls
                view={dataView}
                onViewChange={setDataView}
                sampleRows={sampleRows}
                onSampleRowsChange={setSampleRows}
                caption={
                  dataView === "table"
                    ? `Showing ${rawRows.length} of ${sampleRows.toLocaleString()} rows · ${rawColumns.length} columns`
                    : `${source.fields.length} columns · ${sampleRows.toLocaleString()} rows profiled`
                }
              />
              {dataView === "summary" ? (
                <div className="flex flex-col gap-1 px-2 pb-3">
                  {visibleSourceFields.length ? (
                    <p className="px-2 pb-1 text-hint text-muted-foreground">
                      Drag a field onto an OCSF field, or click to select then choose a destination.
                    </p>
                  ) : (
                    <p className="px-2 text-hint text-muted-foreground">
                      No fields match your filter.
                    </p>
                  )}
                  {visibleSourceFields.map((field) => (
                    <SourceFieldSummaryRow
                      key={field.path}
                      field={field}
                      sampleRows={sampleRows}
                      selectedSource={selectedSource}
                      onSelect={setSelectedSource}
                      onDragStartField={(path, event) => {
                        event.dataTransfer.setData("text/plain", path)
                        event.dataTransfer.effectAllowed = "copy"
                        setSelectedSource(path)
                      }}
                      onDragEndField={() => setDragOverTarget(null)}
                    />
                  ))}
                </div>
              ) : (
                <RawDataTable columns={rawColumns} rows={rawRows} />
              )}
            </div>
          ) : null}
        </StudioColumn>

        <StudioColumn
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          title="Destination"
          subtitle="Data model or OCSF event class"
          headerAction={
            <Button
              variant="default"
              size="xs"
              disabled={!ready}
              onClick={() => setYamlOpen(true)}
            >
              <FileCode className="h-4 w-4" />
              YAML
            </Button>
          }
          footer={
            target ? (
              <div className="flex items-center justify-between text-hint text-muted-foreground">
                <span>{mappedRelevant} of {relevantFields.length} required/recommended</span>
                <span>{coverage}%</span>
              </div>
            ) : undefined
          }
        >
          <div className="flex flex-col gap-4 p-4">
            <Select
              value={targetId || undefined}
              disabled={lockDestination}
              onValueChange={(value) => {
                setTargetId(value)
                resetForContext(sourceId, value)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select data model or OCSF class" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Data models</SelectLabel>
                  {modelOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      description={option.description}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>OCSF event classes — new data model</SelectLabel>
                  {classOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      description={option.description}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {target ? (
              <>
                {selectedModel ? (
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                    <div className="flex items-center gap-2">
                      <DataModelNavIcon size={16} className="shrink-0 text-primary" />
                      <span className="font-semibold text-foreground">{selectedModel.name}</span>
                      <Badge variant="indigo" className="ml-auto">
                        {materializationLabel(selectedModel.materialization)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-hint text-muted-foreground">
                      Existing data model. This normalizer will be added as a source — its output
                      conforms to the model’s schema.
                    </p>
                  </div>
                ) : null}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-hint text-muted-foreground">{target.category}</span>
                    <Badge variant="indigo">class_uid {target.classUid}</Badge>
                  </div>
                  <Progress value={coverage} className="h-1.5" />
                </div>
                <div className="relative">
                  <SearchIcon
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={targetQuery}
                    onChange={(event) => setTargetQuery(event.target.value)}
                    placeholder="Filter OCSF fields"
                    className="pl-9"
                  />
                </div>
              </>
            ) : (
              <p className="rounded-md border border-dashed border-border p-3 text-hint text-muted-foreground">
                Select a data model or OCSF event class to view its fields.
              </p>
            )}
            {selectedSource ? (
              <p className="rounded bg-primary/10 p-2 text-hint text-primary">
                Select a destination for <code>{selectedSource}</code>
              </p>
            ) : null}
          </div>
          {target ? (
            <div className="border-t border-border">
              <DataViewControls
                view={dataView}
                onViewChange={setDataView}
                sampleRows={sampleRows}
                onSampleRowsChange={setSampleRows}
                caption={
                  dataView === "table"
                    ? `Showing ${destRows.length} of ${sampleRows.toLocaleString()} rows · ${destColumns.length} columns`
                    : `${visibleTargetFields.length} fields · ${mappedRelevant} mapped`
                }
              />
              {dataView === "summary" ? (
                <div className="flex flex-col gap-1 px-2 pb-3">
                  {visibleTargetFields.map((field) => {
                    const mapped = mappedTargets.has(field.path)
                    const proposed = proposedTargets.has(field.path)
                    const isDropTarget = dragOverTarget === field.path
                    return (
                      <DestinationFieldSummaryRow
                        key={field.path}
                        field={field}
                        summary={summaryForTarget(field.path)}
                        mapped={mapped}
                        proposed={proposed}
                        isDropTarget={isDropTarget}
                        onClickMap={() => mapToTarget(field.path)}
                        onDragOver={(event) => {
                          event.preventDefault()
                          event.dataTransfer.dropEffect = "copy"
                          if (dragOverTarget !== field.path) setDragOverTarget(field.path)
                        }}
                        onDragLeave={() =>
                          setDragOverTarget((current) => (current === field.path ? null : current))
                        }
                        onDrop={(event) => {
                          event.preventDefault()
                          const sourcePath = event.dataTransfer.getData("text/plain")
                          if (sourcePath) applyMapping(sourcePath, field.path)
                          setDragOverTarget(null)
                        }}
                      />
                    )
                  })}
                </div>
              ) : (
                <RawDataTable columns={destColumns} rows={destRows} />
              )}
            </div>
          ) : null}
        </StudioColumn>

        <StudioColumn
          icon={<DbIcon icon={SparkleIcon} color="ai" size={16} />}
          title="Mapping assistant"
          subtitle="Review rules, map manually, or ask Genie"
          footer={
            <div className="flex gap-2">
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={
                  ready
                    ? "Ask Genie about this normalization…"
                    : "Select source data and a destination to ask Genie"
                }
                disabled={!ready}
                className="min-h-16 resize-none"
              />
              <Button
                variant="primary"
                size="icon-sm"
                onClick={submitPrompt}
                disabled={!ready || !prompt.trim()}
                aria-label="Send prompt"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4 p-4">
            <div className="rounded-md border border-border bg-ai-gradient-subtle p-3">
              <div className="flex items-start gap-2">
                <DbIcon icon={SparkleIcon} color="ai" size={16} className="mt-0.5" />
                <p className="text-sm text-foreground">{assistantNote}</p>
              </div>
            </div>

            {ready && !autoRunning && recommendations.length === 0 && coverage < 100 ? (
              source && source.kind === "parsed" && sourceTemplate ? (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-start gap-2">
                    <DbIcon icon={SparkleIcon} color="ai" size={16} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">Suggested template</p>
                      <p className="text-hint text-muted-foreground">
                        <span className="text-foreground">{sourceTemplate.displayName}</span> matches{" "}
                        {source.name}. Apply it to auto-map this source into {target?.name}.
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button variant="primary" size="xs" onClick={() => applyTemplate(sourceTemplate)}>
                      <DbIcon icon={SparkleIcon} color="ai" size={16} />
                      Apply template
                    </Button>
                  </div>
                </div>
              ) : source ? (
                <div className="rounded-md border border-border bg-muted/40 p-3">
                  <p className="text-hint text-muted-foreground">
                    No normalization template exists for this source. Start from scratch — run
                    Auto-normalize or map fields manually.
                  </p>
                </div>
              ) : null
            ) : null}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Recommendations</h3>
                <p className="text-hint text-muted-foreground">
                  {autoRunning
                    ? `${recommendations.length} found so far…`
                    : `${recommendations.length} suggestions to review`}
                </p>
              </div>
              {autoRunning ? (
                <Button variant="default" size="xs" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Auto-normalizing…
                </Button>
              ) : recommendations.length ? (
                <Button
                  variant="default"
                  size="xs"
                  onClick={() => recommendations.forEach(acceptRecommendation)}
                >
                  Accept all
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="xs"
                  disabled={!ready || coverage === 100}
                  onClick={runAutoNormalize}
                >
                  <DbIcon icon={SparkleIcon} color="ai" size={16} />
                  Auto-normalize
                </Button>
              )}
            </div>

            {autoRunning ? (
              <div className="flex flex-col gap-2 rounded-md border border-border p-3">
                <div className="flex items-center gap-2">
                  <DbIcon icon={SparkleIcon} color="ai" size={16} />
                  <span className="text-sm font-semibold text-foreground">{autoStatus}</span>
                  <span className="ml-auto text-hint text-muted-foreground">{autoProgress}%</span>
                </div>
                <Progress value={autoProgress} className="h-1.5" />
              </div>
            ) : null}

            {recommendations.map((recommendation) => (
              <article key={recommendation.id} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="truncate font-semibold text-foreground">{recommendation.target}</code>
                      <Badge variant="indigo">{recommendation.confidence}%</Badge>
                    </div>
                    <code className="mt-1 block truncate text-hint text-primary">
                      {recommendation.expression}
                    </code>
                  </div>
                </div>
                <p className="mt-2 text-hint text-muted-foreground">{recommendation.rationale}</p>
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    disabled={autoRunning}
                    onClick={() =>
                      setRecommendations((current) =>
                        current.filter((item) => item.id !== recommendation.id)
                      )
                    }
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    disabled={autoRunning}
                    onClick={() => acceptRecommendation(recommendation)}
                  >
                    Accept
                  </Button>
                </div>
              </article>
            ))}

            {mappings.length ? (
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Applied mappings · {mappings.length}</h3>
              <div className="flex flex-col gap-2">
                {mappings.map((mapping) => (
                  <div key={mapping.id} className="rounded border border-border p-3">
                    <div className="flex items-center gap-2">
                      <code className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                        {mapping.target}
                      </code>
                      <Badge
                        variant={mapping.origin === "genie" ? "indigo" : mapping.origin === "manual" ? "teal" : "secondary"}
                        className="font-normal"
                      >
                        {mapping.origin}
                      </Badge>
                    </div>
                    <code className="mt-1 block truncate text-hint text-muted-foreground">
                      {mapping.expression}
                    </code>
                  </div>
                ))}
              </div>
            </div>
            ) : null}
          </div>
        </StudioColumn>
      </div>

      <SourceCatalogPicker
        open={catalogPickerOpen}
        onOpenChange={setCatalogPickerOpen}
        selectedSourceId={sourceId}
        onSelect={(nextSourceId) => {
          setSourceId(nextSourceId)
          resetForContext(nextSourceId, targetId)
        }}
      />

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedModel ? (
            <>
              <DialogHeader className="gap-1.5">
                <DialogTitle>{isExisting ? "Save changes" : "Add to data model"}</DialogTitle>
                <DialogDescription>
                  {isExisting
                    ? "Save this normalizer’s mappings back to its data model."
                    : "Add this normalizer as a source to an existing data model."}
                </DialogDescription>
              </DialogHeader>
              <DialogBody className="gap-3">
                <div className="rounded-md border border-border p-3">
                  <div className="flex items-center gap-2">
                    <DataModelNavIcon size={16} className="shrink-0 text-primary" />
                    <span className="font-semibold text-foreground">{selectedModel.name}</span>
                    <Badge variant="indigo" className="ml-auto">
                      {materializationLabel(selectedModel.materialization)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-hint text-muted-foreground">
                    Materialization is inherited from the existing model — no format choice needed.
                  </p>
                </div>
                <p className="text-hint text-muted-foreground">
                  <code>{source?.name ?? "This source"}</code> is normalized to the{" "}
                  {target?.name} schema and unioned into {selectedModel.name}.
                </p>
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="default" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSaveOpen(false)
                    toast.success(
                      isExisting
                        ? "Normalizer saved"
                        : `Added to ${selectedModel.name}`
                    )
                    router.push("/lakewatch/normalizers")
                  }}
                >
                  {isExisting ? "Save changes" : "Add to data model"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader className="gap-1.5">
                <DialogTitle>Create data model</DialogTitle>
                <DialogDescription>
                  This creates a new {target?.name ?? "OCSF"} data model. Choose how its output is
                  materialized.
                </DialogDescription>
              </DialogHeader>
              <DialogBody className="gap-2">
                {DESTINATION_FORMATS.map((format) => {
                  const selected = destinationFormat === format.id
                  return (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => setDestinationFormat(format.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-md border p-3 text-left transition-colors",
                        selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
                      )}
                    >
                      <format.Icon
                        size={16}
                        className={cn("mt-0.5 shrink-0", selected ? "text-primary" : "text-muted-foreground")}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{format.label}</span>
                          {selected ? <CheckIcon size={16} className="ml-auto shrink-0 text-primary" /> : null}
                        </div>
                        <p className="text-hint text-muted-foreground">{format.description}</p>
                      </div>
                    </button>
                  )
                })}
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="default" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSaveOpen(false)
                    toast.success("Data model created")
                    router.push("/lakewatch/normalizers")
                  }}
                >
                  Create data model
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={yamlOpen} onOpenChange={setYamlOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-3xl">
          <DialogHeader className="gap-1.5">
            <div className="flex items-center gap-2">
              <DialogTitle>Normalization spec</DialogTitle>
              <Badge variant="secondary" className="font-normal">
                YAML
              </Badge>
              <Button
                variant="default"
                size="xs"
                className="ml-auto"
                onClick={() => {
                  navigator.clipboard?.writeText(specYaml)
                  toast.success("YAML copied")
                }}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <DialogDescription>
              Read-only spec generated from the current mappings. The app only generates it — it
              never runs it.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-grey-800">
            <pre className="p-4 font-mono text-xs leading-5 text-grey-100">
              <code>{specYaml}</code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sqlOpen} onOpenChange={setSqlOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-3xl">
          <DialogHeader className="gap-1.5">
            <DialogTitle>Generated SQL</DialogTitle>
            <DialogDescription>
              The DDL this spec maps to. This app does not run these statements — copy them and run
              them yourself.
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
            {generatedSql.map((statement) => (
              <div key={statement.name} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="charcoal">{statement.kind}</Badge>
                  <code className="text-sm font-semibold text-foreground">{statement.name}</code>
                  <Button
                    variant="default"
                    size="xs"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard?.writeText(statement.sql)
                      toast.success("SQL copied")
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <div className="overflow-auto rounded-md border border-border bg-grey-800">
                  <pre className="p-4 font-mono text-xs leading-5 text-grey-100">
                    <code>{statement.sql}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(
                  generatedSql.map((statement) => `${statement.sql};`).join("\n\n")
                )
                toast.success("All statements copied")
              }}
            >
              <Copy className="h-4 w-4" />
              Copy all statements
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

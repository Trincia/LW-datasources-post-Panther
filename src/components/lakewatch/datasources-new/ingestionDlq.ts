// ─── Ingestion DLQ model (P1) ────────────────────────────────────────────────
// Datasource-owned dead-letter queue for records that fail an *ingestion* stage
// (after source read, before/at the write to the datasource's raw or parsed
// tables). This is separate from the normalization-stage DLQ modeled on data
// models. P0 Health still surfaces source/decode/parser/output failures as
// telemetry independent of this configuration.

export type DlqStage =
  | "unwrap"
  | "parser_match"
  | "field_validation"
  | "output_write"

export type StageMeta = {
  id: DlqStage
  /** Order in the ingestion funnel. */
  order: number
  label: string
  description: string
  /** Whether the stage exists for a raw-only (no parser) datasource. */
  rawOnly: boolean
}

/** Canonical funnel order. Stages are only rendered when the backend contract
 *  reports support for them (see IngestionDlqConfig.stages). */
export const STAGE_META: Record<DlqStage, StageMeta> = {
  unwrap: {
    id: "unwrap",
    order: 0,
    label: "Stream type / Unwrapping",
    description: "Decompress, split, and unwrap the source envelope into records.",
    rawOnly: true,
  },
  parser_match: {
    id: "parser_match",
    order: 1,
    label: "Parser match",
    description: "Route each record to a pinned parser version.",
    rawOnly: false,
  },
  field_validation: {
    id: "field_validation",
    order: 2,
    label: "Declared-field validation",
    description: "Validate required and declared fields against the parser contract.",
    rawOnly: false,
  },
  output_write: {
    id: "output_write",
    order: 3,
    label: "Output write",
    description: "Write the record to its destination table.",
    rawOnly: true,
  },
}

export const STAGE_ORDER: DlqStage[] = (
  Object.values(STAGE_META) as StageMeta[]
)
  .sort((a, b) => a.order - b.order)
  .map((meta) => meta.id)

export type RedriveReason =
  | "retention_expired"
  | "unsupported_stage"
  | "no_fix_saved"
  | "permission"

export type RedriveEligibility =
  | { redrivable: true }
  | { redrivable: false; reason: RedriveReason }

export const REDRIVE_REASON_LABEL: Record<RedriveReason, string> = {
  retention_expired: "Past retention — records have expired and can no longer be redriven.",
  unsupported_stage: "Redrive isn't supported for this stage by the ingestion backend.",
  no_fix_saved: "Save a parser or datasource fix before redriving these records.",
  permission: "You don't have permission to redrive for this datasource.",
}

export type DlqRecordGroup = {
  id: string
  stage: DlqStage
  error: { code: string; message: string }
  /** Logical event name (permission-gated). */
  logicalEvent?: string
  /** Reference to the originating decoded record (permission-gated). */
  decodedRecordRef?: string
  /** Pinned parser versions evaluated when the record failed. */
  parserVersionsEvaluated?: { name: string; version: string }[]
  count: number
  firstSeen: string
  lastSeen: string
  /** DLQ destination display name (never a credential / internal path). */
  destination: string
  eligibility: RedriveEligibility
}

export type IngestionDlqConfig = {
  /** Display name only — no credentials or internal storage details. */
  destination: string
  retentionDays: number
  /** Stages the backend contract supports for this datasource. */
  stages: DlqStage[]
  /** Whether Lakewatch supplied the config (defaults) vs user-configured. */
  managedBy: "lakewatch-default" | "user"
  permissions: {
    canViewRecordContent: boolean
    canRedrive: boolean
  }
}

export type IngestionDlqSummary = {
  total: number
  redrivable: number
  oldest: string
  newest: string
  byStage: Record<DlqStage, number>
}

export type IngestionDlqData = {
  config: IngestionDlqConfig
  records: DlqRecordGroup[]
  summary: IngestionDlqSummary
  rawOnly: boolean
}

// ─── Deterministic mock ──────────────────────────────────────────────────────

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function makeRng(seed: number) {
  let state = seed || 1
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 0xffffffff
  }
}

type ErrorSpec = { code: string; message: string; eligibility: RedriveEligibility }

const STAGE_ERRORS: Record<DlqStage, ErrorSpec[]> = {
  unwrap: [
    {
      code: "GZIP_DECODE_FAILED",
      message: "Truncated gzip stream — object ended mid-block.",
      eligibility: { redrivable: false, reason: "unsupported_stage" },
    },
    {
      code: "ENVELOPE_UNWRAP_FAILED",
      message: "Missing Records[] array in CloudTrail envelope.",
      eligibility: { redrivable: true },
    },
    {
      code: "NDJSON_SPLIT_FAILED",
      message: "Malformed JSON at a newline boundary.",
      eligibility: { redrivable: true },
    },
  ],
  parser_match: [
    {
      code: "NO_PARSER_MATCH",
      message: "No pinned parser matched the record shape.",
      eligibility: { redrivable: false, reason: "no_fix_saved" },
    },
    {
      code: "AMBIGUOUS_MATCH",
      message: "Record matched more than one pinned parser.",
      eligibility: { redrivable: false, reason: "no_fix_saved" },
    },
  ],
  field_validation: [
    {
      code: "REQUIRED_FIELD_MISSING",
      message: "Declared field 'eventTime' was missing.",
      eligibility: { redrivable: true },
    },
    {
      code: "FIELD_TYPE_MISMATCH",
      message: "Field 'sourceIPAddress' expected string, got object.",
      eligibility: { redrivable: true },
    },
    {
      code: "DECLARED_FIELD_EXPIRED",
      message: "Field 'srcUser' failed validation before retention lapsed.",
      eligibility: { redrivable: false, reason: "retention_expired" },
    },
  ],
  output_write: [
    {
      code: "SCHEMA_MISMATCH",
      message: "Target column count differs from the record.",
      eligibility: { redrivable: true },
    },
    {
      code: "WRITE_PERMISSION_DENIED",
      message: "Runtime identity lacks INSERT on the target table.",
      eligibility: { redrivable: false, reason: "permission" },
    },
    {
      code: "TRANSIENT_WRITE_ERROR",
      message: "Write timed out; automatic retries exhausted.",
      eligibility: { redrivable: true },
    },
  ],
}

const LOGICAL_EVENTS = [
  "user.session.start",
  "user.authentication.failed",
  "ConsoleLogin",
  "AssumeRole",
  "kv.secret.read",
  "file.access.denied",
  "network.flow.reject",
]

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
}

function daysAgo(days: number): string {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/** Lakewatch-supplied ingestion-DLQ defaults (managed / review-only). Used both
 *  by the detail tab and the authoring review summary so they stay in sync. */
export function ingestionDlqDefaults(
  sourceName: string,
  opts: { catalog?: string; rawOnly?: boolean } = {}
): { destination: string; retentionDays: number; stages: DlqStage[] } {
  const rawOnly = opts.rawOnly ?? false
  const catalog = opts.catalog?.trim() || "sec_dev"
  return {
    destination: `${catalog}.ingest_dlq.${slug(sourceName || "datasource")}`,
    retentionDays: 14,
    stages: STAGE_ORDER.filter((stage) => (rawOnly ? STAGE_META[stage].rawOnly : true)),
  }
}

/** Build the ingestion-DLQ dataset for a datasource. Deterministic per name so
 *  the tab is stable across renders. `parsers` are the currently pinned parser
 *  rows; when empty the datasource is treated as raw-only. */
export function getIngestionDlq(
  sourceName: string,
  parsers: { name: string; version: string }[] = []
): IngestionDlqData {
  const rawOnly = parsers.length === 0
  const { destination, retentionDays, stages } = ingestionDlqDefaults(sourceName, { rawOnly })

  const config: IngestionDlqConfig = {
    destination,
    retentionDays,
    stages,
    managedBy: "lakewatch-default",
    permissions: { canViewRecordContent: true, canRedrive: true },
  }

  const rng = makeRng(hashString(sourceName))
  const records: DlqRecordGroup[] = []
  let idSeed = 0

  for (const stage of stages) {
    // 1–2 groups per stage, weighted so the funnel looks realistic.
    const groupCount = 1 + Math.round(rng())
    const specs = STAGE_ERRORS[stage]
    for (let g = 0; g < groupCount; g += 1) {
      const spec = specs[Math.floor(rng() * specs.length)]
      const count = 1 + Math.floor(rng() * 40)
      const firstDays = 1 + Math.floor(rng() * (retentionDays + 6))
      const lastDays = Math.max(0, firstDays - Math.floor(rng() * firstDays))
      // Retention-expired records only when they actually fall outside window.
      const expired = firstDays > retentionDays
      const eligibility: RedriveEligibility = expired
        ? { redrivable: false, reason: "retention_expired" }
        : spec.eligibility
      const evaluated =
        stage === "unwrap" || rawOnly
          ? undefined
          : parsers.slice(0, 1 + Math.floor(rng() * parsers.length))
      idSeed += 1
      records.push({
        id: `dlq-${slug(sourceName)}-${idSeed}`,
        stage,
        error: { code: spec.code, message: spec.message },
        logicalEvent:
          config.permissions.canViewRecordContent && stage !== "unwrap"
            ? LOGICAL_EVENTS[Math.floor(rng() * LOGICAL_EVENTS.length)]
            : undefined,
        decodedRecordRef: config.permissions.canViewRecordContent
          ? `part-${String(Math.floor(rng() * 900) + 100)}.jsonl#L${Math.floor(rng() * 4000)}`
          : undefined,
        parserVersionsEvaluated: evaluated,
        count,
        firstSeen: daysAgo(firstDays),
        lastSeen: daysAgo(lastDays),
        destination,
        eligibility,
      })
    }
  }

  const byStage = STAGE_ORDER.reduce(
    (acc, stage) => {
      acc[stage] = records
        .filter((record) => record.stage === stage)
        .reduce((sum, record) => sum + record.count, 0)
      return acc
    },
    { unwrap: 0, parser_match: 0, field_validation: 0, output_write: 0 } as Record<DlqStage, number>
  )

  const total = records.reduce((sum, record) => sum + record.count, 0)
  const redrivable = records
    .filter((record) => record.eligibility.redrivable)
    .reduce((sum, record) => sum + record.count, 0)

  const summary: IngestionDlqSummary = {
    total,
    redrivable,
    oldest: records.length ? records[0].firstSeen : "—",
    newest: records.length ? records[records.length - 1].lastSeen : "—",
    byStage,
  }

  return { config, records, summary, rawOnly }
}

/** The most-failing stage for a datasource, for list-page indicators. Returns
 *  null when there is no ingestion DLQ activity. */
export function topFailingStage(
  sourceName: string,
  parsers: { name: string; version: string }[] = []
): { stage: DlqStage; count: number } | null {
  const { summary } = getIngestionDlq(sourceName, parsers)
  let best: { stage: DlqStage; count: number } | null = null
  for (const stage of STAGE_ORDER) {
    const count = summary.byStage[stage]
    if (count > 0 && (!best || count > best.count)) best = { stage, count }
  }
  return best
}

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CircleDashed, Database, Loader2, Send, Target } from "lucide-react"
import { toast } from "sonner"

import {
  CheckIcon,
  ChevronRightIcon,
  SearchIcon,
  SparkleIcon,
} from "@/components/icons"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DbIcon } from "@/components/ui/db-icon"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type SourceField = { path: string; type: string; sample: string }
type SourceDataset = {
  id: string
  kind: "parsed" | "raw"
  name: string
  table: string
  records: string
  fields: SourceField[]
}
type TargetField = {
  path: string
  requirement: "required" | "recommended" | "optional"
}
type TargetClass = {
  id: string
  name: string
  category: string
  classUid: number
  fields: TargetField[]
}
type Mapping = {
  id: string
  source: string
  target: string
  expression: string
  origin: "system" | "manual" | "genie"
}
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
      { path: "actor.id", type: "string", sample: "00u1a2b3c4D5e6F7g8h9" },
      { path: "actor.email", type: "string", sample: "alice.nguyen@acme.com" },
      { path: "actor.name", type: "string", sample: "Alice Nguyen" },
      { path: "client.ip_address", type: "string", sample: "203.0.113.24" },
      { path: "outcome.result", type: "string", sample: "SUCCESS" },
      { path: "session.id", type: "string", sample: "102rPxN9qQ1TkSxb5oQz" },
      { path: "authentication.is_mfa", type: "boolean", sample: "true" },
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

const AUTH_FIELDS: TargetField[] = [
  { path: "activity_id", requirement: "required" },
  { path: "time", requirement: "required" },
  { path: "user.uid", requirement: "recommended" },
  { path: "user.name", requirement: "recommended" },
  { path: "user.email_addr", requirement: "recommended" },
  { path: "src_endpoint.ip", requirement: "recommended" },
  { path: "status_id", requirement: "recommended" },
  { path: "session.uid", requirement: "optional" },
  { path: "session.is_mfa", requirement: "recommended" },
  { path: "message", requirement: "recommended" },
  { path: "metadata.product.name", requirement: "recommended" },
  { path: "raw_data", requirement: "recommended" },
]

const TARGETS: TargetClass[] = [
  {
    id: "authentication",
    name: "Authentication",
    category: "Identity & Access Management",
    classUid: 3002,
    fields: AUTH_FIELDS,
  },
  {
    id: "api-activity",
    name: "API Activity",
    category: "System Activity",
    classUid: 6003,
    fields: [
      { path: "activity_id", requirement: "required" },
      { path: "time", requirement: "required" },
      { path: "actor.user.uid", requirement: "recommended" },
      { path: "api.operation", requirement: "recommended" },
      { path: "src_endpoint.ip", requirement: "recommended" },
      { path: "status_id", requirement: "recommended" },
      { path: "message", requirement: "recommended" },
      { path: "raw_data", requirement: "recommended" },
    ],
  },
  {
    id: "process-activity",
    name: "Process Activity",
    category: "System Activity",
    classUid: 1007,
    fields: [
      { path: "activity_id", requirement: "required" },
      { path: "time", requirement: "required" },
      { path: "process.uid", requirement: "recommended" },
      { path: "process.name", requirement: "recommended" },
      { path: "actor.user.uid", requirement: "recommended" },
      { path: "status_id", requirement: "recommended" },
      { path: "raw_data", requirement: "recommended" },
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
  className,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
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
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer ? <footer className="shrink-0 border-t border-border p-3">{footer}</footer> : null}
    </section>
  )
}

function RequirementBadge({ value }: { value: TargetField["requirement"] }) {
  return (
    <Badge
      variant={value === "required" ? "destructive" : value === "recommended" ? "default_tag" : "secondary"}
      className="ml-auto px-1 font-normal"
    >
      {value === "required" ? "REQ" : value === "recommended" ? "REC" : "OPT"}
    </Badge>
  )
}

export function LakewatchCreateNormalizerStudio() {
  const router = useRouter()
  const [normalizerName, setNormalizerName] = React.useState("")
  const [sourceId, setSourceId] = React.useState("")
  const [targetId, setTargetId] = React.useState("")
  const [sourceQuery, setSourceQuery] = React.useState("")
  const [targetQuery, setTargetQuery] = React.useState("")
  const [selectedSource, setSelectedSource] = React.useState<string | null>(null)
  const [mappings, setMappings] = React.useState<Mapping[]>([])
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([])
  const [prompt, setPrompt] = React.useState("")
  const [assistantNote, setAssistantNote] = React.useState(
    "Select source data and an OCSF destination to begin."
  )
  const [autoRunning, setAutoRunning] = React.useState(false)
  const [autoProgress, setAutoProgress] = React.useState(0)
  const [autoStatus, setAutoStatus] = React.useState("")
  const [dragOverTarget, setDragOverTarget] = React.useState<string | null>(null)
  const autoTimer = React.useRef<ReturnType<typeof setInterval> | null>(null)

  React.useEffect(
    () => () => {
      if (autoTimer.current) clearInterval(autoTimer.current)
    },
    [],
  )

  const source = SOURCES.find((item) => item.id === sourceId) ?? null
  const target = TARGETS.find((item) => item.id === targetId) ?? null
  const ready = Boolean(source && target)
  const visibleSourceFields = source
    ? source.fields.filter((field) =>
        `${field.path} ${field.type} ${field.sample}`.toLowerCase().includes(sourceQuery.toLowerCase())
      )
    : []
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

  const resetForContext = (nextSourceId: string, nextTargetId: string) => {
    if (autoTimer.current) clearInterval(autoTimer.current)
    setAutoRunning(false)
    setAutoProgress(0)
    setAutoStatus("")
    setSelectedSource(null)
    const nextSource = SOURCES.find((item) => item.id === nextSourceId)
    const nextTarget = TARGETS.find((item) => item.id === nextTargetId)
    if (!nextSource || !nextTarget) {
      setMappings([])
      setRecommendations([])
      setAssistantNote("Select source data and an OCSF destination to begin.")
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

    const sourceName = source.name
    const targetName = target.name
    setRecommendations([])
    setAutoRunning(true)
    setAutoProgress(0)
    setAutoStatus("Scanning source schema…")
    setAssistantNote(`Auto-normalizing ${sourceName} → ${targetName}…`)

    const DURATION = 20000
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
      const progress = Math.min(100, Math.round((elapsed / DURATION) * 100))
      setAutoProgress(progress)
      setAutoStatus(statusFor(progress))
      const revealCount = Math.min(queue.length, Math.floor((progress / 100) * queue.length))
      setRecommendations(queue.slice(0, revealCount))
      if (elapsed >= DURATION) {
        if (autoTimer.current) clearInterval(autoTimer.current)
        autoTimer.current = null
        setRecommendations(queue)
        setAutoProgress(100)
        setAutoRunning(false)
        setAutoStatus("")
        setAssistantNote(
          `Genie found ${queue.length} recommended mappings from the ${sourceName} schema. Review and accept below.`
        )
      }
    }, 300)
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
            <span>Create normalizer</span>
          </div>
          <h1 className={PAGE_TITLE_SEMIBOLD}>Create normalizer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Map a parsed or raw datasource into an OCSF event class.
          </p>
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
              disabled={!normalizerName.trim()}
              onClick={() => {
                toast.success("Normalizer created")
                router.push("/lakewatch/normalizers")
              }}
            >
              Save normalizer
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
                  {SOURCES.filter((item) => item.kind === "parsed").map((item) => (
                    <SelectItem key={item.id} value={item.id} description={item.table}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Raw datasource tables</SelectLabel>
                  {SOURCES.filter((item) => item.kind === "raw").map((item) => (
                    <SelectItem key={item.id} value={item.id} description={item.table}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
          <div className="border-t border-border px-2 py-2">
            {source && visibleSourceFields.length ? (
              <p className="px-2 pb-1 text-hint text-muted-foreground">
                Drag a field onto an OCSF field, or click to select then choose a destination.
              </p>
            ) : null}
            {visibleSourceFields.map((field) => (
              <Button
                key={field.path}
                variant="ghost"
                size="sm"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", field.path)
                  event.dataTransfer.effectAllowed = "copy"
                  setSelectedSource(field.path)
                }}
                onDragEnd={() => setDragOverTarget(null)}
                onClick={() => setSelectedSource(field.path)}
                className={cn(
                  "h-auto w-full cursor-grab justify-start px-2 py-2 text-left font-normal active:cursor-grabbing",
                  selectedSource === field.path && "bg-primary/10 text-primary"
                )}
              >
                <span className="min-w-0 flex-1">
                  <code className="block truncate text-sm">{field.path}</code>
                  <span className="block truncate text-hint text-muted-foreground">{field.sample}</span>
                </span>
                <Badge variant="secondary" className="font-normal">{field.type}</Badge>
              </Button>
            ))}
          </div>
        </StudioColumn>

        <StudioColumn
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          title="OCSF destination"
          subtitle="Category → event class → fields"
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
              onValueChange={(value) => {
                setTargetId(value)
                resetForContext(sourceId, value)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select OCSF event class" />
              </SelectTrigger>
              <SelectContent>
                {TARGETS.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                    description={`${item.category} · class_uid ${item.classUid}`}
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {target ? (
              <>
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
                Select an OCSF event class to view its fields.
              </p>
            )}
            {selectedSource ? (
              <p className="rounded bg-primary/10 p-2 text-hint text-primary">
                Select a destination for <code>{selectedSource}</code>
              </p>
            ) : null}
          </div>
          <div className="border-t border-border px-2 py-2">
            {visibleTargetFields.map((field) => {
              const mapped = mappedTargets.has(field.path)
              const proposed = proposedTargets.has(field.path)
              const isDropTarget = dragOverTarget === field.path
              return (
                <Button
                  key={field.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => mapToTarget(field.path)}
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
                  className={cn(
                    "h-auto w-full justify-start gap-2 px-2 py-2 font-normal",
                    isDropTarget && "bg-primary/10 ring-1 ring-primary ring-inset"
                  )}
                >
                  {mapped ? (
                    <CheckIcon size={16} className="shrink-0 text-[var(--success)]" />
                  ) : proposed ? (
                    <DbIcon icon={SparkleIcon} color="ai" size={16} />
                  ) : (
                    <CircleDashed className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <code className={cn("min-w-0 flex-1 truncate text-left", !mapped && !proposed && "text-muted-foreground")}>
                    {field.path}
                  </code>
                  <RequirementBadge value={field.requirement} />
                </Button>
              )
            })}
          </div>
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
                    : "Select source data and an OCSF destination to ask Genie"
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
                  disabled={!ready}
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
    </div>
  )
}

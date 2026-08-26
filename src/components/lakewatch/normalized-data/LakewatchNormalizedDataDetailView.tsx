"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  Copy,
  FileCode,
  Globe,
  MapPin,
  MoreVertical,
  Server,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import {
  CatalogIcon,
  DatabaseClockIcon,
  DataModelNavIcon,
  DatasourceNavIcon,
  ErdIcon,
  NewWindowIcon,
  PencilIcon,
  PipelineIcon,
  PlusIcon,
  SearchDataIcon,
  ShareIcon,
  TableIcon,
} from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import {
  getDataModel,
  getEnrichments,
  materializationLabel,
  type Enrichment,
  type EnrichmentKind,
  type Materialization,
} from "@/components/lakewatch/data-models/dataModels"
import {
  getOcsfClass,
  NORMALIZER_BLUEPRINTS,
} from "@/components/lakewatch/normalizers/normalizers"
import { buildNormalizationYaml } from "@/components/lakewatch/normalizers/LakewatchCreateNormalizerStudio"
import type { NormalizerBlueprint } from "@/components/lakewatch/normalizers/normalizerModel"
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
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
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

/** Coverage = share of OCSF class fields that the feeder maps. */
function feederCoverage(bp: NormalizerBlueprint): number {
  const targetPaths = bp.target.fields.map((field) => field.path)
  const mapped = new Set(bp.mappings.map((mapping) => mapping.target))
  const covered = targetPaths.filter((path) => mapped.has(path)).length
  return Math.round((covered / targetPaths.length) * 100)
}

const LAST_RUNS = ["30s ago", "1 min ago", "2 min ago", "4 min ago", "6 min ago"]

const ENRICH_KIND: Record<
  EnrichmentKind,
  { badge: React.ComponentProps<typeof Badge>["variant"]; Icon: React.ComponentType<{ className?: string }> }
> = {
  GeoIP: { badge: "teal", Icon: MapPin },
  "Threat intel": { badge: "coral", Icon: ShieldAlert },
  Identity: { badge: "indigo", Icon: UserRound },
  "Asset / CMDB": { badge: "brown", Icon: Server },
  Reputation: { badge: "purple", Icon: BadgeCheck },
  WHOIS: { badge: "turquoise", Icon: Globe },
  "ML model": { badge: "lemon", Icon: Sparkles },
}

function MaterializationIcon({
  materialization,
  className,
}: {
  materialization: Materialization
  className?: string
}) {
  if (materialization === "pipeline") return <PipelineIcon size={16} className={className} />
  if (materialization === "materialized_view")
    return <DatabaseClockIcon size={16} className={className} />
  return <TableIcon size={16} className={className} />
}

// ─── Detail view ────────────────────────────────────────────────────────────

export function LakewatchNormalizedDataDetailView({ modelId }: { modelId: string }) {
  const router = useRouter()
  const model = getDataModel(modelId)

  if (!model) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Data model not found</h1>
        <p className="text-sm text-muted-foreground">No data model matches “{modelId}”.</p>
        <Button variant="link" size="sm" asChild className="w-fit px-0">
          <Link href="/lakewatch/normalized-data">Back to Data models</Link>
        </Button>
      </div>
    )
  }

  const ocsfClass = getOcsfClass(model.id)
  const fields = ocsfClass?.fields ?? []
  const feeders = React.useMemo(
    () => NORMALIZER_BLUEPRINTS.filter((bp) => bp.targetGroupId === model.id),
    [model.id]
  )
  const enrichments = React.useMemo(() => getEnrichments(model.id), [model.id])

  const [description, setDescription] = React.useState(model.description)
  const [descDraft, setDescDraft] = React.useState(model.description)
  const [descOpen, setDescOpen] = React.useState(false)
  const [yamlOpen, setYamlOpen] = React.useState(false)

  const cumulativeYaml = React.useMemo(
    () =>
      feeders
        .map((bp) =>
          buildNormalizationYaml({
            name: bp.name,
            source: bp.source,
            target: bp.target,
            mappings: bp.mappings,
          })
        )
        .join("\n---\n\n"),
    [feeders]
  )

  const facts: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Destination table", value: <code className="text-foreground">{model.table}</code> },
    { label: "Standard", value: `${model.standard} ${model.version}` },
    { label: "Event class", value: `${model.eventClass} · ${model.classUid}` },
    { label: "Category", value: model.category },
    { label: "Materialization", value: materializationLabel(model.materialization) },
    { label: "Created", value: model.createdAt },
    { label: "Last updated", value: model.lastUpdated },
    { label: "Freshness", value: model.freshness },
  ]

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
              <LakewatchDataControls />
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm">
                  <SearchDataIcon size={16} />
                  Query
                </Button>
                <Button variant="default" size="sm">
                  <ShareIcon size={16} />
                  Share
                </Button>
                <Button variant="default" size="sm" onClick={() => setYamlOpen(true)}>
                  <FileCode className="h-4 w-4" />
                  View YAML
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="More actions">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {model.standard} {model.version}
              </Badge>
              <Badge variant="indigo" className="font-normal">
                Class {model.classUid}
              </Badge>
              <Badge
                variant={
                  model.materialization === "pipeline"
                    ? "teal"
                    : model.materialization === "materialized_view"
                      ? "purple"
                      : "secondary"
                }
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
            <Button variant="default" size="sm" asChild>
              <Link href={`/lakewatch/normalized-data/${encodeURIComponent(model.id)}/graph`}>
                <ErdIcon size={16} />
                Graph view
              </Link>
            </Button>
          </div>
        </div>

        {/* Description */}
        <section className="rounded-md border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Description</h2>
            <Popover
              open={descOpen}
              onOpenChange={(open) => {
                setDescOpen(open)
                if (open) setDescDraft(description)
              }}
            >
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon-xs" aria-label="Edit description">
                  <PencilIcon size={16} className="text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nd-desc">Description</Label>
                  <Textarea
                    id="nd-desc"
                    value={descDraft}
                    onChange={(event) => setDescDraft(event.target.value)}
                    className="min-h-24"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="default" size="xs" onClick={() => setDescOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => {
                        setDescription(descDraft)
                        setDescOpen(false)
                        toast.success("Description updated")
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-sm text-foreground">{description}</p>
        </section>

        {/* Compact metadata */}
        <section className="rounded-md border border-border p-4">
          <div className="mb-3 flex items-start gap-2 rounded-md bg-muted/40 p-3">
            <MaterializationIcon
              materialization={model.materialization}
              className="mt-0.5 text-muted-foreground"
            />
            <div className="min-w-0">
              <p className="font-semibold text-foreground">
                {materializationLabel(model.materialization)}
              </p>
              <p className="text-hint text-muted-foreground">{model.refreshDetail}</p>
              {model.pipelineName ? (
                <Link
                  href="/lakewatch"
                  className="mt-1 inline-flex items-center gap-1 text-hint text-primary hover:underline"
                >
                  <code>{model.pipelineName}</code>
                  <NewWindowIcon size={12} />
                </Link>
              ) : null}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-0.5">
                <dt className="text-hint text-muted-foreground">{fact.label}</dt>
                <dd className="min-w-0 truncate text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Records (24h)" value={model.records.replace(" / 24h", "")} />
          <StatTile label="Total rows" value={model.totalRows} />
          <StatTile label="Sources" value={String(feeders.length)} />
          <StatTile label="Fields" value={String(fields.length)} />
          <StatTile label="Field coverage" value={`${model.coverage}%`} />
          <StatTile label="DLQ (24h)" value={model.dlq} />
        </div>

        {/* Sources / Enrichments */}
        <Tabs defaultValue="sources">
          <TabsList variant="line">
            <TabsTrigger value="sources">Sources ({feeders.length})</TabsTrigger>
            <TabsTrigger value="enrichments">Enrichments ({enrichments.length})</TabsTrigger>
          </TabsList>

          {/* Sources */}
          <TabsContent value="sources" className="mt-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <p className="max-w-3xl text-sm text-muted-foreground">
                Each source maps a datasource parser destination table or an existing Unity Catalog
                table into this data model. Open a row to edit its mapping.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="shrink-0"
                onClick={() =>
                  router.push(
                    `/lakewatch/normalizers/new?dest=model:${encodeURIComponent(model.id)}`
                  )
                }
              >
                <PlusIcon size={16} />
                Add source
              </Button>
            </div>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table className="min-w-[880px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[24%] font-semibold">Source</TableHead>
                    <TableHead className="w-[10%] font-semibold">Kind</TableHead>
                    <TableHead className="w-[26%] font-semibold">Destination table</TableHead>
                    <TableHead className="w-[16%] font-semibold">Mapping coverage</TableHead>
                    <TableHead className="w-[11%] font-semibold">Records</TableHead>
                    <TableHead className="w-[9%] font-semibold">Last run</TableHead>
                    <TableHead className="w-[10%] font-semibold" aria-label="Actions" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeders.map((bp) => (
                    <SourceRow
                      key={bp.identifier}
                      bp={bp}
                      modelId={model.id}
                      onOpen={() =>
                        router.push(`/lakewatch/normalizers/${encodeURIComponent(bp.identifier)}`)
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Enrichments */}
          <TabsContent value="enrichments" className="mt-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <p className="max-w-3xl text-sm text-muted-foreground">
                Enrichments add context from reference feeds — geolocation, threat intel, identity,
                asset, and ML scoring — populating extra OCSF fields as the model refreshes.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="shrink-0"
                onClick={() => toast("Enrichment builder is coming soon")}
              >
                <PlusIcon size={16} />
                Add enrichment
              </Button>
            </div>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table className="min-w-[880px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[22%] font-semibold">Enrichment</TableHead>
                    <TableHead className="w-[13%] font-semibold">Type</TableHead>
                    <TableHead className="w-[24%] font-semibold">Reference</TableHead>
                    <TableHead className="w-[22%] font-semibold">Enriched fields</TableHead>
                    <TableHead className="w-[9%] font-semibold">Match rate</TableHead>
                    <TableHead className="w-[10%] font-semibold">Records</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichments.map((enrichment) => (
                    <EnrichmentRow key={enrichment.id} enrichment={enrichment} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cumulative YAML dialog */}
      <Dialog open={yamlOpen} onOpenChange={setYamlOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Normalization spec — {model.name}</DialogTitle>
          </DialogHeader>
          <DialogBody className="gap-3">
            <div className="flex items-center justify-between">
              <p className="text-hint text-muted-foreground">
                Cumulative spec compiled from {feeders.length} source
                {feeders.length === 1 ? "" : "s"} feeding this data model.
              </p>
              <Button
                variant="default"
                size="xs"
                onClick={() => {
                  navigator.clipboard?.writeText(cumulativeYaml)
                  toast.success("YAML copied")
                }}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <pre className="max-h-[60vh] overflow-auto rounded-md border border-border bg-muted/40 p-3 text-hint leading-relaxed text-foreground">
              <code>{cumulativeYaml}</code>
            </pre>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SourceRow({
  bp,
  modelId,
  onOpen,
}: {
  bp: NormalizerBlueprint
  modelId: string
  onOpen: () => void
}) {
  const coverage = feederCoverage(bp)
  const isParser = bp.source.kind === "parsed"
  const lastRun = LAST_RUNS[hashString(bp.identifier) % LAST_RUNS.length]

  return (
    <TableRow
      onClick={onOpen}
      className="cursor-pointer"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen()
        }
      }}
    >
      <TableCell className="py-3">
        <div className="flex min-w-0 items-center gap-2">
          {isParser ? (
            <DatasourceNavIcon size={16} className="shrink-0 text-muted-foreground" />
          ) : (
            <CatalogIcon size={16} className="shrink-0 text-muted-foreground" />
          )}
          <span className="min-w-0 truncate font-semibold text-foreground">{bp.sourceParser}</span>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <Badge variant={isParser ? "teal" : "secondary"} className="font-normal">
          {isParser ? "Parser" : "UC table"}
        </Badge>
      </TableCell>
      <TableCell className="py-3">
        <code className="truncate text-hint text-foreground">{bp.source.table}</code>
      </TableCell>
      <TableCell className="py-3">
        <span className="flex items-center gap-2">
          <Progress value={coverage} className="h-1.5 w-20" />
          <span className="text-hint text-foreground">{coverage}%</span>
        </span>
      </TableCell>
      <TableCell className="py-3 text-foreground">{bp.source.records.replace(" / 24h", "")}</TableCell>
      <TableCell className="py-3 text-foreground">{lastRun}</TableCell>
      <TableCell className="py-3 text-right">
        <Button
          variant="default"
          size="xs"
          asChild
          onClick={(event) => event.stopPropagation()}
        >
          <Link
            href={`/lakewatch/normalized-data/${encodeURIComponent(modelId)}/sources/${encodeURIComponent(bp.identifier)}/data`}
          >
            <TableIcon size={16} />
            View data
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}

function EnrichmentRow({ enrichment }: { enrichment: Enrichment }) {
  const meta = ENRICH_KIND[enrichment.kind]
  const Icon = meta.Icon
  return (
    <TableRow>
      <TableCell className="py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 truncate font-semibold text-foreground">{enrichment.name}</span>
          {enrichment.status === "Draft" ? (
            <Badge variant="secondary" className="shrink-0 font-normal">
              Draft
            </Badge>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="py-3">
        <Badge variant={meta.badge} className="font-normal">
          {enrichment.kind}
        </Badge>
      </TableCell>
      <TableCell className="py-3">
        <code className="truncate text-hint text-foreground">{enrichment.reference}</code>
      </TableCell>
      <TableCell className="py-3">
        <code className="truncate text-hint text-muted-foreground">{enrichment.enrichedFields}</code>
      </TableCell>
      <TableCell className="py-3">
        <span className="flex items-center gap-2">
          <Progress value={enrichment.matchRate} className="h-1.5 w-16" />
          <span className="text-hint text-foreground">{enrichment.matchRate}%</span>
        </span>
      </TableCell>
      <TableCell className="py-3 text-foreground">
        {enrichment.records.replace(" / 24h", "")}
      </TableCell>
    </TableRow>
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

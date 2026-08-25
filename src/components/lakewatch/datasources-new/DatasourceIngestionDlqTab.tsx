"use client"

import * as React from "react"
import { toast } from "sonner"
import { Info, Lock, RotateCcw } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Empty } from "@/components/ui/empty"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getIngestionDlq,
  ingestionDlqDefaults,
  REDRIVE_REASON_LABEL,
  STAGE_META,
  type DlqRecordGroup,
  type DlqStage,
} from "@/components/lakewatch/datasources-new/ingestionDlq"
import { cn } from "@/lib/utils"

type StageBadgeVariant = "charcoal" | "coral" | "brown" | "indigo"

const STAGE_BADGE: Record<DlqStage, StageBadgeVariant> = {
  unwrap: "charcoal",
  parser_match: "coral",
  field_validation: "brown",
  output_write: "indigo",
}

const SHORT_REASON: Record<string, string> = {
  retention_expired: "Expired",
  unsupported_stage: "Not supported",
  no_fix_saved: "Needs fix",
  permission: "No access",
}

function StageBadge({ stage }: { stage: DlqStage }) {
  return <Badge variant={STAGE_BADGE[stage]}>{STAGE_META[stage].label}</Badge>
}

/**
 * Read-only ingestion-DLQ summary for the datasource authoring / final-review
 * step. Lakewatch supplies the destination + retention (managed defaults); the
 * author reviews them. Never renders credentials or internal storage paths.
 */
export function IngestionDlqAuthoringSummary({
  datasourceName,
  catalog,
  rawOnly = false,
  className,
}: {
  datasourceName: string
  catalog?: string
  rawOnly?: boolean
  className?: string
}) {
  const defaults = ingestionDlqDefaults(datasourceName, { catalog, rawOnly })
  return (
    <div className={cn("rounded-md border border-border bg-secondary/40 p-4", className)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">Ingestion DLQ</span>
        <Badge variant="secondary" className="font-normal">
          Managed by Lakewatch
        </Badge>
      </div>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
        <ConfigItem label="Destination" value={defaults.destination} mono />
        <ConfigItem label="Retention" value={`${defaults.retentionDays} days`} />
        <ConfigItem
          label="Stages covered"
          value={defaults.stages.map((stage) => STAGE_META[stage].label).join(" · ")}
        />
      </div>
      <p className="mt-3 text-hint text-muted-foreground">
        Records that fail an ingestion stage are routed here for review and redrive. Destination and
        retention are supplied by Lakewatch and validated against the datasource&apos;s runtime
        identity.
      </p>
    </div>
  )
}

const ALL_STAGES: DlqStage[] = ["unwrap", "parser_match", "field_validation", "output_write"]

function isStage(value: string | undefined): value is DlqStage {
  return Boolean(value) && ALL_STAGES.includes(value as DlqStage)
}

export function DatasourceIngestionDlqTab({
  datasourceName,
  parsers = [],
  initialStage,
}: {
  datasourceName: string
  parsers?: { name: string; version: string }[]
  initialStage?: string
}) {
  const data = React.useMemo(
    () => getIngestionDlq(datasourceName, parsers),
    [datasourceName, parsers]
  )
  const { config, records, summary, rawOnly } = data

  const [stageFilter, setStageFilter] = React.useState<DlqStage | "all">(
    isStage(initialStage) && config.stages.includes(initialStage) ? initialStage : "all"
  )
  const [openRecord, setOpenRecord] = React.useState<DlqRecordGroup | null>(null)
  const [redriveScope, setRedriveScope] = React.useState<DlqRecordGroup | "all" | null>(null)

  const currentPins = parsers
  const hasExpired = records.some(
    (record) => !record.eligibility.redrivable && record.eligibility.reason === "retention_expired"
  )

  const visibleRecords =
    stageFilter === "all" ? records : records.filter((record) => record.stage === stageFilter)

  const redriveGroup = (group: DlqRecordGroup | "all") => setRedriveScope(group)

  const confirmRedrive = () => {
    const scope = redriveScope
    setRedriveScope(null)
    setOpenRecord(null)
    if (scope === "all") {
      toast.success(`Redrive started for ${summary.redrivable} records`)
    } else if (scope) {
      toast.success(`Redrive started for ${scope.count} records`)
    }
  }

  if (records.length === 0) {
    return (
      <div className="py-10">
        <Empty
          title="No quarantined records"
          description="Records that fail an ingestion stage will be routed here for review and redrive."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Summary strip */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
          <SummaryStat label="Quarantined (last 14d)" value={summary.total.toLocaleString()} />
          <SummaryStat label="Redrive-eligible" value={summary.redrivable.toLocaleString()} />
          <SummaryStat label="Oldest" value={summary.oldest} muted />
          <SummaryStat label="Newest" value={summary.newest} muted />
        </div>
        <div className="flex items-center gap-2">
          {summary.redrivable > 0 ? (
            <Button variant="primary" size="sm" onClick={() => redriveGroup("all")}>
              <RotateCcw className="h-4 w-4" />
              Redrive eligible
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant="primary" size="sm" disabled>
                    <RotateCcw className="h-4 w-4" />
                    Redrive eligible
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>No records are currently eligible for redrive.</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Config summary — Lakewatch-managed, review only */}
      <div className="rounded-md border border-border bg-secondary/40 p-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <ConfigItem label="Destination" value={config.destination} mono />
          <ConfigItem label="Retention" value={`${config.retentionDays} days`} />
          <ConfigItem
            label="Stages covered"
            value={config.stages.map((stage) => STAGE_META[stage].label).join(" · ")}
          />
          <div className="ml-auto flex items-center gap-1.5 text-hint text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Managed by Lakewatch · read-only
          </div>
        </div>
      </div>

      {hasExpired ? (
        <Alert variant="warning">
          <Info className="h-4 w-4" />
          <AlertTitle>Some records have passed retention</AlertTitle>
          <AlertDescription>
            Records older than {config.retentionDays} days have expired and can no longer be
            redriven. Recover them with a historical backfill instead.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Stage funnel */}
      <div className="flex flex-wrap gap-2">
        <StageTile
          label="All stages"
          count={summary.total}
          active={stageFilter === "all"}
          onClick={() => setStageFilter("all")}
        />
        {config.stages.map((stage) => (
          <StageTile
            key={stage}
            label={STAGE_META[stage].label}
            count={summary.byStage[stage]}
            active={stageFilter === stage}
            onClick={() => setStageFilter(stage)}
          />
        ))}
      </div>

      {/* Records table */}
      <div className="overflow-hidden rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[13%]">Stage</TableHead>
              <TableHead className="w-[26%]">Error</TableHead>
              <TableHead className="w-[15%]">Logical event</TableHead>
              <TableHead className="w-[16%]">Parser versions</TableHead>
              <TableHead className="w-[7%] text-right">Count</TableHead>
              <TableHead className="w-[12%]">Last seen</TableHead>
              <TableHead className="w-[11%] text-right">Redrive</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRecords.map((record) => (
              <TableRow
                key={record.id}
                className="cursor-pointer"
                onClick={() => setOpenRecord(record)}
              >
                <TableCell>
                  <StageBadge stage={record.stage} />
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-foreground">{record.error.code}</div>
                  <div className="truncate text-hint text-muted-foreground" title={record.error.message}>
                    {record.error.message}
                  </div>
                </TableCell>
                <TableCell className="text-foreground">
                  {record.logicalEvent ? (
                    <code className="text-xs">{record.logicalEvent}</code>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {record.parserVersionsEvaluated?.length
                    ? record.parserVersionsEvaluated
                        .map((pin) => `${pin.name} ${pin.version}`)
                        .join(", ")
                    : "—"}
                </TableCell>
                <TableCell className="text-right text-foreground">
                  {record.count.toLocaleString()}
                </TableCell>
                <TableCell className="text-foreground">{record.lastSeen}</TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  {record.eligibility.redrivable ? (
                    <Button
                      variant="default"
                      size="xs"
                      onClick={() => redriveGroup(record)}
                    >
                      Redrive
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-hint text-muted-foreground">
                          {SHORT_REASON[record.eligibility.reason]}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {REDRIVE_REASON_LABEL[record.eligibility.reason]}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Record detail drawer */}
      <Sheet open={Boolean(openRecord)} onOpenChange={(open) => !open && setOpenRecord(null)}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
          {openRecord ? (
            <RecordDetail
              record={openRecord}
              currentPins={currentPins}
              rawOnly={rawOnly}
              retentionDays={config.retentionDays}
              onRedrive={() => redriveGroup(openRecord)}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Redrive confirmation */}
      <Dialog open={Boolean(redriveScope)} onOpenChange={(open) => !open && setRedriveScope(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-1.5">
            <DialogTitle>Redrive records</DialogTitle>
            <DialogDescription>
              Replays quarantined records through the currently pinned parser versions. This is not
              a historical backfill.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="gap-3">
            <div className="rounded-md border border-border p-3 text-sm">
              <Row label="Records">
                {redriveScope === "all"
                  ? `${summary.redrivable.toLocaleString()} eligible`
                  : redriveScope
                    ? `${redriveScope.count.toLocaleString()} · ${redriveScope.error.code}`
                    : "—"}
              </Row>
              <Row label="Destination">
                <code className="text-xs">{config.destination}</code>
              </Row>
              <Row label="Runs against">
                {currentPins.length
                  ? currentPins.map((pin) => `${pin.name} ${pin.version}`).join(", ")
                  : "Raw ingestion (no parser)"}
              </Row>
            </div>
            <p className="text-hint text-muted-foreground">
              Pinned parser versions are never changed by redrive. Records that fail again are
              returned to the DLQ as new entries. Partial failures are reported per record.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="default" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button variant="primary" size="sm" onClick={confirmRedrive}>
              <RotateCcw className="h-4 w-4" />
              Start redrive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SummaryStat({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-hint text-muted-foreground">{label}</span>
      <span className={cn("text-lg font-semibold", muted ? "text-sm text-foreground" : "text-foreground")}>
        {value}
      </span>
    </div>
  )
}

function ConfigItem({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-hint text-muted-foreground">{label}</span>
      {mono ? (
        <code className="text-xs text-foreground">{value}</code>
      ) : (
        <span className="text-sm text-foreground">{value}</span>
      )}
    </div>
  )
}

function StageTile({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-[140px] flex-1 flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted/40"
      )}
    >
      <span
        className={cn(
          "text-hint",
          active ? "font-semibold text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
      <span className="text-lg font-semibold text-foreground">{count.toLocaleString()}</span>
    </button>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="shrink-0 text-hint text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right text-foreground">{children}</span>
    </div>
  )
}

function RecordDetail({
  record,
  currentPins,
  rawOnly,
  retentionDays,
  onRedrive,
}: {
  record: DlqRecordGroup
  currentPins: { name: string; version: string }[]
  rawOnly: boolean
  retentionDays: number
  onRedrive: () => void
}) {
  const evaluated = record.parserVersionsEvaluated ?? []
  const pinByName = new Map(currentPins.map((pin) => [pin.name, pin.version]))
  const versionChanged = evaluated.some((pin) => pinByName.get(pin.name) !== pin.version)

  return (
    <>
      <SheetHeader className="gap-2 border-b border-border">
        <div className="flex items-center gap-2">
          <StageBadge stage={record.stage} />
          <span className="text-hint text-muted-foreground">{record.count.toLocaleString()} records</span>
        </div>
        <SheetTitle className="text-base">{record.error.code}</SheetTitle>
        <SheetDescription>{record.error.message}</SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-5 p-4">
        <section className="flex flex-col gap-1">
          <Row label="Stage">{STAGE_META[record.stage].label}</Row>
          <Row label="First seen">{record.firstSeen}</Row>
          <Row label="Last seen">{record.lastSeen}</Row>
          <Row label="Destination">
            <code className="text-xs">{record.destination}</code>
          </Row>
        </section>

        {record.logicalEvent || record.decodedRecordRef ? (
          <section className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-foreground">Originating record</h4>
            {record.logicalEvent ? (
              <Row label="Logical event">
                <code className="text-xs">{record.logicalEvent}</code>
              </Row>
            ) : null}
            {record.decodedRecordRef ? (
              <Row label="Decoded record">
                <code className="text-xs">{record.decodedRecordRef}</code>
              </Row>
            ) : null}
          </section>
        ) : null}

        {!rawOnly && evaluated.length ? (
          <section className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-foreground">Parser versions</h4>
            <div className="rounded-md border border-border">
              <div className="flex items-center justify-between border-b border-border px-3 py-2 text-hint text-muted-foreground">
                <span>Evaluated at failure</span>
                <span>Currently pinned</span>
              </div>
              {evaluated.map((pin) => {
                const current = pinByName.get(pin.name) ?? "—"
                const changed = current !== pin.version
                return (
                  <div
                    key={pin.name}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">
                      {pin.name} <span className="text-muted-foreground">{pin.version}</span>
                    </span>
                    <span className={cn(changed ? "font-semibold text-primary" : "text-foreground")}>
                      {current}
                    </span>
                  </div>
                )
              })}
            </div>
            {versionChanged ? (
              <p className="text-hint text-muted-foreground">
                A newer parser version is pinned than the one evaluated. Redrive will replay these
                records against the current pins — the pin itself is never changed here.
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-foreground">Recovery</h4>
          {record.eligibility.redrivable ? (
            <Button variant="primary" size="sm" onClick={onRedrive}>
              <RotateCcw className="h-4 w-4" />
              Redrive {record.count.toLocaleString()} records
            </Button>
          ) : (
            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {REDRIVE_REASON_LABEL[record.eligibility.reason]}
                {record.eligibility.reason === "retention_expired"
                  ? ` Records outside the ${retentionDays}-day window must be recovered with a historical backfill.`
                  : ""}
              </AlertDescription>
            </Alert>
          )}
        </section>
      </div>
    </>
  )
}

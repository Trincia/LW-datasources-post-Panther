"use client"

import * as React from "react"
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import { CatalogIcon, DetectionNavIcon, SchemaIcon, SearchIcon } from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DETECTION_RULES,
  type DetectionRule,
  type DetectionSeverity,
} from "@/components/lakewatch/marketplace/detectionRules"
import { cn } from "@/lib/utils"

const SEVERITY_BADGE: Record<
  DetectionSeverity,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  Critical: "destructive",
  High: "pink",
  Medium: "lemon",
  Low: "secondary",
  Informational: "teal",
}

const DISABLED_TABS: { value: string; label: string; tooltip: string }[] = [
  { value: "packs", label: "Packs", tooltip: "Packs are no longer available at this time" },
  {
    value: "datasource-presets",
    label: "Datasource presets",
    tooltip: "Datasource presets are no longer available at this time",
  },
  {
    value: "notebooks",
    label: "Notebooks",
    tooltip: "Notebooks are no longer available at this time",
  },
]

function DisabledTab({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-not-allowed">
          <TabsTrigger value={label} disabled className="pointer-events-none">
            {label}
          </TabsTrigger>
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export function LakewatchMarketplaceView() {
  const [query, setQuery] = React.useState("")
  const [importTarget, setImportTarget] = React.useState<{
    rule: DetectionRule
    available: boolean
  } | null>(null)

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return DETECTION_RULES
    return DETECTION_RULES.filter((rule) =>
      `${rule.name} ${rule.parser} ${rule.tactic} ${rule.technique} ${rule.techniqueId} ${rule.pack}`
        .toLowerCase()
        .includes(q)
    )
  }, [query])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-4">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Marketplace</h1>
        <div className="shrink-0">
          <LakewatchDataControls />
        </div>
      </div>

      <Tabs defaultValue="detection-rules" className="mt-5 flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-4">
          <TabsList variant="line">
            <TabsTrigger value="detection-rules">Detection rules</TabsTrigger>
            {DISABLED_TABS.map((tab) => (
              <DisabledTab key={tab.value} label={tab.label} tooltip={tab.tooltip} />
            ))}
          </TabsList>

          <div className="relative w-[280px] shrink-0">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search detection rules"
              aria-label="Search detection rules"
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="detection-rules" className="mt-4 min-h-0 flex-1">
          <div className="min-h-0 overflow-x-auto">
            <Table className="min-w-[1180px] table-fixed">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[24%]">Name</TableHead>
                  <TableHead className="w-[11%]">Associated parser</TableHead>
                  <TableHead className="w-[9%]">Severity</TableHead>
                  <TableHead className="w-[13%]">MITRE tactic</TableHead>
                  <TableHead className="w-[15%]">MITRE technique</TableHead>
                  <TableHead className="w-[8%]">Technique ID</TableHead>
                  <TableHead className="w-[14%]">Content pack</TableHead>
                  <TableHead className="w-[6%] text-right">{""}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((rule, index) => (
                  <DetectionRuleRow
                    key={rule.name}
                    rule={rule}
                    onImport={() =>
                      setImportTarget({ rule, available: index % 2 === 0 })
                    }
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={Boolean(importTarget)}
        onOpenChange={(open) => !open && setImportTarget(null)}
      >
        <DialogContent className="sm:max-w-xl">
          {importTarget ? (
            <ImportDialogBody
              rule={importTarget.rule}
              available={importTarget.available}
              onDone={() => setImportTarget(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

type DetectionStatus = "detecting" | "available" | "unavailable"

function ImportDialogBody({
  rule,
  available,
  onDone,
}: {
  rule: DetectionRule
  available: boolean
  onDone: () => void
}) {
  const [catalog, setCatalog] = React.useState("sec_dev")
  const [schema, setSchema] = React.useState("detection_rules")
  const [name, setName] = React.useState(rule.name)
  const [status, setStatus] = React.useState<DetectionStatus>("detecting")

  React.useEffect(() => {
    setStatus("detecting")
    const timer = window.setTimeout(() => {
      setStatus(available ? "available" : "unavailable")
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [rule, available])

  const blocked = status === "unavailable"
  const canImport =
    status === "available" && catalog.trim() && schema.trim() && name.trim()

  return (
    <>
      <DialogHeader className="gap-3">
        <DialogTitle>Import</DialogTitle>
        <DetectionStatusRow status={status} parser={rule.parser} />
        <DialogDescription>
          The following resources will be added to your team content in Lakewatch. If you already
          have a resource with the same name, the new content will be automatically renamed. You can
          change resource names later.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="gap-2">
        <Label className={cn(blocked && "opacity-40")}>Resource</Label>
        <div
          className={cn(
            "flex items-center gap-1 rounded-md border border-border px-2 py-1.5",
            blocked && "pointer-events-none opacity-40"
          )}
        >
          <PathSelect
            icon={<CatalogIcon size={16} className="shrink-0 text-muted-foreground" />}
            value={catalog}
            onChange={setCatalog}
            options={CATALOG_OPTIONS}
            ariaLabel="Catalog"
            className="w-[26%]"
            disabled={blocked}
          />
          <span className="text-muted-foreground">.</span>
          <PathSelect
            icon={<SchemaIcon size={16} className="shrink-0 text-muted-foreground" />}
            value={schema}
            onChange={setSchema}
            options={SCHEMA_OPTIONS}
            ariaLabel="Schema"
            className="w-[30%]"
            disabled={blocked}
          />
          <span className="text-muted-foreground">.</span>
          <PathSegment
            icon={<DetectionNavIcon size={16} className="shrink-0 text-muted-foreground" />}
            value={name}
            onChange={setName}
            ariaLabel="Resource name"
            className="min-w-0 flex-1"
            disabled={blocked}
          />
        </div>
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
          disabled={!canImport}
          onClick={() => {
            toast.success(`Imported ${catalog}.${schema}.${name}`)
            onDone()
          }}
        >
          Import
        </Button>
      </DialogFooter>
    </>
  )
}

function DetectionStatusRow({
  status,
  parser,
}: {
  status: DetectionStatus
  parser: string
}) {
  if (status === "unavailable") {
    return (
      <Alert variant="warning">
        <TriangleAlert />
        <AlertDescription>
          Your workspace doesn&apos;t have a datasource with the required parser{" "}
          <span className="font-semibold">{parser}</span> to use this detection rule and can&apos;t
          import it at this time.
        </AlertDescription>
      </Alert>
    )
  }

  if (status === "available") {
    return (
      <div className="flex items-center gap-2 text-sm text-foreground">
        <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
        <span>
          Required datasource parser <span className="font-semibold">{parser}</span> is available.
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Detecting datasources with required parser…</span>
    </div>
  )
}

const CATALOG_OPTIONS = ["sec_dev", "sec_prod", "main"]
const SCHEMA_OPTIONS = ["detection_rules", "default", "security_content"]

function PathSegment({
  icon,
  value,
  onChange,
  ariaLabel,
  className,
  disabled,
}: {
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  className?: string
  disabled?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {icon}
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        disabled={disabled}
        className="h-7 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
      />
    </div>
  )
}

function PathSelect({
  icon,
  value,
  onChange,
  options,
  ariaLabel,
  className,
  disabled,
}: {
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  options: string[]
  ariaLabel: string
  className?: string
  disabled?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {icon}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          aria-label={ariaLabel}
          className="h-7 w-full min-w-0 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function DetectionRuleRow({ rule, onImport }: { rule: DetectionRule; onImport: () => void }) {
  return (
    <TableRow className="h-12">
      <TableCell>
        <span className="block truncate text-sm font-semibold text-foreground" title={rule.name}>
          {rule.name}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant="charcoal" className="rounded-full px-2 font-normal dark:bg-grey-400">
          {rule.parser}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={SEVERITY_BADGE[rule.severity]}>{rule.severity}</Badge>
      </TableCell>
      <TableCell className="text-foreground">{rule.tactic || "—"}</TableCell>
      <TableCell className="text-foreground">
        <span className="block truncate" title={rule.technique}>
          {rule.technique || "—"}
        </span>
      </TableCell>
      <TableCell className="text-foreground">{rule.techniqueId || "—"}</TableCell>
      <TableCell className="text-muted-foreground">
        <span className="block truncate" title={rule.pack}>
          {rule.pack}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="default" size="xs" onClick={onImport}>
          Import
        </Button>
      </TableCell>
    </TableRow>
  )
}

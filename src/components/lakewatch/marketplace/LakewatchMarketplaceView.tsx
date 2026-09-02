"use client"

import * as React from "react"
import { toast } from "sonner"
import { ChevronDown, X } from "lucide-react"

import { CatalogIcon, DetectionNavIcon, SchemaIcon, SearchIcon } from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
  connectedDatasources,
  DETECTION_RULES,
  getRuleDetail,
  type DetectionRule,
  type DetectionSeverity,
} from "@/components/lakewatch/marketplace/detectionRules"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

// --- Detection rules facet options (derived once from the catalog) ----------
const SEVERITY_ORDER: DetectionSeverity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
  "Informational",
]

function distinctSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

const FACET_SEVERITIES = SEVERITY_ORDER.filter((s) =>
  DETECTION_RULES.some((rule) => rule.severity === s)
)
const FACET_PARSERS = distinctSorted(DETECTION_RULES.map((rule) => rule.parser))
const FACET_DATASOURCES = distinctSorted(
  DETECTION_RULES.flatMap((rule) => connectedDatasources(rule))
)
const FACET_TACTICS = distinctSorted(DETECTION_RULES.map((rule) => rule.tactic))
const FACET_TECHNIQUES = distinctSorted(DETECTION_RULES.map((rule) => rule.technique))
const FACET_TECHNIQUE_IDS = distinctSorted(DETECTION_RULES.map((rule) => rule.techniqueId))

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

function FacetFilter({
  label,
  options,
  selected,
  onChange,
  searchable = false,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
  searchable?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState("")
  const count = selected.length
  const active = count > 0

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return options
    return options.filter((option) => option.toLowerCase().includes(needle))
  }, [q, options])

  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          aria-expanded={open}
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "cursor-pointer gap-1.5",
            active && "border-primary text-primary"
          )}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              setOpen((prev) => !prev)
            }
          }}
        >
          <span>{label}</span>
          {active ? (
            <>
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                {count}
              </span>
              <button
                type="button"
                aria-label={`Clear ${label} filter`}
                className="inline-flex items-center rounded-sm text-muted-foreground hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation()
                  onChange([])
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : null}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        {searchable ? (
          <div className="border-b border-border p-2">
            <div className="relative">
              <SearchIcon
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Search"
                aria-label={`Search ${label}`}
                className="h-8 pl-8"
              />
            </div>
          </div>
        ) : null}
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">No matches</p>
          ) : (
            filtered.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => toggle(option)}
                />
                <span
                  className="min-w-0 flex-1 truncate text-sm text-foreground"
                  title={option}
                >
                  {option}
                </span>
              </label>
            ))
          )}
        </div>
        {active ? (
          <div className="border-t border-border p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start text-muted-foreground"
              onClick={() => onChange([])}
            >
              Clear
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export function LakewatchMarketplaceView() {
  const [query, setQuery] = React.useState("")
  const [importRule, setImportRule] = React.useState<DetectionRule | null>(null)
  const [detailRule, setDetailRule] = React.useState<DetectionRule | null>(null)

  const [severities, setSeverities] = React.useState<string[]>([])
  const [parsers, setParsers] = React.useState<string[]>([])
  const [datasources, setDatasources] = React.useState<string[]>([])
  const [tactics, setTactics] = React.useState<string[]>([])
  const [techniques, setTechniques] = React.useState<string[]>([])
  const [techniqueIds, setTechniqueIds] = React.useState<string[]>([])

  const activeCount =
    severities.length +
    parsers.length +
    datasources.length +
    tactics.length +
    techniques.length +
    techniqueIds.length

  const clearAll = React.useCallback(() => {
    setSeverities([])
    setParsers([])
    setDatasources([])
    setTactics([])
    setTechniques([])
    setTechniqueIds([])
  }, [])

  // Toggle a value in/out of a facet — powers the click-to-filter row badges.
  const toggleValue = React.useCallback(
    (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
      if (!value) return
      setter((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      )
    },
    []
  )

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return DETECTION_RULES.filter((rule) => {
      if (
        q &&
        !`${rule.name} ${rule.parser} ${rule.tactic} ${rule.technique} ${rule.techniqueId} ${rule.pack}`
          .toLowerCase()
          .includes(q)
      ) {
        return false
      }
      if (severities.length && !severities.includes(rule.severity)) return false
      if (parsers.length && !parsers.includes(rule.parser)) return false
      if (tactics.length && !tactics.includes(rule.tactic)) return false
      if (techniques.length && !techniques.includes(rule.technique)) return false
      if (techniqueIds.length && !techniqueIds.includes(rule.techniqueId)) return false
      if (datasources.length) {
        const ds = connectedDatasources(rule)
        if (!ds.some((d) => datasources.includes(d))) return false
      }
      return true
    })
  }, [query, severities, parsers, datasources, tactics, techniques, techniqueIds])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-4">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Marketplace</h1>
        <div className="shrink-0">
          <LakewatchDataControls />
        </div>
      </div>

      <Tabs defaultValue="detection-rules" className="mt-5 flex min-h-0 flex-1 flex-col">
        <TabsList variant="line">
          <TabsTrigger value="detection-rules">Detection rules</TabsTrigger>
          {DISABLED_TABS.map((tab) => (
            <DisabledTab key={tab.value} label={tab.label} tooltip={tab.tooltip} />
          ))}
        </TabsList>

        <TabsContent value="detection-rules" className="mt-4 min-h-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
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
            <FacetFilter
              label="Severity"
              options={FACET_SEVERITIES}
              selected={severities}
              onChange={setSeverities}
            />
            <FacetFilter
              label="Parser"
              options={FACET_PARSERS}
              selected={parsers}
              onChange={setParsers}
              searchable
            />
            <FacetFilter
              label="Datasource"
              options={FACET_DATASOURCES}
              selected={datasources}
              onChange={setDatasources}
              searchable
            />
            <FacetFilter
              label="MITRE tactic"
              options={FACET_TACTICS}
              selected={tactics}
              onChange={setTactics}
              searchable
            />
            <FacetFilter
              label="MITRE technique"
              options={FACET_TECHNIQUES}
              selected={techniques}
              onChange={setTechniques}
              searchable
            />
            <FacetFilter
              label="Technique ID"
              options={FACET_TECHNIQUE_IDS}
              selected={techniqueIds}
              onChange={setTechniqueIds}
              searchable
            />
            <span className="ml-1 text-sm text-muted-foreground">
              {rows.length} {rows.length === 1 ? "result" : "results"}
            </span>
            {activeCount > 0 ? (
              <Button
                variant="link"
                size="sm"
                className="ml-auto h-8 px-2"
                onClick={clearAll}
              >
                Clear all
              </Button>
            ) : null}
          </div>
          <div className="min-h-0 overflow-x-auto">
            <Table className="min-w-[1320px] table-fixed">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[20%]">Name</TableHead>
                  <TableHead className="w-[11%]">Associated parser</TableHead>
                  <TableHead className="w-[13%]">Connected datasource</TableHead>
                  <TableHead className="w-[8%]">Severity</TableHead>
                  <TableHead className="w-[11%]">MITRE tactic</TableHead>
                  <TableHead className="w-[13%]">MITRE technique</TableHead>
                  <TableHead className="w-[7%]">Technique ID</TableHead>
                  <TableHead className="w-[11%]">Content pack</TableHead>
                  <TableHead className="w-[6%] text-right">{""}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((rule) => (
                  <DetectionRuleRow
                    key={rule.name}
                    rule={rule}
                    onImport={() => setImportRule(rule)}
                    onOpen={() => setDetailRule(rule)}
                    onToggleSeverity={(value) => toggleValue(setSeverities, value)}
                    onToggleParser={(value) => toggleValue(setParsers, value)}
                    onToggleTechniqueId={(value) => toggleValue(setTechniqueIds, value)}
                    activeSeverity={severities.includes(rule.severity)}
                    activeParser={parsers.includes(rule.parser)}
                    activeTechniqueId={techniqueIds.includes(rule.techniqueId)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(importRule)} onOpenChange={(open) => !open && setImportRule(null)}>
        <DialogContent className="sm:max-w-xl">
          {importRule ? (
            <ImportDialogBody rule={importRule} onDone={() => setImportRule(null)} />
          ) : null}
        </DialogContent>
      </Dialog>

      <Sheet open={Boolean(detailRule)} onOpenChange={(open) => !open && setDetailRule(null)}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-[600px]">
          {detailRule ? (
            <DetectionRuleDetailPanel
              rule={detailRule}
              onImport={() => setImportRule(detailRule)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DetectionRuleDetailPanel({
  rule,
  onImport,
}: {
  rule: DetectionRule
  onImport: () => void
}) {
  const detail = getRuleDetail(rule)
  const datasources = connectedDatasources(rule)
  const canImport = datasources.length > 0
  const mitre = rule.tactic && rule.technique ? `${rule.tactic} / ${rule.technique}` : null

  return (
    <>
      <SheetHeader className="flex-row items-center gap-2 border-b px-4 py-3">
        <SheetTitle className="min-w-0 flex-1 truncate">{rule.name}</SheetTitle>
        {canImport ? (
          <Button variant="primary" size="xs" className="mr-6" onClick={onImport}>
            Import
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="mr-6 inline-flex cursor-not-allowed">
                <Button variant="primary" size="xs" disabled className="pointer-events-none">
                  Import
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Can&apos;t import — no datasource with the {rule.parser} parser is connected to this
              workspace.
            </TooltipContent>
          </Tooltip>
        )}
      </SheetHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 text-sm">
        <DetailSection title="Source">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Associated parser</span>
              <Badge
                variant="charcoal"
                className="w-fit rounded-full px-2 font-normal dark:bg-grey-400"
              >
                {rule.parser}
              </Badge>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                {datasources.length > 1 ? "Connected datasources" : "Connected datasource"}
              </span>
              {datasources.length === 0 ? (
                <span className="text-muted-foreground">None</span>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {datasources.map((ds) => (
                    <span key={ds} className="text-foreground">
                      {ds}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Comment">
          <p className="text-foreground">{detail.comment}</p>
        </DetailSection>

        <DetailSection title="Objective">
          <p className="text-foreground">{detail.objective}</p>
        </DetailSection>

        <div className="grid grid-cols-3 gap-4">
          <DetailField label="Severity" value={rule.severity} />
          <DetailField label="Fidelity" value={detail.fidelity} />
          <DetailField label="Category" value={detail.category} />
        </div>

        <DetailSection title="MITRE ATT&CK">
          {mitre ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {mitre}
              </Badge>
              {rule.techniqueId ? (
                <span className="text-xs text-muted-foreground">{rule.techniqueId}</span>
              ) : null}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </DetailSection>

        <DetailSection title="Detection SQL">
          <CodeBlock code={detail.sql} />
        </DetailSection>

        <DetailSection title="Notable summary">
          <p className="text-foreground">{detail.summary}</p>
        </DetailSection>

        <DetailSection title="Schedule">
          <p className="text-foreground">{detail.schedule}</p>
        </DetailSection>
      </div>
    </>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold text-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  const lines = code.split("\n")
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-muted/50">
      <pre className="p-3 font-mono text-xs leading-5">
        {lines.map((line, index) => (
          <div key={index} className="flex gap-4">
            <span className="w-4 shrink-0 select-none text-right text-muted-foreground">
              {index + 1}
            </span>
            <span className="whitespace-pre text-foreground">{line}</span>
          </div>
        ))}
      </pre>
    </div>
  )
}

function ImportDialogBody({ rule, onDone }: { rule: DetectionRule; onDone: () => void }) {
  const [catalog, setCatalog] = React.useState("sec_dev")
  const [schema, setSchema] = React.useState("detection_rules")
  const [name, setName] = React.useState(rule.name)
  const datasources = connectedDatasources(rule)
  const needsAssignment = datasources.length > 1
  const [assignedDatasource, setAssignedDatasource] = React.useState("")

  const canImport =
    Boolean(catalog.trim() && schema.trim() && name.trim()) &&
    (!needsAssignment || Boolean(assignedDatasource))

  return (
    <>
      <DialogHeader className="gap-3">
        <DialogTitle>Import</DialogTitle>
        <DialogDescription>
          The following resources will be added to your team content in Lakewatch. If you already
          have a resource with the same name, the new content will be automatically renamed. You can
          change resource names later.
        </DialogDescription>
      </DialogHeader>
      <DialogBody className="gap-4">
        {needsAssignment ? (
          <div className="flex flex-col gap-2">
            <Label>Select the datasource to assign this rule to</Label>
            <RadioGroup
              value={assignedDatasource}
              onValueChange={setAssignedDatasource}
              className="gap-0 overflow-hidden rounded-md border border-border"
            >
              {datasources.map((ds, index) => (
                <label
                  key={ds}
                  htmlFor={`ds-${index}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3 py-2.5",
                    index > 0 && "border-t border-border",
                    assignedDatasource === ds && "bg-primary/5"
                  )}
                >
                  <RadioGroupItem id={`ds-${index}`} value={ds} />
                  <CatalogIcon size={16} className="shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">{ds}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
        <Label>Resource</Label>
        <div className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5">
          <PathSelect
            icon={<CatalogIcon size={16} className="shrink-0 text-muted-foreground" />}
            value={catalog}
            onChange={setCatalog}
            options={CATALOG_OPTIONS}
            ariaLabel="Catalog"
            className="w-[26%]"
          />
          <span className="text-muted-foreground">.</span>
          <PathSelect
            icon={<SchemaIcon size={16} className="shrink-0 text-muted-foreground" />}
            value={schema}
            onChange={setSchema}
            options={SCHEMA_OPTIONS}
            ariaLabel="Schema"
            className="w-[30%]"
          />
          <span className="text-muted-foreground">.</span>
          <PathSegment
            icon={<DetectionNavIcon size={16} className="shrink-0 text-muted-foreground" />}
            value={name}
            onChange={setName}
            ariaLabel="Resource name"
            className="min-w-0 flex-1"
          />
        </div>
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
            const target = needsAssignment ? ` to ${assignedDatasource}` : ""
            toast.success(`Imported ${catalog}.${schema}.${name}${target}`)
            onDone()
          }}
        >
          Import
        </Button>
      </DialogFooter>
    </>
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

function FilterableBadge({
  active,
  onClick,
  variant,
  className,
  title,
  children,
}: {
  active: boolean
  onClick: () => void
  variant: React.ComponentProps<typeof Badge>["variant"]
  className?: string
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className="inline-flex max-w-full rounded outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Badge
        variant={variant}
        className={cn(
          "cursor-pointer transition-[filter,box-shadow] hover:brightness-95 dark:hover:brightness-110",
          active && "ring-1 ring-primary ring-offset-1 ring-offset-background",
          className
        )}
      >
        {children}
      </Badge>
    </button>
  )
}

function DetectionRuleRow({
  rule,
  onImport,
  onOpen,
  onToggleSeverity,
  onToggleParser,
  onToggleTechniqueId,
  activeSeverity,
  activeParser,
  activeTechniqueId,
}: {
  rule: DetectionRule
  onImport: () => void
  onOpen: () => void
  onToggleSeverity: (value: string) => void
  onToggleParser: (value: string) => void
  onToggleTechniqueId: (value: string) => void
  activeSeverity: boolean
  activeParser: boolean
  activeTechniqueId: boolean
}) {
  const datasources = connectedDatasources(rule)
  const canImport = datasources.length > 0

  return (
    <TableRow className="h-12">
      <TableCell>
        <button
          type="button"
          onClick={onOpen}
          title={rule.name}
          className="block max-w-full truncate text-left text-sm font-semibold text-foreground hover:text-primary hover:underline"
        >
          {rule.name}
        </button>
      </TableCell>
      <TableCell>
        <FilterableBadge
          active={activeParser}
          onClick={() => onToggleParser(rule.parser)}
          variant="charcoal"
          className="rounded-full px-2 font-normal dark:bg-grey-400"
          title={`Filter by ${rule.parser}`}
        >
          {rule.parser}
        </FilterableBadge>
      </TableCell>
      <TableCell>
        {datasources.length === 0 ? (
          <span className="text-muted-foreground">None</span>
        ) : (
          <div className="flex flex-col gap-0.5">
            {datasources.map((ds) => (
              <span key={ds} className="block truncate text-foreground" title={ds}>
                {ds}
              </span>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell>
        <FilterableBadge
          active={activeSeverity}
          onClick={() => onToggleSeverity(rule.severity)}
          variant={SEVERITY_BADGE[rule.severity]}
          title={`Filter by ${rule.severity}`}
        >
          {rule.severity}
        </FilterableBadge>
      </TableCell>
      <TableCell className="text-foreground">{rule.tactic || "—"}</TableCell>
      <TableCell className="text-foreground">
        <span className="block truncate" title={rule.technique}>
          {rule.technique || "—"}
        </span>
      </TableCell>
      <TableCell className="text-foreground">
        {rule.techniqueId ? (
          <FilterableBadge
            active={activeTechniqueId}
            onClick={() => onToggleTechniqueId(rule.techniqueId)}
            variant="secondary"
            title={`Filter by ${rule.techniqueId}`}
          >
            {rule.techniqueId}
          </FilterableBadge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        <span className="block truncate" title={rule.pack}>
          {rule.pack}
        </span>
      </TableCell>
      <TableCell className="text-right">
        {canImport ? (
          <Button variant="default" size="xs" onClick={onImport}>
            Import
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-not-allowed">
                <Button variant="default" size="xs" disabled className="pointer-events-none">
                  Import
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Can&apos;t import — no datasource with the {rule.parser} parser is connected to this
              workspace.
            </TooltipContent>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  )
}

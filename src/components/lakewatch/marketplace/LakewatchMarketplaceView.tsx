"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, X } from "lucide-react"

import {
  DatabaseIcon,
  FolderIcon,
  SearchIcon,
  TargetIcon,
} from "@/components/icons"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
  isInstalledInWorkspace,
  type DetectionRule,
  type DetectionRuleDetail,
  type DetectionSeverity,
} from "@/components/lakewatch/marketplace/detectionRules"
import {
  MITRE_ENTERPRISE_TACTICS,
  MITRE_ENTERPRISE_VERSION,
} from "@/components/lakewatch/marketplace/mitreEnterprise"
import { cn } from "@/lib/utils"

const IMPORTED_RULES_STORAGE_KEY = "lakewatch-imported-detection-rules"

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

const FIDELITY_BADGE: Record<
  DetectionRuleDetail["fidelity"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  High: "lime",
  Medium: "lemon",
  Low: "charcoal",
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

const INITIAL_INSTALLED_NAMES = new Set(
  DETECTION_RULES.filter(isInstalledInWorkspace).map((rule) => rule.name)
)

function matchesSearch(rule: DetectionRule, query: string) {
  if (!query) return true
  const haystack = [
    rule.name,
    rule.parser,
    rule.tactic,
    rule.technique,
    rule.techniqueId,
    rule.pack,
    ...connectedDatasources(rule),
  ]
    .join(" ")
    .toLowerCase()
  return haystack.includes(query)
}

function matchesMitreSelection(rule: DetectionRule, selectedIds: string[]) {
  if (!selectedIds.length) return true
  const id = rule.techniqueId
  if (!id) return false
  return selectedIds.some(
    (selected) =>
      selected === id ||
      selected.startsWith(`${id}.`) ||
      id.startsWith(`${selected}.`)
  )
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

export function FacetFilter({
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

export function MitreTacticFilter({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState("")
  const active = selected.length > 0

  const groups = React.useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return MITRE_ENTERPRISE_TACTICS

    return MITRE_ENTERPRISE_TACTICS.flatMap((group) => {
      if (group.name.toLowerCase().includes(needle)) return [group]
      const techniques = group.techniques.filter((technique) =>
        `${technique.name} ${technique.id}`.toLowerCase().includes(needle)
      )
      return techniques.length ? [{ ...group, techniques }] : []
    })
  }, [q])

  const toggleTechnique = (techniqueId: string) => {
    onChange(
      selected.includes(techniqueId)
        ? selected.filter((item) => item !== techniqueId)
        : [...selected, techniqueId]
    )
  }

  const toggleTactic = (techniqueIds: string[]) => {
    const allSelected = techniqueIds.every((techniqueId) =>
      selected.includes(techniqueId)
    )
    onChange(
      allSelected
        ? selected.filter((item) => !techniqueIds.includes(item))
        : Array.from(new Set([...selected, ...techniqueIds]))
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className={cn("gap-1.5", active && "border-primary text-primary")}
        >
          MITRE tactic
          {active ? (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
              {selected.length}
            </span>
          ) : null}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
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
              placeholder="Search tactics or techniques"
              aria-label="Search MITRE tactics or techniques"
              className="h-8 pl-8"
            />
          </div>
          <p className="mt-1.5 px-0.5 text-hint text-muted-foreground">
            Enterprise ATT&amp;CK v{MITRE_ENTERPRISE_VERSION}
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto px-1">
          {groups.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No matches
            </p>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={[]}
              className="w-full"
            >
              {groups.map((group) => {
                const allTechniques =
                  MITRE_ENTERPRISE_TACTICS.find(
                    (candidate) => candidate.id === group.id
                  )?.techniques ?? group.techniques
                const allTechniqueIds = allTechniques.map(
                  (technique) => technique.id
                )
                const selectedCount = allTechniqueIds.filter((techniqueId) =>
                  selected.includes(techniqueId)
                ).length
                const allSelected =
                  allTechniqueIds.length > 0 &&
                  selectedCount === allTechniqueIds.length
                const checked =
                  selectedCount > 0 && !allSelected ? "indeterminate" : allSelected

                return (
                  <AccordionItem
                    key={group.id}
                    value={group.id}
                    className="border-border"
                  >
                    <div className="flex items-center gap-1 px-2">
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            toggleTactic(allTechniqueIds)
                          }
                          aria-label={`Select all ${group.name} techniques`}
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                          {group.name}
                        </span>
                        <span className="text-hint text-muted-foreground">
                          {selectedCount}/{allTechniqueIds.length}
                        </span>
                      </label>
                      <AccordionTrigger
                        className="h-8 w-8 flex-none justify-center p-0 hover:no-underline [&>svg]:translate-y-0"
                        aria-label={`Expand ${group.name} techniques`}
                      >
                        <span className="sr-only">{group.name}</span>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent className="pb-1 pl-8 pr-2">
                      <div className="flex flex-col">
                        {group.techniques.map((technique) => (
                          <label
                            key={technique.id}
                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
                          >
                            <Checkbox
                              checked={selected.includes(technique.id)}
                              onCheckedChange={() =>
                                toggleTechnique(technique.id)
                              }
                            />
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="text-sm text-foreground">
                                {technique.name}
                              </span>
                              <span className="text-hint text-muted-foreground">
                                {technique.id}
                                {technique.subtechnique ? " · Sub-technique" : ""}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
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
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [importRules, setImportRules] = React.useState<DetectionRule[]>([])
  const [successRules, setSuccessRules] = React.useState<DetectionRule[]>([])
  const [detailRule, setDetailRule] = React.useState<DetectionRule | null>(null)

  const [severities, setSeverities] = React.useState<string[]>([])
  const [parsers, setParsers] = React.useState<string[]>([])
  const [datasources, setDatasources] = React.useState<string[]>([])
  const [mitreTechniqueIds, setMitreTechniqueIds] = React.useState<string[]>([])
  const [techniqueIds, setTechniqueIds] = React.useState<string[]>([])
  const [installedOnly, setInstalledOnly] = React.useState(false)
  const [installedNames, setInstalledNames] = React.useState(
    () => new Set(INITIAL_INSTALLED_NAMES)
  )
  const [selectedNames, setSelectedNames] = React.useState<Set<string>>(
    () => new Set()
  )

  const activeCount =
    severities.length +
    parsers.length +
    datasources.length +
    mitreTechniqueIds.length +
    techniqueIds.length +
    (installedOnly ? 1 : 0)

  const clearAll = React.useCallback(() => {
    setSeverities([])
    setParsers([])
    setDatasources([])
    setMitreTechniqueIds([])
    setTechniqueIds([])
    setInstalledOnly(false)
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

  const matchesFacets = React.useCallback(
    (
      rule: DetectionRule,
      skip?:
        | "severity"
        | "parser"
        | "datasource"
        | "mitre"
        | "techniqueId"
        | "installed"
    ) => {
      if (skip !== "severity" && severities.length && !severities.includes(rule.severity)) {
        return false
      }
      if (skip !== "parser" && parsers.length && !parsers.includes(rule.parser)) {
        return false
      }
      if (skip !== "mitre" && !matchesMitreSelection(rule, mitreTechniqueIds)) {
        return false
      }
      if (
        skip !== "techniqueId" &&
        techniqueIds.length &&
        !techniqueIds.includes(rule.techniqueId)
      ) {
        return false
      }
      if (skip !== "datasource" && datasources.length) {
        const ds = connectedDatasources(rule)
        if (!ds.some((item) => datasources.includes(item))) return false
      }
      if (skip !== "installed" && installedOnly && !installedNames.has(rule.name)) {
        return false
      }
      return true
    },
    [
      severities,
      parsers,
      datasources,
      mitreTechniqueIds,
      techniqueIds,
      installedOnly,
      installedNames,
    ]
  )

  const searchQuery = query.trim().toLowerCase()

  const facetFiltered = React.useMemo(
    () => DETECTION_RULES.filter((rule) => matchesFacets(rule)),
    [matchesFacets]
  )

  const rows = React.useMemo(
    () => facetFiltered.filter((rule) => matchesSearch(rule, searchQuery)),
    [facetFiltered, searchQuery]
  )
  const selectableRows = React.useMemo(
    () =>
      rows.filter(
        (rule) =>
          connectedDatasources(rule).length > 0 &&
          !installedNames.has(rule.name)
      ),
    [installedNames, rows]
  )
  const allVisibleSelected =
    selectableRows.length > 0 &&
    selectableRows.every((rule) => selectedNames.has(rule.name))
  const someVisibleSelected =
    !allVisibleSelected &&
    selectableRows.some((rule) => selectedNames.has(rule.name))

  const setRuleSelected = React.useCallback(
    (name: string, selected: boolean) => {
      setSelectedNames((current) => {
        const next = new Set(current)
        if (selected) next.add(name)
        else next.delete(name)
        return next
      })
    },
    []
  )

  const setAllVisibleSelected = (selected: boolean) => {
    setSelectedNames((current) => {
      const next = new Set(current)
      selectableRows.forEach((rule) => {
        if (selected) next.add(rule.name)
        else next.delete(rule.name)
      })
      return next
    })
  }

  const importSelectedRules = () => {
    setImportRules(
      DETECTION_RULES.filter((rule) => selectedNames.has(rule.name))
    )
  }

  const finishImport = (rules: DetectionRule[]) => {
    setInstalledNames(
      (current) => new Set([...current, ...rules.map((rule) => rule.name)])
    )
    setSelectedNames(new Set())
    setImportRules([])
    setDetailRule(null)
    window.sessionStorage.setItem(
      IMPORTED_RULES_STORAGE_KEY,
      JSON.stringify(rules)
    )
    setSuccessRules(rules)
  }

  const viewImportedRules = () => {
    const names = successRules.map((rule) => rule.name).join("|")
    setSuccessRules([])
    router.push(`/lakewatch/detection?imported=${encodeURIComponent(names)}`)
  }

  const parserOptions = React.useMemo(
    () =>
      distinctSorted([
        ...parsers,
        ...DETECTION_RULES.filter(
          (rule) => matchesFacets(rule, "parser") && matchesSearch(rule, searchQuery)
        ).map((rule) => rule.parser),
      ]),
    [matchesFacets, parsers, searchQuery]
  )
  const datasourceOptions = React.useMemo(
    () =>
      distinctSorted([
        ...datasources,
        ...DETECTION_RULES.filter(
          (rule) => matchesFacets(rule, "datasource") && matchesSearch(rule, searchQuery)
        ).flatMap((rule) => connectedDatasources(rule)),
      ]),
    [datasources, matchesFacets, searchQuery]
  )
  const severityOptions = React.useMemo(
    () =>
      SEVERITY_ORDER.filter(
        (severity) =>
          severities.includes(severity) ||
          DETECTION_RULES.some(
            (rule) =>
              rule.severity === severity &&
              matchesFacets(rule, "severity") &&
              matchesSearch(rule, searchQuery)
          )
      ),
    [matchesFacets, searchQuery, severities]
  )
  const techniqueIdOptions = React.useMemo(
    () =>
      distinctSorted([
        ...techniqueIds,
        ...DETECTION_RULES.filter(
          (rule) =>
            matchesFacets(rule, "techniqueId") && matchesSearch(rule, searchQuery)
        ).map((rule) => rule.techniqueId),
      ]),
    [matchesFacets, searchQuery, techniqueIds]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-4">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Content library</h1>
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
              options={severityOptions}
              selected={severities}
              onChange={setSeverities}
            />
            <FacetFilter
              label="Parser"
              options={parserOptions}
              selected={parsers}
              onChange={setParsers}
              searchable
            />
            <FacetFilter
              label="Datasource"
              options={datasourceOptions}
              selected={datasources}
              onChange={setDatasources}
              searchable
            />
            <MitreTacticFilter
              selected={mitreTechniqueIds}
              onChange={setMitreTechniqueIds}
            />
            <FacetFilter
              label="Technique ID"
              options={techniqueIdOptions}
              selected={techniqueIds}
              onChange={setTechniqueIds}
              searchable
            />
            <div className="flex h-8 items-center gap-2">
              <Checkbox
                id="marketplace-installed-filter"
                checked={installedOnly}
                onCheckedChange={(checked) => setInstalledOnly(checked === true)}
              />
              <Label
                htmlFor="marketplace-installed-filter"
                className="cursor-pointer font-normal"
              >
                Installed
              </Label>
            </div>
            <span className="ml-1 text-sm text-muted-foreground">
              {rows.length} {rows.length === 1 ? "result" : "results"}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {selectedNames.size >= 2 || allVisibleSelected ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={importSelectedRules}
                >
                  Import ({selectedNames.size})
                </Button>
              ) : null}
              {activeCount > 0 ? (
                <Button
                  variant="link"
                  size="sm"
                  className="h-8 px-2"
                  onClick={clearAll}
                >
                  Clear all
                </Button>
              ) : null}
            </div>
          </div>
          <div className="min-h-0 overflow-x-auto">
            <Table className="min-w-[1320px] table-fixed">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-9">
                    <Checkbox
                      checked={
                        allVisibleSelected
                          ? true
                          : someVisibleSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(checked) =>
                        setAllVisibleSelected(checked === true)
                      }
                      disabled={selectableRows.length === 0}
                      aria-label="Select all importable detection rules"
                    />
                  </TableHead>
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
                    onImport={() => setImportRules([rule])}
                    onOpen={() => setDetailRule(rule)}
                    installed={installedNames.has(rule.name)}
                    selected={selectedNames.has(rule.name)}
                    onSelectedChange={(selected) =>
                      setRuleSelected(rule.name, selected)
                    }
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

      <Dialog
        open={importRules.length > 0}
        onOpenChange={(open) => !open && setImportRules([])}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-4xl">
          {importRules.length > 0 ? (
            <ImportRulesDialogBody
              rules={importRules}
              onDone={() => finishImport(importRules)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={successRules.length > 0}
        onOpenChange={(open) => !open && setSuccessRules([])}
      >
        <DialogContent className="sm:max-w-md">
          {successRules.length > 0 ? (
            <>
              <DialogHeader>
                <DialogTitle>Import complete</DialogTitle>
                <DialogDescription>
                  {successRules.length === 1
                    ? "1 rule has been successfully imported. This rule is not yet enabled."
                    : `${successRules.length} rules have been successfully imported. These rules are not yet enabled.`}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="default" size="sm">
                    Done
                  </Button>
                </DialogClose>
                <Button variant="primary" size="sm" onClick={viewImportedRules}>
                  View &amp; enable{" "}
                  {successRules.length === 1 ? "rule" : "rules"}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Sheet open={Boolean(detailRule)} onOpenChange={(open) => !open && setDetailRule(null)}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-[600px]">
          {detailRule ? (
            <DetectionRuleDetailPanel
              rule={detailRule}
              installed={installedNames.has(detailRule.name)}
              onImport={() => setImportRules([detailRule])}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function DetectionRuleDetailPanel({
  rule,
  installed,
  onImport,
  datasources: datasourceOverride,
}: {
  rule: DetectionRule
  installed: boolean
  onImport: () => void
  datasources?: string[]
}) {
  const detail = getRuleDetail(rule)
  const datasources = datasourceOverride ?? connectedDatasources(rule)
  const canImport = datasources.length > 0 && !installed
  const mitre = rule.tactic && rule.technique ? `${rule.tactic} / ${rule.technique}` : null

  return (
    <>
      <SheetHeader className="flex-row items-center gap-2 border-b px-4 py-3">
        <SheetTitle className="min-w-0 flex-1 truncate">{rule.name}</SheetTitle>
        {installed ? (
          <Button variant="default" size="xs" className="mr-6" disabled>
            Installed
          </Button>
        ) : canImport ? (
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
          <DetailBadgeField
            label="Severity"
            value={rule.severity}
            variant={SEVERITY_BADGE[rule.severity]}
          />
          <DetailBadgeField
            label="Fidelity"
            value={detail.fidelity}
            variant={FIDELITY_BADGE[detail.fidelity]}
          />
          <DetailField label="Category" value={detail.category} />
        </div>

        <DetailSection title="MITRE ATT&CK">
          {mitre ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {mitre}
              </Badge>
              {rule.techniqueId ? (
                <Badge variant="secondary" className="font-normal">
                  {rule.techniqueId}
                </Badge>
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

function DetailBadgeField({
  label,
  value,
  variant,
}: {
  label: string
  value: string
  variant: React.ComponentProps<typeof Badge>["variant"]
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="font-semibold text-foreground">{label}</span>
      <Badge variant={variant} className="font-normal">
        {value}
      </Badge>
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

const IMPORT_TABLES: Record<string, { label: string; table: string }> = {
  "AWS.CloudTrail": {
    label: "AWS CloudTrail events",
    table: "aws_cloudtrail",
  },
  "AWS.GuardDuty": {
    label: "AWS GuardDuty findings",
    table: "aws_guardduty_findings",
  },
  "AWS.VPCFlow": {
    label: "AWS VPC Flow events",
    table: "aws_vpc_flow",
  },
  "Databricks.Audit": {
    label: "Databricks audit events",
    table: "databricks_audit",
  },
  "GitHub.AuditLog": {
    label: "GitHub audit events",
    table: "github_audit_log",
  },
  "Okta.SystemLog": {
    label: "Okta system events",
    table: "okta_system_log",
  },
  "Slack.AuditLogs": {
    label: "Slack audit events",
    table: "slack_audit_logs",
  },
}

function ImportRulesDialogBody({
  rules,
  onDone,
}: {
  rules: DetectionRule[]
  onDone: () => void
}) {
  const [schema, setSchema] = React.useState("default")
  const tables = Array.from(
    new Map(
      rules.map((rule) => {
        const definition = IMPORT_TABLES[rule.parser] ?? {
          label: `${rule.parser} events`,
          table: rule.parser.toLowerCase().replaceAll(".", "_"),
        }
        return [rule.parser, definition] as const
      })
    ).values()
  )
  const ruleLabel = rules.length === 1 ? "rule" : "rules"

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          Import {rules.length} {ruleLabel}
        </DialogTitle>
      </DialogHeader>

      <DialogBody className="gap-6">
        <div>
          <div className="grid max-w-lg grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <Label>Catalog</Label>
              <Button
                variant="default"
                size="sm"
                className="justify-start"
                disabled
              >
                <DatabaseIcon size={16} />
                lakewatch_v2
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Schema</Label>
              <Select value={schema} onValueChange={setSchema}>
                <SelectTrigger>
                  <span className="flex items-center gap-2">
                    <DatabaseIcon size={16} className="text-muted-foreground" />
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">default</SelectItem>
                  <SelectItem value="detection_rules">
                    detection_rules
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-2 text-muted-foreground">
            The default location where all rules are installed. You can change
            it for each rule below.
          </p>
        </div>

        <section className="flex flex-col gap-2">
          <div>
            <h3 className="font-semibold text-foreground">SQL tables</h3>
            <p className="text-muted-foreground">
              Set the tables used by the rules you&apos;re importing. Expand a
              rule below to override its tables.
            </p>
          </div>
          {tables.map((table) => (
            <div
              key={table.table}
              className="grid items-center gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]"
            >
              <Label>{table.label}</Label>
              <div className="flex">
                <Input
                  value={`lakewatch_v2.${schema}.${table.table}`}
                  readOnly
                  aria-label={`${table.label} table`}
                  className="rounded-r-none"
                />
                <Button
                  variant="default"
                  size="icon-sm"
                  className="-ml-px rounded-l-none"
                  aria-label={`Browse for ${table.label} table`}
                >
                  <FolderIcon size={16} />
                </Button>
              </div>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-semibold text-foreground">
            Rules to import ({rules.length})
          </h3>
          <Accordion
            type="multiple"
            className="overflow-hidden rounded-md border border-border"
          >
            {rules.map((rule) => (
              <AccordionItem key={rule.name} value={rule.name}>
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <span className="flex min-w-0 items-center gap-2">
                    <TargetIcon
                      size={16}
                      className="shrink-0 text-muted-foreground"
                    />
                    <span className="truncate font-semibold text-foreground">
                      {rule.name}
                    </span>
                    <span className="truncate text-muted-foreground">
                      {rule.pack}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="flex flex-col gap-2">
                    <Label>Install location</Label>
                    <Input
                      value={`lakewatch_v2.${schema}.${rule.name}`}
                      readOnly
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
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
          onClick={onDone}
        >
          Import
        </Button>
      </DialogFooter>
    </>
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
  selected,
  onSelectedChange,
  onToggleSeverity,
  onToggleParser,
  onToggleTechniqueId,
  activeSeverity,
  activeParser,
  activeTechniqueId,
  installed,
}: {
  rule: DetectionRule
  onImport: () => void
  onOpen: () => void
  selected: boolean
  onSelectedChange: (selected: boolean) => void
  onToggleSeverity: (value: string) => void
  onToggleParser: (value: string) => void
  onToggleTechniqueId: (value: string) => void
  activeSeverity: boolean
  activeParser: boolean
  activeTechniqueId: boolean
  installed: boolean
}) {
  const datasources = connectedDatasources(rule)
  const canImport = datasources.length > 0 && !installed

  return (
    <TableRow className="h-12">
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelectedChange(checked === true)}
          disabled={!canImport}
          aria-label={`Select ${rule.name} for import`}
        />
      </TableCell>
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
        {installed ? (
          <Button variant="default" size="xs" disabled>
            Installed
          </Button>
        ) : canImport ? (
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

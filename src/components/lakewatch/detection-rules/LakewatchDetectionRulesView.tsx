"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronDownIcon,
  ColumnsIcon,
  ContentLibraryNavIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import {
  FacetFilter,
  MitreTacticFilter,
} from "@/components/lakewatch/marketplace/LakewatchMarketplaceView"
import { MITRE_ENTERPRISE_TACTICS } from "@/components/lakewatch/marketplace/mitreEnterprise"
import { DETECTION_RULE_DETAILS } from "@/components/lakewatch/detection-rules/detectionRuleDetails"
import {
  DETECTION_RULES_LIST,
  type DetectionFidelity,
  type DetectionRuleListItem,
  type DetectionSeverity,
} from "@/components/lakewatch/detection-rules/detectionRulesList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
  DetectionFidelity,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  High: "lime",
  Medium: "lemon",
  Low: "charcoal",
}

const ANNOTATION_BADGE: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  prod: "indigo",
  "soc-priority": "coral",
  "compliance:hipaa": "purple",
}

function distinctSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  )
}

const FACET_SEVERITIES = ["Critical", "High", "Medium", "Low", "Informational"].filter(
  (severity) =>
    DETECTION_RULES_LIST.some((rule) => rule.severity === severity)
)
const FACET_LOCATIONS = distinctSorted(
  DETECTION_RULES_LIST.map((rule) => rule.location)
)
const FACET_CATEGORIES = distinctSorted(
  DETECTION_RULES_LIST.map((rule) => rule.category)
)
const FACET_FIDELITIES = distinctSorted(
  DETECTION_RULES_LIST.map((rule) => rule.fidelity)
)
const FACET_ANNOTATIONS = distinctSorted(
  DETECTION_RULES_LIST.flatMap((rule) => rule.annotations)
)
const FACET_STATUS = ["Active", "Inactive"]
const RULE_DETAILS = new Map(
  DETECTION_RULE_DETAILS.map((rule) => [rule.id, rule])
)
const RULE_MITRE_IDS = new Map(
  DETECTION_RULE_DETAILS.map((rule) => [
    rule.id,
    Array.from(
      new Set(
        MITRE_ENTERPRISE_TACTICS.flatMap((group) => group.techniques)
          .filter(
            (technique) =>
              technique.name === rule.mitreTechnique ||
              technique.name === rule.mitreSubtechnique
          )
          .map((technique) => technique.id)
      )
    ),
  ])
)

export function LakewatchDetectionRulesView() {
  const [filter, setFilter] = React.useState("")
  const [rules, setRules] = React.useState(DETECTION_RULES_LIST)
  const [severities, setSeverities] = React.useState<string[]>([])
  const [locations, setLocations] = React.useState<string[]>([])
  const [categories, setCategories] = React.useState<string[]>([])
  const [fidelities, setFidelities] = React.useState<string[]>([])
  const [annotations, setAnnotations] = React.useState<string[]>([])
  const [statuses, setStatuses] = React.useState<string[]>([])
  const [mitreTechniqueIds, setMitreTechniqueIds] = React.useState<string[]>([])

  const activeFilterCount =
    severities.length +
    locations.length +
    categories.length +
    fidelities.length +
    annotations.length +
    statuses.length +
    mitreTechniqueIds.length

  const clearAll = () => {
    setSeverities([])
    setLocations([])
    setCategories([])
    setFidelities([])
    setAnnotations([])
    setStatuses([])
    setMitreTechniqueIds([])
  }

  const filtered = React.useMemo(() => {
    const q = filter.trim().toLowerCase()
    return rules.filter((rule) => {
      const detail = RULE_DETAILS.get(rule.id)
      const haystack = [
        rule.name,
        rule.location,
        rule.description,
        rule.severity,
        rule.category,
        rule.fidelity,
        ...rule.annotations,
        detail?.mitreTactic ?? "",
        detail?.mitreTechnique ?? "",
        detail?.mitreSubtechnique ?? "",
      ]
        .join(" ")
        .toLowerCase()
      if (q && !haystack.includes(q)) return false
      if (severities.length && !severities.includes(rule.severity)) return false
      if (locations.length && !locations.includes(rule.location)) return false
      if (categories.length && !categories.includes(rule.category)) return false
      if (fidelities.length && !fidelities.includes(rule.fidelity)) return false
      if (
        annotations.length &&
        !rule.annotations.some((annotation) => annotations.includes(annotation))
      ) {
        return false
      }
      if (
        statuses.length &&
        !statuses.includes(rule.active ? "Active" : "Inactive")
      ) {
        return false
      }
      if (
        mitreTechniqueIds.length &&
        !(RULE_MITRE_IDS.get(rule.id) ?? []).some((id) =>
          mitreTechniqueIds.includes(id)
        )
      ) {
        return false
      }
      return true
    })
  }, [
    filter,
    rules,
    severities,
    locations,
    categories,
    fidelities,
    annotations,
    statuses,
    mitreTechniqueIds,
  ])

  const toggleActive = (id: string, active: boolean) => {
    setRules((current) =>
      current.map((rule) => (rule.id === id ? { ...rule, active } : rule))
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-4">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Detection rules</h1>
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex">
            <Button variant="primary" size="sm" className="rounded-r-none">
              <PlusIcon size={16} />
              Create detection rule
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="primary"
                  size="icon-sm"
                  className="rounded-l-none border-l border-primary-foreground/30"
                  aria-label="More detection rule actions"
                >
                  <ChevronDownIcon size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/lakewatch/marketplace">
                    <ContentLibraryNavIcon size={16} />
                    Import from Content library
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative w-[240px] shrink-0">
            <Input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter detection rules"
              className="pl-9"
              aria-label="Filter detection rules"
            />
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <FacetFilter
            label="Severity"
            options={FACET_SEVERITIES}
            selected={severities}
            onChange={setSeverities}
          />
          <FacetFilter
            label="Location"
            options={FACET_LOCATIONS}
            selected={locations}
            onChange={setLocations}
            searchable
          />
          <FacetFilter
            label="Category"
            options={FACET_CATEGORIES}
            selected={categories}
            onChange={setCategories}
          />
          <FacetFilter
            label="Fidelity"
            options={FACET_FIDELITIES}
            selected={fidelities}
            onChange={setFidelities}
          />
          <FacetFilter
            label="Annotations"
            options={FACET_ANNOTATIONS}
            selected={annotations}
            onChange={setAnnotations}
          />
          <FacetFilter
            label="Status"
            options={FACET_STATUS}
            selected={statuses}
            onChange={setStatuses}
          />
          <MitreTacticFilter
            selected={mitreTechniqueIds}
            onChange={setMitreTechniqueIds}
          />
          <span className="ml-1 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
          {activeFilterCount > 0 ? (
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

      <div className="mt-4 min-w-0">
        {filtered.length === 0 ? (
          <div className="flex min-h-[360px] items-center justify-center border-t border-border">
            <Empty
              image={<SearchIcon size={64} />}
              title="No detection rules found"
              description="Try a different filter, or create a detection rule."
            />
          </div>
        ) : (
          <Table className="min-w-[1280px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Last modified</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Fidelity</TableHead>
                <TableHead>Annotations</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-10 text-right">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Column settings"
                  >
                    <ColumnsIcon size={16} className="text-muted-foreground" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((rule) => (
                <DetectionRuleRow
                  key={rule.id}
                  rule={rule}
                  onActiveChange={toggleActive}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

function DetectionRuleRow({
  rule,
  onActiveChange,
}: {
  rule: DetectionRuleListItem
  onActiveChange: (id: string, active: boolean) => void
}) {
  return (
    <TableRow>
      <TableCell>
        <Button
          variant="link"
          size="sm"
          className="h-auto justify-start p-0 !px-0 text-sm font-semibold"
          asChild
        >
          <Link href={`/lakewatch/detection/${rule.id}`}>{rule.name}</Link>
        </Button>
      </TableCell>
      <TableCell className="text-foreground">{rule.location}</TableCell>
      <TableCell className="max-w-[280px] whitespace-normal text-foreground">
        {rule.description}
      </TableCell>
      <TableCell>
        <Badge variant={SEVERITY_BADGE[rule.severity]} className="font-normal">
          {rule.severity}
        </Badge>
      </TableCell>
      <TableCell className="text-foreground">{rule.lastModified}</TableCell>
      <TableCell className="text-foreground">{rule.category}</TableCell>
      <TableCell>
        <Badge variant={FIDELITY_BADGE[rule.fidelity]} className="font-normal">
          {rule.fidelity}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {rule.annotations.map((annotation) => (
            <Badge
              key={annotation}
              variant={ANNOTATION_BADGE[annotation] ?? "default_tag"}
              className="font-normal"
            >
              {annotation}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <Switch
          size="sm"
          checked={rule.active}
          onCheckedChange={(checked) => onActiveChange(rule.id, checked)}
          aria-label={`${rule.active ? "Disable" : "Enable"} ${rule.name}`}
        />
      </TableCell>
      <TableCell />
    </TableRow>
  )
}

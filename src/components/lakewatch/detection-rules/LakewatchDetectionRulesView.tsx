"use client"

import * as React from "react"
import Link from "next/link"
import {
  ColumnsIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import {
  DETECTION_RULES_LIST,
  type DetectionFidelity,
  type DetectionRuleListItem,
  type DetectionSeverity,
} from "@/components/lakewatch/detection-rules/detectionRulesList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export function LakewatchDetectionRulesView() {
  const [filter, setFilter] = React.useState("")
  const [rules, setRules] = React.useState(DETECTION_RULES_LIST)

  const filtered = React.useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return rules
    return rules.filter((rule) => {
      const haystack = [
        rule.name,
        rule.location,
        rule.description,
        rule.severity,
        rule.category,
        rule.fidelity,
        ...rule.annotations,
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [filter, rules])

  const toggleActive = (id: string, active: boolean) => {
    setRules((current) =>
      current.map((rule) => (rule.id === id ? { ...rule, active } : rule))
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className={PAGE_TITLE_SEMIBOLD}>Detection rules</h1>
          <div className="relative w-[240px]">
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
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <LakewatchDataControls />
          <Button variant="primary" size="sm">
            <PlusIcon size={16} />
            Create detection rule
          </Button>
        </div>
      </div>

      <div className="mt-6 min-w-0">
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

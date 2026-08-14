"use client"

import * as React from "react"
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  Search,
  SquareArrowOutUpRight,
  X,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ValidatedInput } from "@/components/lakewatch/ValidatedInput"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  SegmentedControl,
  SegmentedItem,
} from "@/components/ui/segmented-control"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const TODAY_LABEL = "Aug 9, 2026"

// Version history for the details panel picker. Listed lowest-to-highest, with
// higher versions being the newer (more recent) releases.
const TEMPLATE_VERSIONS = [
  { version: "v1", date: "Jan 15, 2025" },
  { version: "v2", date: "Mar 3, 2025" },
  { version: "v3", date: "May 20, 2025" },
  { version: "v4", date: "Jul 8, 2025" },
  { version: "v5", date: "Aug 1, 2025" },
] as const

type TemplateKind = "built-in" | "custom"

type TemplateField = {
  name: string
  type: string
  fields?: TemplateField[]
  timeFormats?: string[]
}

type IntegrationTemplate = {
  id: string
  name: string
  version: string
  kind: TemplateKind
  group: string
  description: string
  modified: string
  fieldCount: number
  fields: TemplateField[]
  defaultOutput: string
  linkedDatasource: string
  createdBy: string
  editable?: boolean
}

const CLOUDTRAIL_FIELDS: TemplateField[] = [
  { name: "eventVersion", type: "string" },
  {
    name: "userIdentity",
    type: "object",
    fields: [
      { name: "type", type: "string" },
      { name: "principalId", type: "string" },
      { name: "arn", type: "string" },
    ],
  },
  { name: "eventTime", type: "timestamp", timeFormats: ["rfc3339"] },
  { name: "eventSource", type: "string" },
  { name: "eventName", type: "string" },
  { name: "awsRegion", type: "string" },
  { name: "sourceIPAddress", type: "string" },
  { name: "requestParameters", type: "object", fields: [] },
  { name: "responseElements", type: "object", fields: [] },
]

const INITIAL_TEMPLATES: IntegrationTemplate[] = [
  {
    id: "aws-cloudtrail",
    name: "AWS CloudTrail",
    version: "v2",
    kind: "built-in",
    group: "AWS",
    description: "Event log template for AWS audit trails",
    modified: "Aug 3, 2026",
    fieldCount: 11,
    fields: CLOUDTRAIL_FIELDS,
    defaultOutput: "main.audit_logs.cloudtrail",
    linkedDatasource: "aws-prod-account-01",
    createdBy: "J. Martinez",
  },
  {
    id: "aws-vpc-flow",
    name: "AWS VPC Flow Logs",
    version: "v4",
    kind: "built-in",
    group: "AWS",
    description: "VPC flow log records for network traffic analysis",
    modified: "Jul 28, 2026",
    fieldCount: 15,
    fields: [
      { name: "version", type: "string" },
      { name: "accountId", type: "string" },
      { name: "interfaceId", type: "string" },
      { name: "srcAddr", type: "string" },
      { name: "dstAddr", type: "string" },
      { name: "srcPort", type: "integer" },
      { name: "dstPort", type: "integer" },
      { name: "protocol", type: "integer" },
      { name: "packets", type: "long" },
      { name: "bytes", type: "long" },
      { name: "action", type: "string" },
    ],
    defaultOutput: "main.network_logs.vpc_flow",
    linkedDatasource: "aws-prod-account-01",
    createdBy: "J. Martinez",
  },
  {
    id: "aws-alb",
    name: "AWS ALB Access Logs",
    version: "v3",
    kind: "built-in",
    group: "AWS",
    description: "Application Load Balancer access log template",
    modified: "Jul 22, 2026",
    fieldCount: 18,
    fields: [
      { name: "type", type: "string" },
      { name: "time", type: "timestamp", timeFormats: ["rfc3339"] },
      { name: "elb", type: "string" },
      { name: "clientIp", type: "string" },
      { name: "clientPort", type: "integer" },
      { name: "targetIp", type: "string" },
      { name: "targetPort", type: "integer" },
      { name: "requestProcessingTime", type: "double" },
      { name: "targetProcessingTime", type: "double" },
      { name: "elbStatusCode", type: "integer" },
      { name: "receivedBytes", type: "long" },
      { name: "sentBytes", type: "long" },
      { name: "request", type: "string" },
    ],
    defaultOutput: "main.network_logs.alb_access",
    linkedDatasource: "aws-prod-account-01",
    createdBy: "J. Martinez",
  },
  {
    id: "aws-guardduty",
    name: "AWS GuardDuty",
    version: "v1",
    kind: "built-in",
    group: "AWS",
    description: "GuardDuty threat detection findings",
    modified: "Jul 15, 2026",
    fieldCount: 9,
    fields: [
      { name: "schemaVersion", type: "string" },
      { name: "accountId", type: "string" },
      { name: "region", type: "string" },
      { name: "type", type: "string" },
      { name: "severity", type: "double" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "createdAt", type: "timestamp", timeFormats: ["rfc3339"] },
      { name: "updatedAt", type: "timestamp", timeFormats: ["rfc3339"] },
    ],
    defaultOutput: "main.security_logs.guardduty",
    linkedDatasource: "aws-prod-account-01",
    createdBy: "J. Martinez",
  },
  {
    id: "custom-securityhub",
    name: "Custom AWS SecurityHub",
    version: "v2",
    kind: "custom",
    group: "Custom",
    description: "Custom template for Security Hub findings",
    modified: "Aug 6, 2026",
    fieldCount: 8,
    editable: true,
    fields: [
      { name: "findingId", type: "string" },
      { name: "productArn", type: "string" },
      { name: "generatorId", type: "string" },
      { name: "awsAccountId", type: "string" },
      { name: "severity", type: "object", fields: [{ name: "label", type: "string" }] },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "recordState", type: "string" },
    ],
    defaultOutput: "main.security_logs.securityhub",
    linkedDatasource: "aws-prod-account-01",
    createdBy: "J. Martinez",
  },
  {
    id: "custom-okta-system",
    name: "Custom Okta System Log",
    version: "v1",
    kind: "custom",
    group: "Custom",
    description: "Identity provider authentication and admin activity",
    modified: "Aug 1, 2026",
    fieldCount: 12,
    editable: true,
    fields: [
      { name: "uuid", type: "string" },
      { name: "published", type: "timestamp", timeFormats: ["rfc3339"] },
      { name: "eventType", type: "string" },
      { name: "displayMessage", type: "string" },
      { name: "actor", type: "object", fields: [{ name: "id", type: "string" }, { name: "type", type: "string" }] },
      { name: "outcome", type: "object", fields: [{ name: "result", type: "string" }] },
    ],
    defaultOutput: "main.identity_logs.okta_system",
    linkedDatasource: "okta-prod",
    createdBy: "A. Nguyen",
  },
  {
    id: "custom-zscaler-web",
    name: "Custom Zscaler Web",
    version: "v1",
    kind: "custom",
    group: "Custom",
    description: "Web proxy access records from Zscaler Internet Access",
    modified: "Jul 30, 2026",
    fieldCount: 14,
    editable: true,
    fields: [
      { name: "datetime", type: "timestamp", timeFormats: ["rfc3339"] },
      { name: "user", type: "string" },
      { name: "department", type: "string" },
      { name: "url", type: "string" },
      { name: "action", type: "string" },
      { name: "reason", type: "string" },
      { name: "appName", type: "string" },
    ],
    defaultOutput: "main.web_logs.zscaler",
    linkedDatasource: "zscaler-prod",
    createdBy: "A. Nguyen",
  },
]

const FAMILY_EVENT_FIELDS: TemplateField[] = [
  { name: "id", type: "string" },
  { name: "timestamp", type: "timestamp", timeFormats: ["rfc3339"] },
  {
    name: "actor",
    type: "object",
    fields: [
      { name: "id", type: "string" },
      { name: "email", type: "string" },
    ],
  },
  { name: "action", type: "string" },
  { name: "entity", type: "string" },
  { name: "ipAddress", type: "string" },
  { name: "userAgent", type: "string" },
  { name: "outcome", type: "string" },
]

/**
 * Builds the built-in parsers for a specific source family (e.g.
 * "Slack"), so the Lakeflow Connect wizard only surfaces templates relevant to
 * the connector the user picked.
 */
function buildFamilyTemplates(family: string): IntegrationTemplate[] {
  const slug = toTableName(family)
  const base = {
    kind: "built-in" as const,
    group: family,
    modified: "Aug 6, 2026",
    fields: FAMILY_EVENT_FIELDS,
    fieldCount: FAMILY_EVENT_FIELDS.length,
    linkedDatasource: `${slug}-connection`,
    createdBy: "J. Martinez",
  }
  return [
    {
      ...base,
      id: `${slug}-audit-logs`,
      name: `${family} Audit Logs`,
      version: "v2",
      description: `${family} audit and admin activity events`,
      defaultOutput: `main.audit_logs.${slug}_audit`,
    },
    {
      ...base,
      id: `${slug}-access-logs`,
      name: `${family} Access Logs`,
      version: "v1",
      description: `${family} authentication and access events`,
      defaultOutput: `main.access_logs.${slug}_access`,
    },
    {
      ...base,
      id: `${slug}-events`,
      name: `${family} Events`,
      version: "v1",
      description: `${family} activity and event stream`,
      defaultOutput: `main.events.${slug}_events`,
    },
  ]
}

function fieldsToYaml(fields: TemplateField[], indent = 0): string {
  const pad = "  ".repeat(indent)
  const lines: string[] = []
  for (const field of fields) {
    lines.push(`${pad}- name: ${field.name}`)
    lines.push(`${pad}  type: ${field.type}`)
    if (field.timeFormats?.length) {
      lines.push(`${pad}  timeFormats:`)
      for (const format of field.timeFormats) lines.push(`${pad}    - ${format}`)
    }
    if (field.fields?.length) {
      lines.push(`${pad}  fields:`)
      lines.push(fieldsToYaml(field.fields, indent + 2))
    }
  }
  return lines.join("\n")
}

function TemplateKindBadge({ kind }: { kind: TemplateKind }) {
  return kind === "built-in" ? (
    <Badge variant="teal">Built-in</Badge>
  ) : (
    <Badge variant="brown">Custom</Badge>
  )
}

/** Syntax-highlights a single YAML line for the read-only parser code block. */
function HighlightedYamlLine({ line }: { line: string }) {
  if (line.trimStart().startsWith("#")) {
    return <span className="italic text-blue-400">{line}</span>
  }

  const match = line.match(/^(\s*(?:-\s+)?)([\w]+):(.*)$/)
  if (!match) return <>{line}</>

  const [, prefix, key, rawValue] = match
  const value = rawValue.trim()
  const valueClass =
    value === "true" || value === "false" ? "text-[var(--warning)]" : "text-coral-300"

  return (
    <>
      {prefix}
      <span className="text-teal-300">{key}</span>
      <span className="text-grey-350">:</span>
      {value ? <span className={valueClass}> {value}</span> : null}
    </>
  )
}

function TemplateFieldTypeBadge({ type }: { type: string }) {
  // "array" types render as a solid charcoal pill; scalar/object types render
  // as outline pills (teal for objects, blue for everything else).
  if (type.startsWith("array")) {
    return (
      <Badge variant="charcoal" className="rounded-full px-2">
        {type}
      </Badge>
    )
  }
  const color =
    type === "object"
      ? "border-[var(--tag-text-teal)] text-[var(--tag-text-teal)]"
      : "border-primary text-primary"
  return (
    <Badge
      variant="secondary"
      className={cn("rounded-full border bg-transparent px-2", color)}
    >
      {type}
    </Badge>
  )
}

function TemplateFieldRow({ field, depth = 0 }: { field: TemplateField; depth?: number }) {
  const [open, setOpen] = React.useState(false)
  const expandable = (field.fields?.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
        {expandable ? (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? `Collapse ${field.name}` : `Expand ${field.name}`}
            className="flex size-4 shrink-0 items-center justify-center"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-90"
              )}
            />
          </button>
        ) : (
          <span className="w-4 shrink-0" aria-hidden />
        )}
        <span className="text-base font-normal text-foreground">{field.name}</span>
        {field.type ? <TemplateFieldTypeBadge type={field.type} /> : null}
        {expandable ? (
          <Badge variant="default" className="rounded-full px-2">
            {field.fields!.length} Nested Fields
          </Badge>
        ) : null}
      </div>
      {field.timeFormats?.length ? (
        <p
          className="text-sm italic text-muted-foreground"
          style={{ paddingLeft: depth * 20 + 24 }}
        >
          Time formats: {field.timeFormats.join(", ")}
        </p>
      ) : null}
      {expandable && open ? (
        <div className="flex flex-col gap-4">
          {field.fields!.map((child) => (
            <TemplateFieldRow key={child.name} field={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function TemplateFieldsView({ fields }: { fields: TemplateField[] }) {
  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => (
        <TemplateFieldRow key={field.name} field={field} />
      ))}
    </div>
  )
}

function buildTemplateCode(template: IntegrationTemplate): string[] {
  return [
    "# Code generated by Panther; DO NOT EDIT. (@generated)",
    `schema: ${template.name}`,
    `description: ${template.description}`,
    `referenceURL: ${template.defaultOutput}`,
    "fields:",
    ...fieldsToYaml(template.fields, 1).split("\n"),
  ]
}

/** The read-only, line-numbered, syntax-highlighted YAML view of a parser. */
function TemplateCodeView({ template }: { template: IntegrationTemplate }) {
  const lines = React.useMemo(() => buildTemplateCode(template), [template])

  return (
    <div className="h-96 overflow-auto rounded border border-grey-700 bg-grey-800 py-1 font-mono text-hint leading-5 text-grey-050">
      {lines.map((line, index) => (
        <div key={`${index}-${line}`} className="flex min-w-max">
          <span className="w-10 shrink-0 border-r border-grey-700 px-2 text-right text-grey-350">
            {index + 1}
          </span>
          <code className="whitespace-pre px-4">
            <HighlightedYamlLine line={line} />
          </code>
        </div>
      ))}
    </div>
  )
}

function TemplateMetadataItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-sm text-foreground">{children}</dd>
    </div>
  )
}

function toTableName(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "integration_template"
  )
}

function TemplateDetailsPanel({
  template,
  onClose,
  className,
}: {
  template: IntegrationTemplate
  onClose: () => void
  className?: string
}) {
  const [destCatalog, setDestCatalog] = React.useState("sec_dev")
  const [destSchema, setDestSchema] = React.useState("default")
  const [tableName, setTableName] = React.useState(() => toTableName(template.name))
  const [selectedVersion, setSelectedVersion] = React.useState(template.version)
  const [detailView, setDetailView] = React.useState<"ui" | "yaml">("ui")

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden bg-background",
        className
      )}
    >
      {template ? (
          <>
            <div className="flex shrink-0 flex-col gap-4 border-b border-input px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="truncate text-lg font-semibold text-foreground">
                    {template.name} {template.version}
                  </h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" size="sm" className="shrink-0 gap-1">
                        Versions
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuRadioGroup
                        value={selectedVersion}
                        onValueChange={setSelectedVersion}
                      >
                        {TEMPLATE_VERSIONS.map((entry) => (
                          <DropdownMenuRadioItem
                            key={entry.version}
                            value={entry.version}
                            className="justify-between gap-4 pr-2"
                          >
                            <span className="text-foreground">{entry.version}</span>
                            <span className="text-hint text-muted-foreground">{entry.date}</span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="default"
                    size="sm"
                    className="shrink-0 gap-1"
                    asChild
                  >
                    <Link
                      href={`/lakewatch/schemas/${encodeURIComponent(template.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View parser
                      <SquareArrowOutUpRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close details"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <Label>Destination table</Label>
                  <p className="text-hint text-muted-foreground">
                    Lakewatch writes events normalized by this template to this table. Change the
                    table name if you&apos;d like.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Select value={destCatalog} onValueChange={setDestCatalog} disabled>
                    <SelectTrigger className="w-full" aria-label="Destination catalog">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sec_sandbox">sec_sandbox</SelectItem>
                      <SelectItem value="sec_dev">sec_dev</SelectItem>
                      <SelectItem value="sec_stag">sec_stag</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">.</span>
                  <Select value={destSchema} onValueChange={setDestSchema}>
                    <SelectTrigger className="w-full" aria-label="Destination schema">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">default</SelectItem>
                      <SelectItem value="bronze">bronze</SelectItem>
                      <SelectItem value="production">production</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">.</span>
                  <Input
                    aria-label="Destination table name"
                    value={tableName}
                    onChange={(event) => setTableName(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {template.kind === "built-in" ? (
                    <>
                      <Badge variant="teal">Databricks managed</Badge>
                      <Badge variant="secondary">Read only</Badge>
                    </>
                  ) : (
                    <>
                      <Badge variant="brown">Custom</Badge>
                      <Badge variant="teal">Editable</Badge>
                    </>
                  )}
                </div>
                {template.kind === "built-in" ? null : (
                  <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={onClose}>
                      Save
                    </Button>
                  </div>
                )}
              </div>
              <Card className="gap-5">
                <p className="text-sm font-semibold text-foreground">
                  {template.description}
                </p>
                <div className="w-60 border-t border-border" />
                <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <TemplateMetadataItem label="Created by">
                    {template.createdBy}
                  </TemplateMetadataItem>
                  <TemplateMetadataItem label="Modified">
                    {template.modified}
                  </TemplateMetadataItem>
                  <TemplateMetadataItem label="Fields">
                    {template.fieldCount}
                  </TemplateMetadataItem>
                  <TemplateMetadataItem label="Default output">
                    <span className="font-mono text-primary">
                      {template.defaultOutput}
                    </span>
                  </TemplateMetadataItem>
                  <TemplateMetadataItem label="Linked datasource">
                    <span className="text-primary">{template.linkedDatasource}</span>
                  </TemplateMetadataItem>
                </dl>
              </Card>

              <Card>
                <div className="flex items-center justify-between gap-4">
                  <SegmentedControl
                    value={detailView}
                    onValueChange={(value) => setDetailView(value as "ui" | "yaml")}
                  >
                    <SegmentedItem value="ui">UI</SegmentedItem>
                    <SegmentedItem value="yaml">YAML</SegmentedItem>
                  </SegmentedControl>
                  {detailView === "yaml" ? (
                    <span className="text-hint text-muted-foreground">
                      {template.editable ? "Editable YAML" : "Read only"}
                    </span>
                  ) : null}
                </div>
                <div className="w-60 border-t border-border" />
                {detailView === "ui" ? (
                  <TemplateFieldsView fields={template.fields} />
                ) : (
                  <TemplateCodeView template={template} />
                )}
              </Card>
            </div>

            <div className="flex shrink-0 justify-end border-t border-input px-6 py-3">
              <Button variant="primary" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        ) : null}
    </div>
  )
}

const CLONE_YAML_PLACEHOLDER = `# Write your fields in YAML here...
# Example:
fields:
  - name: id
    type: string
    description: Unique identifier`

function CloneTemplatePanel({
  base,
  onClose,
  onCreate,
  className,
}: {
  base: IntegrationTemplate
  onClose: () => void
  onCreate: (template: IntegrationTemplate) => void
  className?: string
}) {
  const [templateId, setTemplateId] = React.useState("")
  const [referenceUrl, setReferenceUrl] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [parser, setParser] = React.useState("json")
  const [yaml, setYaml] = React.useState("")
  const [owner, setOwner] = React.useState("team-security@company.com")
  const [environmentTags, setEnvironmentTags] = React.useState("production, staging")
  const [showSample, setShowSample] = React.useState(false)
  const [sampleEvent, setSampleEvent] = React.useState("")

  React.useEffect(() => {
    if (base) {
      setTemplateId(`${base.name}_copy`)
      setReferenceUrl("s3://security-logs-prod/")
      setDescription(base.description)
      setParser("json")
      setYaml("")
      setOwner("team-security@company.com")
      setEnvironmentTags("production, staging")
      setShowSample(false)
      setSampleEvent("")
    }
  }, [base])

  const handleCreate = () => {
    if (!base) return
    const trimmed = templateId.trim() || `${base.name}_copy`
    onCreate({
      id: `clone-${Date.now()}`,
      name: trimmed,
      version: "v1",
      kind: "custom",
      group: "Custom",
      description: description.trim() || base.description,
      modified: TODAY_LABEL,
      fieldCount: 0,
      fields: base.fields,
      defaultOutput: base.defaultOutput,
      linkedDatasource: base.linkedDatasource,
      createdBy: "J. Martinez",
      editable: true,
    })
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden bg-background",
        "animate-in slide-in-from-right-16 fade-in-0 duration-300 ease-out",
        className
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-input px-6 py-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">
            Clone parser
          </h2>
          <p className="text-hint text-muted-foreground">
            Create a new custom template based on this template. The original remains unchanged.
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Close clone" onClick={onClose}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
          <section className="flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Template details</h3>
              <p className="text-hint text-muted-foreground">
                Identify the template and how events are parsed.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="clone-template-id">Template ID</Label>
              <Input
                id="clone-template-id"
                value={templateId}
                onChange={(event) => setTemplateId(event.target.value)}
              />
              <p className="text-hint text-muted-foreground">
                Unique ID for this template. Use letters, numbers, hyphens, and underscores.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="clone-reference-url">Reference URL</Label>
              <ValidatedInput
                id="clone-reference-url"
                value={referenceUrl}
                onChange={(event) => setReferenceUrl(event.target.value)}
              />
              <p className="text-hint text-muted-foreground">
                Optional link to docs, source system, or related ticket.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="clone-description">Description</Label>
              <Textarea
                id="clone-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-16 resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="clone-parser">Parser</Label>
              <Select value={parser} onValueChange={setParser}>
                <SelectTrigger id="clone-parser" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="regex">Regex</SelectItem>
                  <SelectItem value="grok">Grok</SelectItem>
                  <SelectItem value="script">Script</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-hint text-muted-foreground">
                Parse JSON events and map paths to schema fields.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Parser configuration</p>
                <p className="text-hint text-muted-foreground">
                  Map JSON paths to schema fields.
                </p>
              </div>
              <div className="rounded border border-input bg-muted/40 px-3 py-4 text-hint text-muted-foreground">
                JSON parser options will appear here. For this prototype, continue to fields below.
              </div>
            </div>
          </section>

          <div className="h-px bg-border" />

          <section className="flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Fields and indicators</h3>
              <p className="text-hint text-muted-foreground">
                Define the fields and indicators for this template.
              </p>
            </div>

            <div className="flex items-start justify-between gap-3 rounded border border-input bg-muted/40 px-3 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Infer from sample (optional)
                </p>
                <p className="text-hint text-muted-foreground">
                  Open a panel to add a sample JSON event and generate field definitions you can
                  edit below.
                </p>
              </div>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="shrink-0"
                onClick={() => setShowSample((current) => !current)}
              >
                Add sample event
              </Button>
            </div>

            {showSample ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={sampleEvent}
                  onChange={(event) => setSampleEvent(event.target.value)}
                  placeholder={'{"eventName":"GetObject","awsRegion":"us-west-2"}'}
                  spellCheck={false}
                  className="min-h-24 resize-none bg-grey-800 p-3 font-mono text-hint leading-5 text-grey-050"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="self-start"
                  disabled={!sampleEvent.trim()}
                  onClick={() => setYaml(`fields:\n${fieldsToYaml(base.fields)}`)}
                >
                  Generate fields
                </Button>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="clone-yaml">YAML editor</Label>
              <Textarea
                id="clone-yaml"
                value={yaml}
                onChange={(event) => setYaml(event.target.value)}
                placeholder={CLONE_YAML_PLACEHOLDER}
                spellCheck={false}
                className="min-h-48 resize-none bg-grey-800 p-3 font-mono text-hint leading-5 text-grey-050 placeholder:text-grey-400"
              />
            </div>
          </section>

          <div className="h-px bg-border" />

          <section className="flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Ownership</h3>
              <p className="text-hint text-muted-foreground">Owner and environment tags.</p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="clone-owner">Owner</Label>
              <Input
                id="clone-owner"
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="clone-env-tags">Environment tags</Label>
              <Input
                id="clone-env-tags"
                value={environmentTags}
                onChange={(event) => setEnvironmentTags(event.target.value)}
              />
              <p className="text-hint text-muted-foreground">
                Comma-separated tags to scope where this template applies.
              </p>
            </div>
          </section>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-input px-6 py-3">
          <Button variant="default" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            Create clone
          </Button>
        </div>
    </div>
  )
}

function SelectedTemplateCard({
  template,
  pending = false,
  active = false,
  onRemove,
  onViewDetails,
}: {
  template: IntegrationTemplate
  pending?: boolean
  active?: boolean
  onRemove?: () => void
  onViewDetails?: () => void
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-md border bg-card p-4 transition-colors",
        active ? "border-primary ring-1 ring-primary" : "border-border",
        onViewDetails &&
          "cursor-pointer hover:border-primary/60 hover:bg-muted/40 active:bg-primary/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      )}
      {...(onViewDetails
        ? {
            role: "button",
            tabIndex: 0,
            onClick: onViewDetails,
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onViewDetails()
              }
            },
          }
        : {})}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">{template.name}</h4>
          <Badge variant="secondary" className="shrink-0">
            {template.version}
          </Badge>
        </div>
        {onRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Remove ${template.name}`}
            onClick={(event) => {
              event.stopPropagation()
              onRemove()
            }}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        ) : null}
      </div>

      <p className="truncate text-hint text-muted-foreground">
        lakewatch.default.{toTableName(template.name)}
      </p>

      <div className="flex items-center justify-between gap-2">
        {pending ? (
          <Badge variant="secondary" className="w-fit gap-1">
            <LoaderCircle className="size-3 animate-spin" aria-hidden />
            Pending
          </Badge>
        ) : (
          <TemplateKindBadge kind={template.kind} />
        )}
        <div className="flex items-center gap-3">
          <span className="text-hint text-muted-foreground">{template.fieldCount} fields</span>
          {onViewDetails ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`View ${template.name} details`}
              onClick={(event) => {
                event.stopPropagation()
                onViewDetails()
              }}
            >
              <ArrowRight className="h-4 w-4 text-primary" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

type SearchTab = "all" | "built-in" | "custom"

function TemplateSearchDropdown({
  templates,
  selectedIds,
  onToggle,
  onToggleGroup,
  hideCustom = false,
}: {
  templates: IntegrationTemplate[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onToggleGroup: (ids: string[], select: boolean) => void
  hideCustom?: boolean
}) {
  const [tab, setTab] = React.useState<SearchTab>("all")
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({})

  const byTab = templates.filter((template) =>
    tab === "all" ? true : template.kind === tab
  )

  const groups = byTab.reduce<Record<string, IntegrationTemplate[]>>((acc, template) => {
    acc[template.group] = acc[template.group] ?? []
    acc[template.group].push(template)
    return acc
  }, {})
  const groupNames = Object.keys(groups)

  const tabs: { value: SearchTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "built-in", label: "Built-in" },
    ...(hideCustom ? [] : [{ value: "custom" as const, label: "Custom" }]),
  ]

  return (
    <div className="absolute left-0 top-full z-40 mt-1 w-[480px] max-w-full overflow-hidden rounded-md border border-input bg-popover shadow-md">
      <div className="flex items-center justify-between border-b border-input px-3 py-2">
        <div className="flex items-center gap-1">
          {tabs.map((item) => (
            <Button
              key={item.value}
              type="button"
              variant="ghost"
              size="xs"
              className={cn(
                "font-semibold text-muted-foreground hover:text-foreground",
                tab === item.value && "text-primary hover:text-primary"
              )}
              onClick={() => setTab(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <span className="text-hint text-muted-foreground">{byTab.length} templates</span>
      </div>

      <div className="max-h-[320px] overflow-y-auto py-1">
        {groupNames.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No parsers found
          </p>
        ) : (
          groupNames.map((groupName) => {
            const groupTemplates = groups[groupName]
            const groupIds = groupTemplates.map((template) => template.id)
            const allSelected = groupIds.every((id) => selectedIds.includes(id))
            const expanded = expandedGroups[groupName] ?? true
            const groupKind = groupTemplates[0]?.kind ?? "built-in"

            return (
              <div key={groupName}>
                <div className="flex items-center gap-2 px-3 py-2 hover:bg-accent">
                  <Checkbox
                    checked={allSelected}
                    aria-label={`Select all ${groupName} templates`}
                    onCheckedChange={(checked) => onToggleGroup(groupIds, checked === true)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="size-4"
                    aria-label={expanded ? `Collapse ${groupName}` : `Expand ${groupName}`}
                    onClick={() =>
                      setExpandedGroups((current) => ({
                        ...current,
                        [groupName]: !expanded,
                      }))
                    }
                  >
                    {expanded ? (
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-3.5 text-muted-foreground" />
                    )}
                  </Button>
                  <span className="text-sm font-semibold text-foreground">{groupName}</span>
                  <span className="text-hint text-muted-foreground">
                    {groupTemplates.length} templates
                  </span>
                  <div className="ml-auto">
                    <TemplateKindBadge kind={groupKind} />
                  </div>
                </div>

                {expanded
                  ? groupTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center gap-2 py-2 pr-3 pl-9 hover:bg-accent"
                      >
                        <Checkbox
                          checked={selectedIds.includes(template.id)}
                          aria-label={`Select ${template.name}`}
                          onCheckedChange={() => onToggle(template.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{template.name}</p>
                          <p className="truncate text-hint text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                        <TemplateKindBadge kind={template.kind} />
                      </div>
                    ))
                  : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export type IntegrationTemplatesController = ReturnType<typeof useIntegrationTemplates>

export function useIntegrationTemplates(family?: string) {
  const [templates, setTemplates] = React.useState<IntegrationTemplate[]>(() =>
    family ? buildFamilyTemplates(family) : INITIAL_TEMPLATES,
  )
  const [selectedIds, setSelectedIds] = React.useState<string[]>(() =>
    family ? buildFamilyTemplates(family).map((template) => template.id) : [],
  )
  const [detailsId, setDetailsId] = React.useState<string | null>(null)
  const [cloneBase, setCloneBase] = React.useState<IntegrationTemplate | null>(null)

  const templateById = React.useMemo(() => {
    const map = new Map<string, IntegrationTemplate>()
    for (const template of templates) map.set(template.id, template)
    return map
  }, [templates])

  const selectedNames = React.useMemo(
    () =>
      selectedIds
        .map((id) => templateById.get(id)?.name)
        .filter((name): name is string => Boolean(name)),
    [selectedIds, templateById]
  )

  const toggle = React.useCallback((id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }, [])

  const toggleGroup = React.useCallback((ids: string[], select: boolean) => {
    setSelectedIds((current) => {
      if (select) {
        const next = new Set(current)
        for (const id of ids) next.add(id)
        return Array.from(next)
      }
      return current.filter((id) => !ids.includes(id))
    })
  }, [])

  const openDetails = React.useCallback((id: string) => {
    setCloneBase(null)
    setDetailsId(id)
  }, [])

  const openClone = React.useCallback((template: IntegrationTemplate) => {
    setDetailsId(null)
    setCloneBase(template)
  }, [])

  const closePanel = React.useCallback(() => {
    setDetailsId(null)
    setCloneBase(null)
  }, [])

  const createClone = React.useCallback(
    (template: IntegrationTemplate) => {
      const baseId = cloneBase?.id
      setTemplates((current) => [...current, template])
      setSelectedIds((current) =>
        baseId && current.includes(baseId)
          ? current.map((id) => (id === baseId ? template.id : id))
          : [...current, template.id]
      )
      setCloneBase(null)
      setDetailsId(template.id)
    },
    [cloneBase]
  )

  const detailsTemplate = detailsId ? templateById.get(detailsId) ?? null : null
  const panelOpen = Boolean(cloneBase) || Boolean(detailsTemplate)

  return {
    family,
    templates,
    selectedIds,
    detailsId,
    cloneBase,
    templateById,
    selectedNames,
    detailsTemplate,
    panelOpen,
    toggle,
    toggleGroup,
    openDetails,
    openClone,
    closePanel,
    createClone,
  }
}

export function IntegrationTemplatePanel({
  controller,
  className,
}: {
  controller: IntegrationTemplatesController
  className?: string
}) {
  const { cloneBase, detailsTemplate, closePanel, createClone } = controller

  if (cloneBase) {
    return (
      <CloneTemplatePanel
        key={cloneBase.id}
        base={cloneBase}
        onClose={closePanel}
        onCreate={createClone}
        className={className}
      />
    )
  }

  if (detailsTemplate) {
    return (
      <TemplateDetailsPanel
        key={detailsTemplate.id}
        template={detailsTemplate}
        onClose={closePanel}
        className={className}
      />
    )
  }

  return null
}

export function IntegrationTemplatesField({
  controller,
  pendingNames = [],
  hideHeader = false,
  hideCreateCustom = false,
  createCustomHref = "/lakewatch/schemas/new",
}: {
  controller: IntegrationTemplatesController
  pendingNames?: string[]
  hideHeader?: boolean
  hideCreateCustom?: boolean
  /** Destination for the "Create new custom parser" link (may carry query state). */
  createCustomHref?: string
}) {
  const { family, templates, selectedIds, detailsId, templateById, toggle, toggleGroup, openDetails } =
    controller
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [skipTemplates, setSkipTemplates] = React.useState(false)
  const [rawSchema, setRawSchema] = React.useState("default")
  const [rawName, setRawName] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [open])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredTemplates = templates.filter((template) => {
    if (!normalizedQuery) return true
    return (
      template.name.toLowerCase().includes(normalizedQuery) ||
      template.description.toLowerCase().includes(normalizedQuery)
    )
  })

  const selectedTemplates = selectedIds
    .map((id) => templateById.get(id))
    .filter((template): template is IntegrationTemplate => Boolean(template))
  const pendingTemplates = pendingNames.map<IntegrationTemplate>((name) => ({
    id: `pending-${name}`,
    name,
    version: "v1",
    kind: "custom",
    group: "Custom",
    description: "Inferring fields from sample data…",
    modified: TODAY_LABEL,
    fieldCount: 0,
    fields: [],
    defaultOutput: "—",
    linkedDatasource: "—",
    createdBy: "You",
    editable: true,
  }))

  const hasSelection = selectedTemplates.length > 0 || pendingTemplates.length > 0

  return (
    <div className="flex flex-col gap-3">
      {hideHeader ? null : (
        <div>
          <Label>Parsers</Label>
          <p className="text-hint text-muted-foreground">
            Select built-in or custom parsers to structure and validate incoming event data.
          </p>
        </div>
      )}

      <div ref={containerRef} className="relative flex flex-col gap-1">
        <Label htmlFor="template-search" className="font-semibold">
          Search parsers
        </Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="template-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search by name or description"
            className="pl-9"
            autoComplete="off"
          />
          {open ? (
            <TemplateSearchDropdown
              templates={filteredTemplates}
              selectedIds={selectedIds}
              onToggle={toggle}
              onToggleGroup={toggleGroup}
              hideCustom={Boolean(family)}
            />
          ) : null}
        </div>
      </div>

      {hasSelection ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Selected parsers
            </p>
            <span className="text-hint text-muted-foreground">
              {selectedTemplates.length} parsers active
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {pendingTemplates.map((template) => (
              <SelectedTemplateCard key={template.id} template={template} pending />
            ))}
            {selectedTemplates.map((template) => (
              <SelectedTemplateCard
                key={template.id}
                template={template}
                active={detailsId === template.id}
                onRemove={() => toggle(template.id)}
                onViewDetails={() => openDetails(template.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-border bg-muted/40 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-foreground">
            No parsers selected yet
          </p>
          <p className="text-hint text-muted-foreground">
            Use the search above to browse built-in and custom parsers.
          </p>
        </div>
      )}

      {hideCreateCustom ? null : (
        <div>
          <Button
            asChild
            variant="link"
            size="sm"
            className="h-auto gap-1.5 self-start p-0"
          >
            <Link
              href={createCustomHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Create new custom parser
              <SquareArrowOutUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      )}

      {!hasSelection ? (
        <div className="flex flex-col gap-3">
          <label
            htmlFor="skip-ingestion-templates"
            className="flex cursor-pointer items-center gap-2"
          >
            <Checkbox
              id="skip-ingestion-templates"
              checked={skipTemplates}
              onCheckedChange={(value) => setSkipTemplates(value === true)}
            />
            <span className="text-sm text-foreground">
              Skip parsers for now
            </span>
          </label>

          {skipTemplates ? (
            <div className="flex flex-col gap-2">
              <p className="text-hint text-muted-foreground">
                It is recommended that you write this datasource to a raw table you
                define if there are no parsers. Lakewatch uses ingestion
                metadata for recovery and processing.
              </p>
              <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-2">
                <Select value="sec_dev" disabled>
                  <SelectTrigger className="w-full" aria-label="Catalog">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sec_dev">sec_dev</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={rawSchema} onValueChange={setRawSchema}>
                  <SelectTrigger className="w-full" aria-label="Schema">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">default</SelectItem>
                    <SelectItem value="bronze">bronze</SelectItem>
                    <SelectItem value="production">production</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  aria-label="Raw table name"
                  value={rawName}
                  onChange={(event) => setRawName(event.target.value)}
                  placeholder="raw_table_name"
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

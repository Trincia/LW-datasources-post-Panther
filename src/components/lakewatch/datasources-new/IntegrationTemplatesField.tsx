"use client"

import * as React from "react"
import { ArrowRight, ChevronDown, ChevronRight, LoaderCircle, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const TODAY_LABEL = "Aug 9, 2026"

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

function FieldTreeNode({ field, depth }: { field: TemplateField; depth: number }) {
  const hasChildren = Boolean(field.fields && field.fields.length > 0)
  const [open, setOpen] = React.useState(depth === 0)
  const isObject = field.type === "object"

  return (
    <div>
      <div
        className="flex items-center gap-1.5 border-b border-input py-2"
        style={{ paddingLeft: depth * 20 }}
      >
        {isObject ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-4"
            aria-label={open ? `Collapse ${field.name}` : `Expand ${field.name}`}
            disabled={!hasChildren}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
          </Button>
        ) : (
          <span className="inline-block size-4 shrink-0" aria-hidden />
        )}
        <span className="text-sm font-semibold text-foreground">{field.name}</span>
        <span className="text-sm text-muted-foreground">({field.type})</span>
      </div>
      {hasChildren && open
        ? field.fields!.map((child) => (
            <FieldTreeNode key={child.name} field={child} depth={depth + 1} />
          ))
        : null}
    </div>
  )
}

function TemplateMetaRow({ template }: { template: IntegrationTemplate }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-hint text-muted-foreground">
        Created by {template.createdBy} · Modified {template.modified}
      </p>
      <p className="text-sm text-foreground">
        Default output:{" "}
        <span className="font-mono text-primary">{template.defaultOutput}</span>
      </p>
      <p className="text-sm text-foreground">
        Linked datasource:{" "}
        <span className="text-primary">{template.linkedDatasource}</span>
      </p>
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
  onClone,
  className,
}: {
  template: IntegrationTemplate
  onClose: () => void
  onClone: (template: IntegrationTemplate) => void
  className?: string
}) {
  const [destCatalog, setDestCatalog] = React.useState("lakewatch")
  const [destSchema, setDestSchema] = React.useState("default")
  const [tableName, setTableName] = React.useState(() => toTableName(template.name))

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
                <h2 className="text-lg font-semibold text-foreground">
                  {template.name} {template.version}
                </h2>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close details"
                  onClick={onClose}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
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
                  <Select value={destCatalog} onValueChange={setDestCatalog}>
                    <SelectTrigger className="w-full" aria-label="Destination catalog">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lakewatch">lakewatch</SelectItem>
                      <SelectItem value="main">main</SelectItem>
                      <SelectItem value="security">security</SelectItem>
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
                <p className="text-hint text-muted-foreground">
                  {destCatalog}.{destSchema}.{tableName || "table_name"}
                </p>
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
                {template.kind === "built-in" ? (
                  <Button variant="primary" size="sm" onClick={() => onClone(template)}>
                    Clone template
                  </Button>
                ) : (
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
              <TemplateMetaRow template={template} />

              <div className="overflow-hidden rounded-md border border-input">
                <Tabs defaultValue="contract" className="gap-0">
                  <TabsList
                    variant="line"
                    className="h-auto shrink-0 border-b border-input pt-2 data-[variant=line]:px-4"
                  >
                    <TabsTrigger value="contract">Contract</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  </TabsList>

                  <TabsContent value="contract" className="px-4 py-4">
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      Template fields
                    </h3>
                    {template.editable ? (
                      <pre className="overflow-auto whitespace-pre rounded border border-input bg-grey-800 p-3 font-mono text-hint leading-5 text-grey-050">
                        {`fields:\n${fieldsToYaml(template.fields)}`}
                      </pre>
                    ) : (
                      <div>
                        {template.fields.map((field) => (
                          <FieldTreeNode key={field.name} field={field} depth={0} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="metadata" className="px-4 py-4">
                    <dl className="grid grid-cols-[160px_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
                      <dt className="text-muted-foreground">Version</dt>
                      <dd className="text-foreground">{template.version}</dd>
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="text-foreground">
                        {template.kind === "built-in" ? "Built-in" : "Custom"}
                      </dd>
                      <dt className="text-muted-foreground">Fields</dt>
                      <dd className="text-foreground">{template.fieldCount}</dd>
                      <dt className="text-muted-foreground">Created by</dt>
                      <dd className="text-foreground">{template.createdBy}</dd>
                      <dt className="text-muted-foreground">Modified</dt>
                      <dd className="text-foreground">{template.modified}</dd>
                      <dt className="text-muted-foreground">Default output</dt>
                      <dd className="font-mono text-primary">{template.defaultOutput}</dd>
                      <dt className="text-muted-foreground">Linked datasource</dt>
                      <dd className="text-primary">{template.linkedDatasource}</dd>
                    </dl>
                  </TabsContent>
                </Tabs>
              </div>
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
  const [fieldDiscovery, setFieldDiscovery] = React.useState(true)
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
      setFieldDiscovery(true)
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
        className
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-input px-6 py-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">
            Clone ingestion template
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
              <Input
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
              <div className="flex items-center gap-2">
                <Switch
                  id="clone-field-discovery"
                  size="sm"
                  checked={fieldDiscovery}
                  onCheckedChange={setFieldDiscovery}
                />
                <Label htmlFor="clone-field-discovery" className="font-normal">
                  Field discovery
                </Label>
              </div>
              <p className="text-hint text-muted-foreground">
                Keep fields that aren&apos;t in the schema so you can still query and detect on them.
              </p>
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
        "relative flex flex-col gap-2 rounded-md border bg-card p-4",
        active ? "border-primary ring-1 ring-primary" : "border-border"
      )}
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
            onClick={onRemove}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        {pending ? (
          <Badge variant="secondary" className="w-fit gap-1">
            <LoaderCircle className="size-3 animate-spin" aria-hidden />
            Pending
          </Badge>
        ) : (
          <TemplateKindBadge kind={template.kind} />
        )}
        <span className="text-hint text-muted-foreground">{template.fieldCount} fields</span>
      </div>

      {onViewDetails ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto self-start px-0 py-0 font-normal text-primary hover:bg-transparent hover:text-primary"
          onClick={onViewDetails}
        >
          View details
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}

type SearchTab = "all" | "built-in" | "custom"

function TemplateSearchDropdown({
  templates,
  selectedIds,
  onToggle,
  onToggleGroup,
}: {
  templates: IntegrationTemplate[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onToggleGroup: (ids: string[], select: boolean) => void
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
    { value: "custom", label: "Custom" },
  ]

  return (
    <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-md border border-input bg-popover shadow-md">
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
            No ingestion templates found
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

export function useIntegrationTemplates() {
  const [templates, setTemplates] = React.useState<IntegrationTemplate[]>(INITIAL_TEMPLATES)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
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

  const createClone = React.useCallback((template: IntegrationTemplate) => {
    setTemplates((current) => [...current, template])
    setSelectedIds((current) => [...current, template.id])
    setCloneBase(null)
    setDetailsId(template.id)
  }, [])

  const detailsTemplate = detailsId ? templateById.get(detailsId) ?? null : null
  const panelOpen = Boolean(cloneBase) || Boolean(detailsTemplate)

  return {
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
  const { cloneBase, detailsTemplate, closePanel, openClone, createClone } = controller

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
        onClone={openClone}
        className={className}
      />
    )
  }

  return null
}

export function IntegrationTemplatesField({
  controller,
  pendingNames = [],
}: {
  controller: IntegrationTemplatesController
  pendingNames?: string[]
}) {
  const { templates, selectedIds, detailsId, templateById, toggle, toggleGroup, openDetails } =
    controller
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
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
      <div>
        <Label>Ingestion templates (optional)</Label>
        <p className="text-hint text-muted-foreground">
          Select built-in or custom ingestion templates to structure and validate incoming event data.
        </p>
      </div>

      <div ref={containerRef} className="relative flex flex-col gap-1">
        <Label htmlFor="template-search" className="font-semibold">
          Search ingestion templates
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
            />
          ) : null}
        </div>
      </div>

      {hasSelection ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Selected ingestion templates
            </p>
            <span className="text-hint text-muted-foreground">
              {selectedTemplates.length} ingestion templates active
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
            No ingestion templates selected yet
          </p>
          <p className="text-hint text-muted-foreground">
            Use the search above to browse built-in and custom ingestion templates.
          </p>
        </div>
      )}
    </div>
  )
}

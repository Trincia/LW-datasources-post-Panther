"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { SquareArrowOutUpRight } from "lucide-react"

import {
  LinkIcon,
  PencilIcon,
} from "@/components/icons"
import { LakewatchWarehouseSelector } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { SchemaPreviewPanel } from "@/components/lakewatch/schemas/SchemaPreviewPanel"
import { buildVersions } from "@/components/lakewatch/schemas/schemaVersions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  readCustomSchemas,
  saveCustomSchema,
} from "@/components/lakewatch/schemas/schemaStorage"

type FieldTag = {
  label: string
  variant: "default_tag" | "coral" | "indigo" | "lime" | "teal"
}

type SchemaField = {
  name: string
  description: string
  tags: FieldTag[]
}

type SchemaDetails = {
  description: string
  docsUrl: string
  fieldDiscovery: "Enabled" | "Disabled"
  datasourceCount: number
  fields: SchemaField[]
}

const DEFAULT_FIELDS: SchemaField[] = [
  {
    name: "eventType",
    description: "The normalized type of event represented by this record.",
    tags: [
      { label: "Tag", variant: "coral" },
      { label: "Tag", variant: "indigo" },
    ],
  },
  {
    name: "actor",
    description: "The actor responsible for the event.",
    tags: [{ label: "Tag", variant: "teal" }],
  },
  {
    name: "source",
    description: "The source system that generated the event.",
    tags: [{ label: "Tag", variant: "lime" }],
  },
]

const SCHEMA_DETAILS: Record<string, SchemaDetails> = {
  "AlphaSOC.Alert": {
    description: "AlphaSOC Alert (https://alphasoc.com/)",
    docsUrl: "https://docs.alphasoc.com/api/#alert",
    fieldDiscovery: "Enabled",
    datasourceCount: 1,
    fields: [
      {
        name: "eventType",
        description: "EventType describes type of event object ('dns', 'ip', 'http', 'tls').",
        tags: [
          { label: "Tag", variant: "coral" },
          { label: "Tag", variant: "indigo" },
        ],
      },
      {
        name: "detections",
        description: "Associated detections.",
        tags: [
          { label: "Tag", variant: "coral" },
          { label: "Tag", variant: "teal" },
        ],
      },
      {
        name: "threats",
        description: "Threats associated with alert.",
        tags: [{ label: "array", variant: "default_tag" }],
      },
      {
        name: "wisdom",
        description: "Wisdom context of alert.",
        tags: [
          { label: "Tag", variant: "lime" },
          { label: "Tag", variant: "indigo" },
        ],
      },
    ],
  },
  "Amazon.EKS.Audit": {
    description: "Kubernetes audit logs provide a record of users and administrators.",
    docsUrl: "https://docs.aws.amazon.com/eks/latest/userguide/control-plane-logs.html",
    fieldDiscovery: "Enabled",
    datasourceCount: 4,
    fields: [
      {
        name: "auditID",
        description: "Unique identifier for the Kubernetes audit event.",
        tags: [{ label: "Tag", variant: "indigo" }],
      },
      {
        name: "objectRef",
        description: "Reference to the Kubernetes object involved in the request.",
        tags: [{ label: "Tag", variant: "teal" }],
      },
      {
        name: "responseStatus",
        description: "Status returned by the Kubernetes API server.",
        tags: [{ label: "Tag", variant: "lime" }],
      },
    ],
  },
  "Amazon.EKS.Authenticator": {
    description: "Amazon EKS control plane authenticator logs.",
    docsUrl: "https://docs.aws.amazon.com/eks/latest/userguide/control-plane-logs.html",
    fieldDiscovery: "Enabled",
    datasourceCount: 5,
    fields: DEFAULT_FIELDS,
  },
  "Anomali.Indicator": {
    description: "Indicators of Compromise from Anomali ThreatStream platform.",
    docsUrl: "https://www.anomali.com/products/threatstream",
    fieldDiscovery: "Disabled",
    datasourceCount: 1,
    fields: DEFAULT_FIELDS,
  },
  "Anthropic.Activity": {
    description: "Compliance activity log from Anthropic API.",
    docsUrl: "https://docs.anthropic.com/",
    fieldDiscovery: "Enabled",
    datasourceCount: 7,
    fields: DEFAULT_FIELDS,
  },
  "Anthropic.Claude.Telemetry": {
    description: "Claude Code and Cowork telemetry events emitted by the tool.",
    docsUrl: "https://docs.anthropic.com/",
    fieldDiscovery: "Enabled",
    datasourceCount: 3,
    fields: DEFAULT_FIELDS,
  },
  "Apache.AccessCombined": {
    description: "Apache HTTP server access logs using the combined format.",
    docsUrl: "https://httpd.apache.org/docs/current/logs.html",
    fieldDiscovery: "Enabled",
    datasourceCount: 11,
    fields: [
      {
        name: "clientIp",
        description: "IP address of the client making the request.",
        tags: [{ label: "Tag", variant: "indigo" }],
      },
      {
        name: "request",
        description: "HTTP request method, resource, and protocol.",
        tags: [{ label: "Tag", variant: "teal" }],
      },
      {
        name: "status",
        description: "HTTP response status code.",
        tags: [{ label: "Tag", variant: "lime" }],
      },
      {
        name: "userAgent",
        description: "User agent supplied by the requesting client.",
        tags: [{ label: "Tag", variant: "coral" }],
      },
    ],
  },
}

function MetadataItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  )
}

function buildSchemaCode(schemaName: string, details: SchemaDetails) {
  const lines = [
    "# Code generated by Panther; DO NOT EDIT. (@generated)",
    `schema: ${schemaName}`,
    `description: ${details.description}`,
    `referenceURL: ${details.docsUrl}`,
    "fields:",
    "  - name: event",
    "    required: true",
    "    description: One of the Event schemas.",
    "    type: object",
    "    fields:",
  ]

  details.fields.forEach((field) => {
    lines.push(`      - name: ${field.name}`)
    lines.push(`        description: ${field.description}`)
    lines.push("        type: string")
    if (field.tags.length > 0) {
      lines.push("        indicators:")
      field.tags.forEach((tag) => lines.push(`          - ${tag.label.toLowerCase()}`))
    }
  })

  return lines
}

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

function SchemaCodeView({
  schemaName,
  details,
}: {
  schemaName: string
  details: SchemaDetails
}) {
  const lines = React.useMemo(() => buildSchemaCode(schemaName, details), [details, schemaName])

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

function EditableSchemaYaml({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      spellCheck={false}
      aria-label="Schema YAML"
      className="h-96 w-full resize-none overflow-auto whitespace-pre rounded border border-grey-700 bg-grey-800 px-4 py-2 font-mono text-hint leading-5 text-grey-050 outline-none focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring"
    />
  )
}

export function LakewatchSchemaDetailView({
  cloneMode = false,
  editMode = false,
}: {
  cloneMode?: boolean
  editMode?: boolean
}) {
  const params = useParams<{ schemaName: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const schemaName = decodeURIComponent(params.schemaName ?? "AlphaSOC.Alert")
  const formMode = cloneMode || editMode
  // Opened from a datasource's Ingestion templates tab: show it read-only with
  // the sample data preview docked at the bottom, and no clone/edit actions.
  const fromDatasource = !formMode && searchParams.get("from") === "datasource"
  const [isCustom, setIsCustom] = React.useState(false)

  React.useEffect(() => {
    const stored = readCustomSchemas().some((schema) => schema.name === schemaName)
    setIsCustom(stored || schemaName.startsWith("Custom."))
  }, [schemaName])
  const details =
    SCHEMA_DETAILS[schemaName] ??
    ({
      description: `${schemaName} schema`,
      docsUrl: "https://docs.databricks.com/",
      fieldDiscovery: "Enabled",
      datasourceCount: 0,
      fields: DEFAULT_FIELDS,
    } satisfies SchemaDetails)
  const [schemaYaml, setSchemaYaml] = React.useState(() =>
    buildSchemaCode(schemaName, details)
      .filter((line) => !line.includes("@generated"))
      .join("\n"),
  )
  const [cloneName, setCloneName] = React.useState(() =>
    editMode ? schemaName : `Custom.${schemaName.replace(/[^a-zA-Z0-9]/g, "")}Copy`,
  )
  const versions = React.useMemo(() => buildVersions(schemaName), [schemaName])
  const [selectedVersion, setSelectedVersion] = React.useState(versions[0].version)
  const [editingCloneName, setEditingCloneName] = React.useState(false)
  const [cloneDescription, setCloneDescription] = React.useState(details.description)
  const [cloneReferenceUrl, setCloneReferenceUrl] = React.useState(details.docsUrl)

  const handleSaveClone = () => {
    const name = cloneName.trim()
    if (!name) return

    saveCustomSchema({
      name,
      description: cloneDescription,
      managedBy: "User",
      fieldDiscovery: "Enabled",
      datasourceCount: 0,
    })
    router.push(`/lakewatch/schemas?created=${encodeURIComponent(name)}`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-10 pb-12 pt-8">
      <div className="flex items-start justify-between gap-6">
        {formMode ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {editingCloneName ? (
              <Input
                value={cloneName}
                onChange={(event) => setCloneName(event.target.value)}
                onBlur={() => setEditingCloneName(false)}
                autoFocus
                aria-label={editMode ? "Ingestion template name" : "Cloned schema name"}
                className="max-w-sm"
              />
            ) : (
              <>
                <h1 className="truncate text-2xl font-semibold leading-10 text-foreground">
                  {cloneName}
                </h1>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={editMode ? "Edit ingestion template name" : "Edit cloned schema name"}
                  onClick={() => setEditingCloneName(true)}
                >
                  <PencilIcon size={14} className="text-muted-foreground" />
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-6">
              <h1 className="truncate text-2xl font-semibold leading-10 text-foreground">
                {schemaName}
              </h1>
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="w-[92px]" aria-label="Version">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((item) => (
                    <SelectItem key={item.version} value={item.version}>
                      {item.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isCustom ? (
              <Badge variant="brown" className="text-hint uppercase">
                Custom
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="default_tag" className="text-hint uppercase">
                  Panther managed
                </Badge>
                <Badge variant="secondary" className="text-hint uppercase">
                  Read only
                </Badge>
              </div>
            )}
          </div>
        )}
        <div className="flex shrink-0 items-center gap-2">
          {formMode ? (
            <>
              <Button variant="default" size="sm" asChild>
                <Link href={`/lakewatch/schemas/${encodeURIComponent(schemaName)}`}>
                  Cancel
                </Link>
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveClone}>
                Save
              </Button>
            </>
          ) : fromDatasource ? null : (
            <>
              {isCustom ? (
                <Button variant="default" size="sm" asChild>
                  <Link href={`/lakewatch/schemas/${encodeURIComponent(schemaName)}/edit`}>
                    Clone & edit
                  </Link>
                </Button>
              ) : null}
              <LakewatchWarehouseSelector />
              <Button variant="primary" size="sm" asChild>
                <Link
                  href={`/lakewatch/schemas/${encodeURIComponent(schemaName)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View template
                  <SquareArrowOutUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {formMode ? (
        <Card className="gap-4">
          <h2 className="text-sm font-semibold text-foreground">Basic Info</h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="clone-description">Description</Label>
            <Textarea
              id="clone-description"
              value={cloneDescription}
              onChange={(event) => setCloneDescription(event.target.value)}
              className="min-h-16 resize-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="clone-reference-url">Reference URL</Label>
            <Input
              id="clone-reference-url"
              type="url"
              value={cloneReferenceUrl}
              onChange={(event) => setCloneReferenceUrl(event.target.value)}
            />
          </div>
        </Card>
      ) : (
        <Card className="gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">{details.description}</p>
            <Link
              href={details.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-fit items-center gap-1 text-sm text-primary hover:underline"
            >
              <LinkIcon size={16} aria-hidden />
              {details.docsUrl}
            </Link>
          </div>
          <div className="w-60 border-t border-border" />
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <MetadataItem label="Created">
              <span className="font-mono font-medium">2024-12-13 21:11 UTC</span>
            </MetadataItem>
            <MetadataItem label="Last Modified">
              <span className="font-mono font-medium">2026-07-28 18:12 UTC</span>
            </MetadataItem>
            <MetadataItem label="Used in">
              <span className="font-semibold">
                {details.datasourceCount}{" "}
                {details.datasourceCount === 1 ? "Log Source" : "Log Sources"}
              </span>
            </MetadataItem>
          </dl>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-end gap-4">
          {isCustom && !fromDatasource ? (
            <span className="text-hint text-muted-foreground">Editable YAML</span>
          ) : (
            <span className="text-hint text-muted-foreground">Read only</span>
          )}
        </div>
        <div className="w-60 border-t border-border" />
        {isCustom && !fromDatasource ? (
          <EditableSchemaYaml value={schemaYaml} onChange={setSchemaYaml} />
        ) : (
          <SchemaCodeView schemaName={schemaName} details={details} />
        )}
      </Card>
    </div>
      {fromDatasource ? <SchemaPreviewPanel /> : null}
    </div>
  )
}

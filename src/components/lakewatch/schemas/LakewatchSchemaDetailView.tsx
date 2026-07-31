"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import {
  BranchIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CodeIcon,
  LinkIcon,
  PencilIcon,
} from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { saveCustomSchema } from "@/components/lakewatch/schemas/schemaStorage"

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

function FieldRow({ field }: { field: SchemaField }) {
  return (
    <div className="flex flex-col pb-4">
      <div className="flex items-center gap-2">
        <ChevronRightIcon size={16} className="text-muted-foreground" aria-hidden />
        <span className="font-mono text-sm font-medium text-foreground">{field.name}</span>
        {field.tags.map((tag, index) => (
          <Badge key={`${field.name}-${tag.label}-${index}`} variant={tag.variant}>
            {tag.label}
          </Badge>
        ))}
      </div>
      <p className="pl-6 pt-1 text-sm text-muted-foreground">{field.description}</p>
    </div>
  )
}

function buildSchemaCode(schemaName: string, details: SchemaDetails) {
  const lines = [
    "# Code generated by Panther; DO NOT EDIT. (@generated)",
    `schema: ${schemaName}`,
    `description: ${details.description}`,
    `referenceURL: ${details.docsUrl}`,
    `fieldDiscoveryEnabled: ${details.fieldDiscovery === "Enabled"}`,
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

export function LakewatchSchemaDetailView({ cloneMode = false }: { cloneMode?: boolean }) {
  const params = useParams<{ schemaName: string }>()
  const router = useRouter()
  const schemaName = decodeURIComponent(params.schemaName ?? "AlphaSOC.Alert")
  const details =
    SCHEMA_DETAILS[schemaName] ??
    ({
      description: `${schemaName} schema`,
      docsUrl: "https://docs.databricks.com/",
      fieldDiscovery: "Enabled",
      datasourceCount: 0,
      fields: DEFAULT_FIELDS,
    } satisfies SchemaDetails)
  const [showDiscoveredFields, setShowDiscoveredFields] = React.useState(true)
  const [eventExpanded, setEventExpanded] = React.useState(true)
  const [schemaView, setSchemaView] = React.useState<"tree" | "code">("tree")
  const [cloneName, setCloneName] = React.useState(
    () => `Custom.${schemaName.replace(/[^a-zA-Z0-9]/g, "")}Copy`,
  )
  const [editingCloneName, setEditingCloneName] = React.useState(false)
  const [cloneDescription, setCloneDescription] = React.useState(details.description)
  const [cloneReferenceUrl, setCloneReferenceUrl] = React.useState(details.docsUrl)
  const [cloneFieldDiscovery, setCloneFieldDiscovery] = React.useState(
    details.fieldDiscovery === "Enabled",
  )

  const handleSaveClone = () => {
    const name = cloneName.trim()
    if (!name) return

    saveCustomSchema({
      name,
      description: cloneDescription,
      managedBy: "User",
      fieldDiscovery: cloneFieldDiscovery ? "Enabled" : "Disabled",
      datasourceCount: 0,
    })
    router.push(`/lakewatch/schemas?created=${encodeURIComponent(name)}`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-10 pb-12 pt-8">
      <div className="flex items-center justify-between gap-6">
        {cloneMode ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {editingCloneName ? (
              <Input
                value={cloneName}
                onChange={(event) => setCloneName(event.target.value)}
                onBlur={() => setEditingCloneName(false)}
                autoFocus
                aria-label="Cloned schema name"
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
                  aria-label="Edit cloned schema name"
                  onClick={() => setEditingCloneName(true)}
                >
                  <PencilIcon size={14} className="text-muted-foreground" />
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="truncate text-2xl font-semibold leading-10 text-foreground">
              {schemaName}
            </h1>
            <Badge variant="default_tag" className="text-hint uppercase">
              Panther managed
            </Badge>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-2">
          {cloneMode ? (
            <>
              <Button type="button" variant="default" size="sm">
                Upload Sample Logs
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href={`/lakewatch/schemas/${encodeURIComponent(schemaName)}`}>
                  Cancel
                </Link>
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveClone}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="default" size="sm">
                Test Schema
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href={`/lakewatch/schemas/${encodeURIComponent(schemaName)}/clone`}>
                  Clone
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {cloneMode ? (
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
          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="clone-field-discovery">Field Discovery</Label>
              <Switch
                id="clone-field-discovery"
                size="sm"
                checked={cloneFieldDiscovery}
                onCheckedChange={setCloneFieldDiscovery}
              />
            </div>
            <p className="mt-2 text-hint leading-4 text-muted-foreground">
              By enabling this feature, Panther will not drop any fields from an event that
              aren&apos;t included in the schema. This allows you to query all the fields, and
              also lets detections access them. To find out more about AFD you can{" "}
              <Link href="#" className="text-primary hover:underline">
                read our documentation
              </Link>
              .
            </p>
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
            <MetadataItem label="Field Discovery">
              <Badge
                variant={details.fieldDiscovery === "Enabled" ? "lime" : "default_tag"}
              >
                {details.fieldDiscovery}
              </Badge>
            </MetadataItem>
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Show Discovered Fields</span>
            <Switch
              size="sm"
              checked={showDiscoveredFields}
              onCheckedChange={setShowDiscoveredFields}
              aria-label="Show discovered fields"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Show schema tree"
              aria-pressed={schemaView === "tree"}
              className={schemaView === "tree" ? "bg-muted text-foreground" : undefined}
              onClick={() => setSchemaView("tree")}
            >
              <BranchIcon
                size={16}
                className={schemaView === "tree" ? "text-foreground" : "text-muted-foreground"}
              />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Show schema code"
              aria-pressed={schemaView === "code"}
              className={schemaView === "code" ? "bg-muted text-foreground" : undefined}
              onClick={() => setSchemaView("code")}
            >
              <CodeIcon
                size={16}
                className={schemaView === "code" ? "text-foreground" : "text-muted-foreground"}
              />
            </Button>
          </div>
        </div>
        <div className="w-60 border-t border-border" />
        {schemaView === "tree" ? (
          <div className="rounded border border-border bg-muted p-6">
            <div className="flex flex-col pb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={eventExpanded ? "Collapse event fields" : "Expand event fields"}
                  onClick={() => setEventExpanded((expanded) => !expanded)}
                  className="-ml-1"
                >
                  {eventExpanded ? (
                    <ChevronDownIcon size={16} className="text-muted-foreground" />
                  ) : (
                    <ChevronRightIcon size={16} className="text-muted-foreground" />
                  )}
                </Button>
                <span className="font-mono text-sm font-medium text-foreground">event</span>
                <Badge variant="coral">Tag</Badge>
                <Badge variant="lime">Tag</Badge>
                <Badge variant="indigo">Tag</Badge>
              </div>
              <p className="pl-6 pt-1 text-sm text-muted-foreground">
                One of the Event schemas.
              </p>
            </div>
            {eventExpanded && showDiscoveredFields ? (
              <div className="pl-6">
                {details.fields.map((field) => (
                  <FieldRow key={field.name} field={field} />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <SchemaCodeView schemaName={schemaName} details={details} />
        )}
      </Card>
    </div>
  )
}

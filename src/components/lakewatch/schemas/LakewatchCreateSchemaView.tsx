"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react"

import { SchemaPreviewPanel } from "@/components/lakewatch/schemas/SchemaPreviewPanel"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { saveCustomSchema } from "@/components/lakewatch/schemas/schemaStorage"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
import { cn } from "@/lib/utils"

const SCHEMA_EMPTY_STATE = `# Write your fields in YAML here...
# Example:
fields:
  - name: id
    type: string
    description: Unique identifier`

const SAMPLE_SCHEMA_ID = "Custom.AcmeAuthService"

const SAMPLE_DESCRIPTION =
  "Parses authentication, token generation, and login audit events emitted by the internal Acme IAM microservice. Inferred from structured JSON payload samples."

const SAMPLE_SCHEMA_DEFINITION = `schema: Custom.AcmeAuthService
description: Authentication and login audit events from the Acme IAM service.
fields:
  - name: timestamp
    type: timestamp
    required: true
    isEventTime: true
    timeFormats:
      - rfc3339
  - name: event_type
    type: string
    required: true
    description: One of login, logout, token_issued, mfa_challenge.
  - name: outcome
    type: string
    description: success or failure.
  - name: actor
    type: object
    fields:
      - name: user_id
        type: string
      - name: email
        type: string
  - name: source_ip
    type: string
  - name: user_agent
    type: string
  - name: session_id
    type: string
indicators:
  - name: source_ip
    type: ip
  - name: actor.email
    type: email
  - name: actor.user_id
    type: username`

function CodeEditor({
  label,
  description,
  value,
  onChange,
  placeholder,
  minHeight = "min-h-80",
  onActivate,
}: {
  label: string
  description: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  minHeight?: string
  onActivate?: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-hint leading-4 text-muted-foreground">{description}</p>
      </div>
      <div className={`relative ${minHeight}`}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 border-r border-grey-700 bg-grey-800 px-2 py-2 text-right font-mono text-hint text-grey-350"
        >
          1
        </span>
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onActivate}
          onClick={onActivate}
          placeholder={placeholder}
          spellCheck={false}
          className={`${minHeight} resize-none rounded border border-grey-700 bg-grey-800 py-2 pr-4 pl-12 font-mono text-hint leading-5 text-grey-050 shadow-none placeholder:text-blue-400 placeholder:opacity-100 focus-visible:ring-2 focus-visible:ring-ring`}
        />
      </div>
    </div>
  )
}

function SchemaTagsField() {
  const [open, setOpen] = React.useState(false)
  const [rows, setRows] = React.useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ])

  const updateRow = (index: number, field: "key" | "value", value: string) => {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    )
  }

  const addRow = () => {
    setRows((current) => [...current, { key: "", value: "" }])
  }

  const removeRow = (index: number) => {
    setRows((current) => current.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto self-start gap-1 p-0"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        Tags (optional)
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </Button>
      {open ? (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <span className="text-hint text-muted-foreground">Key</span>
            <span className="text-hint text-muted-foreground">Value</span>
            <span className="w-8" aria-hidden />
          </div>
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"
            >
              <Input
                aria-label={`Tag key ${index + 1}`}
                value={row.key}
                onChange={(event) => updateRow(index, "key", event.target.value)}
                placeholder="Key"
              />
              <Input
                aria-label={`Tag value ${index + 1}`}
                value={row.value}
                onChange={(event) => updateRow(index, "value", event.target.value)}
                placeholder="Value"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove tag ${index + 1}`}
                onClick={() => removeRow(index)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Add tag"
            className="self-start"
            onClick={addRow}
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function LakewatchCreateSchemaView() {
  const router = useRouter()
  const [schemaId, setSchemaId] = React.useState("")
  const [destSchema, setDestSchema] = React.useState("default")
  const [description, setDescription] = React.useState("")
  const [schemaDefinition, setSchemaDefinition] = React.useState("")
  const [previewOpen, setPreviewOpen] = React.useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = schemaId.trim()
    if (!name) return

    saveCustomSchema({
      name,
      description: description.trim() || `${name} schema`,
      managedBy: "User",
      fieldDiscovery: "Enabled",
      datasourceCount: 0,
    })
    router.push(`/lakewatch/schemas?created=${encodeURIComponent(name)}`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-10 pb-10 pt-0"
    >
      <div className="sticky top-0 z-10 -mx-10 flex items-start justify-between gap-4 bg-background px-10 pt-6 pb-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/lakewatch/schemas">Ingestion template</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create new ingestion template</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className={PAGE_TITLE_SEMIBOLD}>Create new ingestion template</h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button variant="default" size="sm" asChild>
            <Link href="/lakewatch/schemas">Cancel</Link>
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-[960px] flex-col items-center gap-4">
      <Card className="w-full max-w-[631px] gap-6 p-6 shadow-none">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold leading-6 text-foreground">General Info</h2>

          <div className="flex flex-col gap-2">
            <Label htmlFor="schema-id">Name</Label>
            <div className="flex items-center gap-1">
              <Select value="lakewatch" disabled>
                <SelectTrigger className="w-full" aria-label="Catalog">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lakewatch">lakewatch</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">.</span>
              <Select value={destSchema} onValueChange={setDestSchema}>
                <SelectTrigger className="w-full" aria-label="Schema">
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
                id="schema-id"
                aria-label="Name"
                placeholder={SAMPLE_SCHEMA_ID}
                value={schemaId}
                onChange={(event) => setSchemaId(event.target.value)}
                onFocus={() => {
                  if (!schemaId) setSchemaId(SAMPLE_SCHEMA_ID)
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="schema-description">Description</Label>
            <Textarea
              id="schema-description"
              placeholder="Ingestion template description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onFocus={() => {
                if (!description) setDescription(SAMPLE_DESCRIPTION)
              }}
              className="min-h-16 resize-none"
            />
          </div>

          <SchemaTagsField />
        </section>

        <section className="flex flex-col gap-2">
          <CodeEditor
            label="Fields & Indicators"
            description="Define and edit the fields and indicators of your ingestion template."
            value={schemaDefinition}
            onChange={setSchemaDefinition}
            placeholder={SCHEMA_EMPTY_STATE}
            onActivate={() => {
              if (!schemaDefinition.trim())
                setSchemaDefinition(SAMPLE_SCHEMA_DEFINITION)
            }}
          />
        </section>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setPreviewOpen((current) => !current)}
          >
            Results preview
          </Button>
        </div>
      </Card>
      </div>
    </form>

      {previewOpen ? <SchemaPreviewPanel /> : null}
    </div>
  )
}

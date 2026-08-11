"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Plus, X } from "lucide-react"

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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type ParserType = "json" | "script" | "regex"
type RegexPair = { first: string; second: string }

const SCHEMA_EMPTY_STATE = `# Write your fields in YAML here...
# Example:
fields:
  - name: id
    type: string
    description: Unique identifier`

const STARLARK_DEFAULT = `def parse(log):
  # Implement logic
  return {}`

const SAMPLE_SCHEMA_ID = "Custom.AcmeAuthService"

const TAG_TYPE_OPTIONS = [
  "ip",
  "domain",
  "url",
  "email",
  "username",
  "hostname",
  "mac_address",
  "aws_arn",
  "aws_account_id",
  "aws_instance_id",
  "sha256",
  "sha1",
  "md5",
  "trace_id",
  "actor_id",
  "process_id",
  "file_path",
]

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

function SectionHeader({
  title,
  description,
  required = false,
}: {
  title: string
  description: string
  required?: boolean
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">
        {title}
        {required ? " *" : ""}
      </p>
      <p className="text-hint leading-4 text-muted-foreground">{description}</p>
    </div>
  )
}

function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 self-start px-0 text-primary hover:bg-transparent hover:text-primary"
      onClick={onClick}
    >
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  )
}

function RegexConfiguration() {
  const [patternDefinitions, setPatternDefinitions] = React.useState<RegexPair[]>([
    { first: "", second: "" },
  ])
  const [matchPatterns, setMatchPatterns] = React.useState(["", ""])
  const [emptyValues, setEmptyValues] = React.useState("dash")
  const [skipPrefix, setSkipPrefix] = React.useState("")
  const [expandFields, setExpandFields] = React.useState<RegexPair[]>([
    { first: "", second: "" },
  ])
  const [trimSpace, setTrimSpace] = React.useState(true)

  const updatePair = (
    setter: React.Dispatch<React.SetStateAction<RegexPair[]>>,
    index: number,
    key: keyof RegexPair,
    value: string
  ) => {
    setter((rows) =>
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row))
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Pattern Definitions"
          description="Define named groups using regular expressions to extract field values from each line of text."
          required
        />
        {patternDefinitions.map((row, index) => (
          <div key={`pattern-${index}`} className="flex items-center gap-2">
            <Input
              value={row.first}
              onChange={(event) =>
                updatePair(setPatternDefinitions, index, "first", event.target.value)
              }
              placeholder="Pattern name"
              className="w-[120px]"
            />
            <Input
              value={row.second}
              onChange={(event) =>
                updatePair(setPatternDefinitions, index, "second", event.target.value)
              }
              placeholder="Regular expression"
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove pattern definition ${index + 1}`}
              onClick={() =>
                setPatternDefinitions((rows) => rows.filter((_, rowIndex) => rowIndex !== index))
              }
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <AddRowButton
          label="Add Field"
          onClick={() =>
            setPatternDefinitions((rows) => [...rows, { first: "", second: "" }])
          }
        />
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Match Patterns"
          description="Define patterns to match log entries and extract structured information from unstructured log lines."
          required
        />
        {matchPatterns.map((pattern, index) => (
          <div key={`match-${index}`} className="flex items-center gap-2">
            <Input
              value={pattern}
              onChange={(event) =>
                setMatchPatterns((rows) =>
                  rows.map((row, rowIndex) =>
                    rowIndex === index ? event.target.value : row
                  )
                )
              }
              placeholder="Match Pattern"
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove match pattern ${index + 1}`}
              onClick={() =>
                setMatchPatterns((rows) => rows.filter((_, rowIndex) => rowIndex !== index))
              }
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <AddRowButton
          label="Add Pattern"
          onClick={() => setMatchPatterns((rows) => [...rows, ""])}
        />
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader
          title="Empty Values"
          description="Define values that should be treated as empty, such as '-' or 'N/A'."
        />
        <Select value={emptyValues} onValueChange={setEmptyValues}>
          <SelectTrigger aria-label="Empty values">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dash">-</SelectItem>
            <SelectItem value="na">N/A</SelectItem>
            <SelectItem value="null">NULL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader
          title="Skip Prefix"
          description="Define a prefix to skip when parsing log lines."
        />
        <Input
          value={skipPrefix}
          onChange={(event) => setSkipPrefix(event.target.value)}
          placeholder="Skip Prefix"
        />
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Expand Fields"
          description="Define key value pairs that should be expanded into separate fields."
        />
        {expandFields.map((row, index) => (
          <div key={`expand-${index}`} className="flex items-center gap-2">
            <Input
              value={row.first}
              onChange={(event) =>
                updatePair(setExpandFields, index, "first", event.target.value)
              }
              placeholder="Key"
              className="w-[180px]"
            />
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={row.second}
              onChange={(event) =>
                updatePair(setExpandFields, index, "second", event.target.value)
              }
              placeholder="Value"
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove expanded field ${index + 1}`}
              onClick={() =>
                setExpandFields((rows) => rows.filter((_, rowIndex) => rowIndex !== index))
              }
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <AddRowButton
          label="Add Field"
          onClick={() => setExpandFields((rows) => [...rows, { first: "", second: "" }])}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="trim-space">Trim Space</Label>
        <Switch
          id="trim-space"
          size="sm"
          checked={trimSpace}
          onCheckedChange={setTrimSpace}
        />
      </div>
    </div>
  )
}

function TagsInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (tags: string[]) => void
}) {
  const [inputValue, setInputValue] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const suggestions = React.useMemo(() => {
    const query = inputValue.trim().toLowerCase()
    return TAG_TYPE_OPTIONS.filter(
      (option) =>
        !value.includes(option) && (!query || option.toLowerCase().includes(query)),
    )
  }, [inputValue, value])

  const addTag = (tag: string) => {
    const next = tag.trim()
    if (!next || value.includes(next)) return
    onChange([...value, next])
    setInputValue("")
    setOpen(false)
  }

  const removeTag = (tag: string) => onChange(value.filter((item) => item !== tag))

  return (
    <div className="relative">
      <div className="flex min-h-8 flex-wrap items-center gap-1.5 rounded border border-input bg-transparent px-2 py-1 focus-within:border-ring focus-within:ring-[2px] focus-within:ring-ring">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="ml-0.5 rounded-sm text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              addTag(suggestions[0] ?? inputValue)
            } else if (event.key === "Backspace" && !inputValue && value.length > 0) {
              removeTag(value[value.length - 1])
            }
          }}
          placeholder={value.length ? "" : "Add tags…"}
          className="h-6 min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Add tags"
        />
      </div>
      {open && suggestions.length > 0 ? (
        <div className="absolute left-0 top-full z-40 mt-1 w-full overflow-hidden rounded-md border border-input bg-popover shadow-md">
          <div className="max-h-[220px] overflow-y-auto py-1">
            {suggestions.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addTag(option)}
                className="flex w-full items-center px-3 py-1.5 text-left font-mono text-sm text-foreground hover:bg-muted"
              >
                {option}
              </button>
            ))}
          </div>
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
  const [tags, setTags] = React.useState<string[]>([])
  const fieldDiscovery = true
  const [parser, setParser] = React.useState<ParserType>("json")
  const [schemaDefinition, setSchemaDefinition] = React.useState("")
  const [starlarkConfiguration, setStarlarkConfiguration] =
    React.useState(STARLARK_DEFAULT)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = schemaId.trim()
    if (!name) return

    saveCustomSchema({
      name,
      description: description.trim() || `${name} schema`,
      managedBy: "User",
      fieldDiscovery: fieldDiscovery ? "Enabled" : "Disabled",
      datasourceCount: 0,
    })
    router.push(`/lakewatch/schemas?created=${encodeURIComponent(name)}`)
  }

  return (
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

      <Card className="mx-auto mt-10 w-full max-w-[631px] gap-6 p-6 shadow-none">
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
            <p className="text-hint leading-4 text-muted-foreground">
              lakewatch.{destSchema}.{schemaId || "name"}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Tags</Label>
            <TagsInput value={tags} onChange={setTags} />
            <p className="text-hint leading-4 text-muted-foreground">
              Type to search tag types and press Enter to add.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="schema-description">Description</Label>
            <Textarea
              id="schema-description"
              placeholder={SAMPLE_DESCRIPTION}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onFocus={() => {
                if (!description) setDescription(SAMPLE_DESCRIPTION)
              }}
              className="min-h-16 resize-none"
            />
          </div>

        </section>

        <section className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="schema-parser">Parser</Label>
            <Select value={parser} onValueChange={(value) => setParser(value as ParserType)}>
              <SelectTrigger id="schema-parser" aria-label="Parser">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON/XML</SelectItem>
                <SelectItem value="script">Script</SelectItem>
                <SelectItem value="regex">Regex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {parser === "script" ? (
            <CodeEditor
              label="Starlark configuration"
              description="Write your script in Starlark configuration language."
              value={starlarkConfiguration}
              onChange={setStarlarkConfiguration}
              placeholder={STARLARK_DEFAULT}
              minHeight="min-h-20"
            />
          ) : null}

          {parser === "regex" ? (
            <RegexConfiguration />
          ) : null}

          <div className="my-2 h-px bg-border" />

          <CodeEditor
            label="Fields & Indicators"
            description="Define and edit the fields and indicators of your ingestion template."
            value={schemaDefinition}
            onChange={setSchemaDefinition}
            placeholder={SCHEMA_EMPTY_STATE}
            onActivate={() => {
              if (!schemaDefinition) setSchemaDefinition(SAMPLE_SCHEMA_DEFINITION)
            }}
          />
        </section>
      </Card>
    </form>
  )
}

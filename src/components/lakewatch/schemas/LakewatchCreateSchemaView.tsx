"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Plus, X } from "lucide-react"

import { InfoFillIcon } from "@/components/icons"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { saveCustomSchema } from "@/components/lakewatch/schemas/schemaStorage"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { SegmentedControl, SegmentedItem } from "@/components/ui/segmented-control"
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
type CreationMethod = "infer" | "scratch"
type SampleInputMode = "upload" | "paste"
type RegexPair = { first: string; second: string }

const SAMPLE_LOGS = `{"timestamp":"2026-07-30T21:04:12Z","eventType":"login","actor":{"id":"usr_1042","email":"analyst@example.com"},"sourceIp":"198.51.100.24","outcome":"success"}
{"timestamp":"2026-07-30T21:05:48Z","eventType":"api_request","actor":{"id":"svc_lakewatch"},"resource":"/v1/events","status":200,"durationMs":184}
{"timestamp":"2026-07-30T21:07:03Z","eventType":"permission_change","actor":{"id":"usr_1042"},"target":{"id":"role_security_admin"},"action":"grant"}`

const INFERRED_SCHEMA = `fields:
  - name: timestamp
    type: timestamp
    required: true
  - name: eventType
    type: string
  - name: actor
    type: object
    fields:
      - name: id
        type: string
      - name: email
        type: string
indicators:
  - name: sourceIp
    type: ip`

const SCHEMA_EMPTY_STATE = `# Write your fields in YAML here...
# Example:
fields:
  - name: id
    type: string
    description: Unique identifier`

const STARLARK_DEFAULT = `def parse(log):
  # Implement logic
  return {}`

function CodeEditor({
  label,
  description,
  value,
  onChange,
  placeholder,
  minHeight = "min-h-80",
}: {
  label: string
  description: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  minHeight?: string
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
          placeholder={placeholder}
          spellCheck={false}
          className={`${minHeight} resize-none rounded border border-grey-700 bg-grey-800 py-2 pr-4 pl-12 font-mono text-hint leading-5 text-grey-050 shadow-none placeholder:text-blue-400 placeholder:opacity-100 focus-visible:ring-2 focus-visible:ring-ring`}
        />
      </div>
    </div>
  )
}

function SampleEventsEditor({ onInfer }: { onInfer: () => void }) {
  const [mode, setMode] = React.useState<SampleInputMode>("upload")
  const [sampleLogs, setSampleLogs] = React.useState("")
  const [showAlert, setShowAlert] = React.useState(true)

  return (
    <div className="flex flex-col gap-5">
      {showAlert ? (
        <Alert onDismiss={() => setShowAlert(false)}>
          <InfoFillIcon size={16} />
          <AlertTitle>Paste or upload real events</AlertTitle>
          <AlertDescription>
            We&apos;ll infer a draft schema from the event structure.
          </AlertDescription>
        </Alert>
      ) : null}

      <SegmentedControl
        value={mode}
        onValueChange={(value) => setMode(value as SampleInputMode)}
      >
        <SegmentedItem value="upload">Upload sample file</SegmentedItem>
        <SegmentedItem value="paste">Paste sample event(s)</SegmentedItem>
      </SegmentedControl>

      {mode === "upload" ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded border border-dashed border-border bg-muted p-6 text-center">
          {sampleLogs ? (
            <pre className="max-h-64 w-full overflow-auto whitespace-pre-wrap break-all text-left font-mono text-hint leading-5 text-foreground">
              {sampleLogs}
            </pre>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">
                Upload events from a local file
              </p>
              <p className="text-hint text-muted-foreground">JSON or JSONL, up to 10 MB</p>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="mt-3"
                onClick={() => setSampleLogs(SAMPLE_LOGS)}
              >
                Select file
              </Button>
            </>
          )}
        </div>
      ) : (
        <Textarea
          value={sampleLogs}
          onChange={(event) => setSampleLogs(event.target.value)}
          placeholder={'{"timestamp":"2026-07-30T21:04:12Z","eventType":"login"}'}
          aria-label="Sample events"
          spellCheck={false}
          className="min-h-64 resize-none bg-muted p-4 font-mono text-hint leading-5"
        />
      )}

      <Button
        type="button"
        variant="primary"
        size="sm"
        className="self-start"
        disabled={!sampleLogs.trim()}
        onClick={onInfer}
      >
        Infer schema
      </Button>
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

export function LakewatchCreateSchemaView() {
  const router = useRouter()
  const [schemaId, setSchemaId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [referenceUrl, setReferenceUrl] = React.useState("")
  const [fieldDiscovery, setFieldDiscovery] = React.useState(true)
  const [creationMethod, setCreationMethod] =
    React.useState<CreationMethod>("scratch")
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
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-10 pb-10 pt-6"
    >
      <div className="sticky top-0 z-10 -mx-10 -mt-6 flex items-start justify-between gap-4 bg-background px-10 pt-6 pb-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/lakewatch/schemas">Schemas</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Add new schema</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className={PAGE_TITLE_SEMIBOLD}>Create New Schema</h1>
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
            <Label htmlFor="schema-id">Schema ID</Label>
            <Input
              id="schema-id"
              value={schemaId}
              onChange={(event) => setSchemaId(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reference-url">Reference URL</Label>
            <Input
              id="reference-url"
              type="url"
              value={referenceUrl}
              onChange={(event) => setReferenceUrl(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="schema-description">Description</Label>
            <Textarea
              id="schema-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-16 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="field-discovery">Field discovery</Label>
              <Switch
                id="field-discovery"
                size="sm"
                checked={fieldDiscovery}
                onCheckedChange={setFieldDiscovery}
              />
              <span className="text-sm text-foreground">
                {fieldDiscovery ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="text-hint leading-4 text-muted-foreground">
              By enabling this feature, Databricks will not drop any fields from an event that
              aren&apos;t included in the schema. This allows you to query all the fields, and also
              lets detections access them.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Schema definition</Label>
            <SegmentedControl
              value={creationMethod}
              onValueChange={(value) =>
                setCreationMethod(value as CreationMethod)
              }
            >
              <SegmentedItem value="infer">Infer from sample event</SegmentedItem>
              <SegmentedItem value="scratch">Create from scratch</SegmentedItem>
            </SegmentedControl>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold leading-6 text-foreground">Schema</h2>

          {creationMethod === "infer" ? (
            <SampleEventsEditor
              onInfer={() => setSchemaDefinition(INFERRED_SCHEMA)}
            />
          ) : (
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
          )}

          {creationMethod === "scratch" && parser === "script" ? (
            <CodeEditor
              label="Starlark configuration"
              description="Write your script in Starlark configuration language."
              value={starlarkConfiguration}
              onChange={setStarlarkConfiguration}
              placeholder={STARLARK_DEFAULT}
              minHeight="min-h-20"
            />
          ) : null}

          {creationMethod === "scratch" && parser === "regex" ? (
            <RegexConfiguration />
          ) : null}

          <div className="my-2 h-px bg-border" />

          <CodeEditor
            label="Fields & Indicators"
            description="Define and edit the fields and indicators of your Schema."
            value={schemaDefinition}
            onChange={setSchemaDefinition}
            placeholder={SCHEMA_EMPTY_STATE}
          />
        </section>
      </Card>
    </form>
  )
}

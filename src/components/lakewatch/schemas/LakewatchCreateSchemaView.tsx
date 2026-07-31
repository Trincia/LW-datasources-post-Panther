"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { InfoFillIcon } from "@/components/icons"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
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

type CreationMethod = "infer" | "scratch"
type SampleInputMode = "upload" | "paste"

const SAMPLE_LOGS = `{"timestamp":"2026-07-30T21:04:12Z","eventType":"login","actor":{"id":"usr_1042","email":"analyst@example.com"},"sourceIp":"198.51.100.24","outcome":"success"}
{"timestamp":"2026-07-30T21:05:48Z","eventType":"api_request","actor":{"id":"svc_lakewatch"},"resource":"/v1/events","status":200,"durationMs":184}
{"timestamp":"2026-07-30T21:07:03Z","eventType":"permission_change","actor":{"id":"usr_1042"},"target":{"id":"role_security_admin"},"action":"grant"}`

const SCRATCH_SCHEMA = `fields:
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

const SCRATCH_SCHEMA_EMPTY_STATE = `# Write your fields in YAML here...
# Example:
fields:
  - name: id
    type: string
    description: Unique identifier`

function SampleEventsEditor() {
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
            We&apos;ll show which ones match and highlight fields that don&apos;t.
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
        <>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Upload events from a local file
              </p>
              <p className="text-hint text-muted-foreground">JSON or JSONL, up to 10 MB</p>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setSampleLogs(SAMPLE_LOGS)}
            >
              Select file
            </Button>
          </div>

          <div className="flex min-h-80 items-center justify-center overflow-auto bg-muted p-4">
            {sampleLogs ? (
              <pre className="self-start whitespace-pre-wrap break-all font-mono text-hint leading-5 text-foreground">
                {sampleLogs}
              </pre>
            ) : (
              <div className="flex flex-col items-center text-center">
                <span className="mb-3 flex size-10 items-center justify-center rounded-md border border-border bg-background">
                  <Image
                    src="/lakewatch/icons/file-plus.svg"
                    alt=""
                    width={32}
                    height={32}
                    aria-hidden
                  />
                </span>
                <p className="text-hint text-foreground">
                  Choose a file or drag &amp; drop it here
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSampleLogs(SAMPLE_LOGS)}
                >
                  Select file
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Paste one or more sample events
            </p>
            <p className="text-hint text-muted-foreground">
              Add one JSON event per line.
            </p>
          </div>
          <Textarea
            value={sampleLogs}
            onChange={(event) => setSampleLogs(event.target.value)}
            placeholder={'{"timestamp":"2026-07-30T21:04:12Z","eventType":"login"}'}
            aria-label="Sample events"
            spellCheck={false}
            className="min-h-80 resize-none rounded-none border-0 bg-muted p-4 font-mono text-hint leading-5 shadow-none focus-visible:ring-0"
          />
        </>
      )}
    </div>
  )
}

function ScratchSchemaEditor() {
  const [parser, setParser] = React.useState("json")
  const [schemaDefinition, setSchemaDefinition] = React.useState("")

  const fillSchemaDefinition = () => {
    setSchemaDefinition((current) => current || SCRATCH_SCHEMA)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>Parser</Label>
        <Select value={parser} onValueChange={setParser}>
          <SelectTrigger className="w-full" aria-label="Parser">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">Default (JSON/XML)</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="regex">Regex</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Fields &amp; Indicators</p>
          <p className="text-hint text-muted-foreground">
            Define and edit the fields and indicators of your Schema.
          </p>
        </div>
        <div className="relative min-h-80">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 border-r border-grey-700 bg-grey-800 px-2 py-2 text-right font-mono text-hint text-grey-350"
          >
            1
          </span>
          <Textarea
            value={schemaDefinition}
            onChange={(event) => setSchemaDefinition(event.target.value)}
            onFocus={fillSchemaDefinition}
            onClick={fillSchemaDefinition}
            placeholder={SCRATCH_SCHEMA_EMPTY_STATE}
            aria-label="Schema fields and indicators"
            spellCheck={false}
            className="min-h-80 resize-none rounded border border-grey-700 bg-grey-800 py-2 pr-4 pl-12 font-mono text-hint leading-5 text-grey-050 shadow-none placeholder:text-grey-350 placeholder:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
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
  const [creationMethod, setCreationMethod] = React.useState<CreationMethod>("infer")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!schemaId.trim()) return
    router.push(`/lakewatch/schemas/${encodeURIComponent(schemaId.trim())}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-10 pb-10 pt-6"
    >
      <div className="flex items-start justify-between gap-4">
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

      <Card className="mx-auto mt-10 w-full max-w-2xl gap-6 p-6 shadow-none">
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
            <span className="text-sm text-foreground">Label</span>
          </div>
          <p className="text-hint leading-4 text-muted-foreground">
            By enabling this feature, Databricks will not drop any fields from an event that
            aren&apos;t included in the schema. This allows you to query all the fields, and also
            lets detections access them.
          </p>
        </div>

        <SegmentedControl
          value={creationMethod}
          onValueChange={(value) => setCreationMethod(value as CreationMethod)}
          className="w-fit"
        >
          <SegmentedItem value="infer">Infer from sample events</SegmentedItem>
          <SegmentedItem value="scratch">Create from scratch</SegmentedItem>
        </SegmentedControl>

        {creationMethod === "infer" ? <SampleEventsEditor /> : <ScratchSchemaEditor />}
      </Card>
    </form>
  )
}

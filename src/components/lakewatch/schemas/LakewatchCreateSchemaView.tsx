"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

import {
  CheckIcon,
  ChevronRightIcon,
  CodeIcon,
  DangerSmallIcon,
  InfoFillIcon,
  LightningIcon,
  XCircleIcon,
} from "@/components/icons"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type CreationMethod = "infer" | "scratch" | null
type SampleInputMode = "upload" | "paste"

const SAMPLE_LOGS = `{"timestamp":"2026-07-30T21:04:12Z","eventType":"login","actor":{"id":"usr_1042","email":"analyst@example.com"},"sourceIp":"198.51.100.24","outcome":"success"}
{"timestamp":"2026-07-30T21:05:48Z","eventType":"api_request","actor":{"id":"svc_lakewatch"},"resource":"/v1/events","status":200,"durationMs":184}
{"timestamp":"2026-07-30T21:07:03Z","eventType":"permission_change","actor":{"id":"usr_1042"},"target":{"id":"role_security_admin"},"action":"grant"}`

function SchemaCreationOption({
  title,
  icon,
  selected,
  onSelect,
}: {
  title: string
  icon: React.ReactNode
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-4 rounded-md border border-border bg-muted/60 p-4",
        selected && "border-primary bg-primary/5",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
        {title}
      </span>
      <Button type="button" variant="default" size="xs" onClick={onSelect}>
        Start
      </Button>
    </div>
  )
}

function SampleLogsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [mode, setMode] = React.useState<SampleInputMode>("upload")
  const [sampleLogs, setSampleLogs] = React.useState("")
  const [showAlert, setShowAlert] = React.useState(true)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[400px] gap-0 p-0 sm:max-w-[400px]"
      >
        <SheetHeader className="flex h-16 shrink-0 flex-row items-center gap-2 px-6 py-4">
          <SheetTitle className="min-w-0 flex-1 text-[22px] leading-7">
            Test with sample logs
          </SheetTitle>
          <SheetDescription className="sr-only">
            Paste or upload sample events to infer a schema.
          </SheetDescription>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Close sample logs drawer"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6">
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
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Upload events from a local file
                  </p>
                  <p className="text-hint text-muted-foreground">
                    JSON or JSONL, up to 10 MB
                  </p>
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
              {sampleLogs ? (
                <p className="text-hint text-[var(--success)]">
                  sample-security-events.jsonl loaded
                </p>
              ) : null}
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-foreground">
                Paste one or more sample events
              </p>
              <p className="text-hint text-muted-foreground">
                Add one JSON event per line.
              </p>
            </div>
          )}

          {mode === "paste" ? (
            <Textarea
              value={sampleLogs}
              onChange={(event) => setSampleLogs(event.target.value)}
              placeholder={'{"timestamp":"2026-07-30T21:04:12Z","eventType":"login"}'}
              aria-label="Sample events"
              spellCheck={false}
              className="min-h-[426px] resize-none rounded-none border-0 bg-muted p-4 font-mono text-hint leading-5 shadow-none focus-visible:ring-0 dark:bg-muted"
            />
          ) : (
            <div className="min-h-[426px] overflow-auto bg-muted px-4 py-3">
              {sampleLogs ? (
                <pre className="whitespace-pre-wrap break-all font-mono text-hint leading-5 text-foreground">
                  {sampleLogs}
                </pre>
              ) : (
                <p className="text-hint text-muted-foreground">
                  Select a file to preview sample events here.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto flex shrink-0 items-center justify-end gap-2 px-6 pb-6 pt-4">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!sampleLogs.trim()}
            onClick={() => onOpenChange(false)}
          >
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function LakewatchCreateSchemaView() {
  const router = useRouter()
  const [schemaId, setSchemaId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [referenceUrl, setReferenceUrl] = React.useState("")
  const [fieldDiscovery, setFieldDiscovery] = React.useState(true)
  const [creationMethod, setCreationMethod] = React.useState<CreationMethod>(null)
  const [sampleDrawerOpen, setSampleDrawerOpen] = React.useState(false)
  const schemaIdMissing = schemaId.trim().length === 0

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (schemaIdMissing) return
    router.push(`/lakewatch/schemas/${encodeURIComponent(schemaId.trim())}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-10 pb-10 pt-6"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/lakewatch/schemas">Schemas</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRightIcon size={12} />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground">New</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex shrink-0 items-center gap-3">
          <Button type="button" variant="default" size="sm">
            Upload Sample Logs
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/lakewatch/schemas">Cancel</Link>
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="schema-id">
          Schema ID <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id="schema-id"
            value={schemaId}
            onChange={(event) => setSchemaId(event.target.value)}
            placeholder="Schema ID"
            aria-invalid={schemaIdMissing}
            aria-describedby={schemaIdMissing ? "schema-id-error" : undefined}
            className="flex-1"
          />
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="icon-sm"
              aria-label="Validate schema ID"
            >
              <CheckIcon size={16} />
            </Button>
            <Button
              type="button"
              variant="default"
              size="icon-sm"
              aria-label="Clear schema ID"
              onClick={() => setSchemaId("")}
            >
              <XCircleIcon size={16} />
            </Button>
          </div>
        </div>
        {schemaIdMissing ? (
          <p
            id="schema-id-error"
            className="flex items-center gap-1.5 text-hint text-destructive"
          >
            <DangerSmallIcon size={12} aria-hidden />
            This field is required
          </p>
        ) : null}
      </div>

      <Card className="gap-5 shadow-none">
        <h2 className="text-md font-semibold leading-5 text-foreground">Basic Info</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="schema-description" className="text-hint text-muted-foreground">
            Description
          </Label>
          <Textarea
            id="schema-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            className="min-h-20 resize-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reference-url" className="text-hint text-muted-foreground">
            Reference URL
          </Label>
          <Input
            id="reference-url"
            type="url"
            value={referenceUrl}
            onChange={(event) => setReferenceUrl(event.target.value)}
            placeholder="Reference URL"
          />
        </div>
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="field-discovery">Field Discovery</Label>
            <Switch
              id="field-discovery"
              size="sm"
              checked={fieldDiscovery}
              onCheckedChange={setFieldDiscovery}
            />
          </div>
          <p className="mt-2 text-hint leading-[18px] text-muted-foreground">
            By enabling this feature, Panther will not drop any fields from an event that
            aren&apos;t included in the schema. This allows you to query all the fields, and also
            lets detections access them. To find out more about AFD you can{" "}
            <Link href="#" className="text-primary underline">
              read our documentation
            </Link>
            .
          </p>
        </div>
      </Card>

      <Card className="gap-5 shadow-none">
        <h2 className="text-md font-semibold leading-5 text-foreground">Schema</h2>
        <div className="flex flex-col gap-4 lg:flex-row">
          <SchemaCreationOption
            title="Infer a schema from sample events"
            icon={<LightningIcon size={18} />}
            selected={creationMethod === "infer"}
            onSelect={() => {
              setCreationMethod("infer")
              setSampleDrawerOpen(true)
            }}
          />
          <SchemaCreationOption
            title="Create your schema from scratch"
            icon={<CodeIcon size={18} />}
            selected={creationMethod === "scratch"}
            onSelect={() => setCreationMethod("scratch")}
          />
        </div>
      </Card>

      <p className="pt-2 text-hint text-muted-foreground">
        Need to know more about how to write schemas?{" "}
        <Link href="#" className="text-primary underline">
          Read our documentation
        </Link>
      </p>
      <SampleLogsDrawer open={sampleDrawerOpen} onOpenChange={setSampleDrawerOpen} />
    </form>
  )
}

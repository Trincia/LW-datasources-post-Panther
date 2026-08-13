"use client"

import * as React from "react"
import {
  ArrowRight,
  Clipboard,
  Database,
  FileText,
  Info,
  LoaderCircle,
  Table2,
  Upload,
} from "lucide-react"

import { CatalogIcon, CheckCircleIcon } from "@/components/icons"
import { RunAsControl, RUN_AS_OPTIONS } from "@/components/lakewatch/RunAsControl"
import { UnityCatalogExplorerModal } from "@/components/lakewatch/datasources-new/UnityCatalogExplorerModal"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const EXTERNAL_LOCATION_PLACEHOLDER = "s3://my-bucket/logs/"
const EXTERNAL_LOCATION_SAMPLE =
  "s3://lakewatch-security-logs/AWSLogs/123456789012/CloudTrail/us-east-1/2026/08/11/"

type PreviewDataset = {
  rawColumn: string
  rawRecords: string[]
  transformedColumns: string[]
  transformedRows: string[][]
}

const CLOUDTRAIL_DATASET: PreviewDataset = {
  rawColumn: "raw_record",
  rawRecords: [
    '{"eventTime":"2026-08-11T14:32:07Z","eventName":"ConsoleLogin","sourceIPAddress":"52.94.133.11","userIdentity":{"userName":"sarah.dev"},"responseElements":{"ConsoleLogin":"Success"}}',
    '{"eventTime":"2026-08-11T14:33:19Z","eventName":"AssumeRole","sourceIPAddress":"10.0.4.22","userIdentity":{"userName":"ci-deploy-bot"},"responseElements":{"ConsoleLogin":"Success"}}',
    '{"eventTime":"2026-08-11T14:35:41Z","eventName":"CreateBucket","sourceIPAddress":"203.0.113.42","userIdentity":{"userName":"admin.ops"},"responseElements":{"ConsoleLogin":"Success"}}',
    '{"eventTime":"2026-08-11T14:37:02Z","eventName":"GetObject","sourceIPAddress":"198.51.100.9","userIdentity":{"userName":"analytics.svc"},"responseElements":{"ConsoleLogin":"Success"}}',
    '{"eventTime":"2026-08-11T14:38:55Z","eventName":"DeleteObject","sourceIPAddress":"52.94.133.99","userIdentity":{"userName":"sarah.dev"},"responseElements":{"ConsoleLogin":"Failure"}}',
  ],
  transformedColumns: ["event_time", "event_name", "source_ip", "actor", "outcome"],
  transformedRows: [
    ["2026-08-11 14:32:07", "ConsoleLogin", "52.94.133.11", "sarah.dev", "Success"],
    ["2026-08-11 14:33:19", "AssumeRole", "10.0.4.22", "ci-deploy-bot", "Success"],
    ["2026-08-11 14:35:41", "CreateBucket", "203.0.113.42", "admin.ops", "Success"],
    ["2026-08-11 14:37:02", "GetObject", "198.51.100.9", "analytics.svc", "Success"],
    ["2026-08-11 14:38:55", "DeleteObject", "52.94.133.99", "sarah.dev", "Failure"],
  ],
}

const VPCFLOW_DATASET: PreviewDataset = {
  rawColumn: "raw_line",
  rawRecords: [
    "2 123456789012 eni-0abc12de 10.0.1.15 52.94.133.11 51513 443 6 12 1032 1691766727 1691766787 ACCEPT OK",
    "2 123456789012 eni-0abc12de 10.0.4.22 10.0.1.15 443 51201 6 8 640 1691766728 1691766788 ACCEPT OK",
    "2 123456789012 eni-0fd934aa 203.0.113.42 10.0.2.30 40233 22 6 3 120 1691766731 1691766791 REJECT OK",
    "2 123456789012 eni-0fd934aa 10.0.2.30 198.51.100.9 8443 55120 6 21 1810 1691766732 1691766792 ACCEPT OK",
    "2 123456789012 eni-0abc12de 52.94.133.99 10.0.1.15 39112 3389 6 1 40 1691766735 1691766795 REJECT OK",
  ],
  transformedColumns: ["start_time", "src_addr", "dst_addr", "dst_port", "action", "bytes"],
  transformedRows: [
    ["2026-08-11 14:32:07", "10.0.1.15", "52.94.133.11", "443", "ACCEPT", "1032"],
    ["2026-08-11 14:32:08", "10.0.4.22", "10.0.1.15", "51201", "ACCEPT", "640"],
    ["2026-08-11 14:32:11", "203.0.113.42", "10.0.2.30", "22", "REJECT", "120"],
    ["2026-08-11 14:32:12", "10.0.2.30", "198.51.100.9", "55120", "ACCEPT", "1810"],
    ["2026-08-11 14:32:15", "52.94.133.99", "10.0.1.15", "3389", "REJECT", "40"],
  ],
}

const ALB_DATASET: PreviewDataset = {
  rawColumn: "raw_line",
  rawRecords: [
    'https 2026-08-11T14:32:07.115Z app/prod-alb/50dc6c495c0c9188 52.94.133.11:52814 10.0.2.10:443 0.001 0.045 0.000 200 200 "GET https://api.acme.io/orders HTTP/2.0"',
    'https 2026-08-11T14:32:09.842Z app/prod-alb/50dc6c495c0c9188 203.0.113.42:41220 10.0.2.11:443 0.000 0.212 0.000 404 404 "GET https://api.acme.io/missing HTTP/2.0"',
    'https 2026-08-11T14:32:12.331Z app/prod-alb/50dc6c495c0c9188 198.51.100.9:60122 10.0.2.10:443 0.002 0.078 0.001 200 200 "POST https://api.acme.io/login HTTP/2.0"',
    'https 2026-08-11T14:32:15.007Z app/prod-alb/50dc6c495c0c9188 52.94.133.99:52990 10.0.2.12:443 0.001 0.500 0.000 502 502 "GET https://api.acme.io/report HTTP/2.0"',
    'https 2026-08-11T14:32:18.774Z app/prod-alb/50dc6c495c0c9188 10.0.4.22:38810 10.0.2.10:443 0.000 0.033 0.000 200 200 "GET https://api.acme.io/health HTTP/2.0"',
  ],
  transformedColumns: ["time", "client_ip", "elb_status", "target_status", "verb", "url"],
  transformedRows: [
    ["2026-08-11 14:32:07", "52.94.133.11", "200", "200", "GET", "/orders"],
    ["2026-08-11 14:32:09", "203.0.113.42", "404", "404", "GET", "/missing"],
    ["2026-08-11 14:32:12", "198.51.100.9", "200", "200", "POST", "/login"],
    ["2026-08-11 14:32:15", "52.94.133.99", "502", "502", "GET", "/report"],
    ["2026-08-11 14:32:18", "10.0.4.22", "200", "200", "GET", "/health"],
  ],
}

const S3_ACCESS_DATASET: PreviewDataset = {
  rawColumn: "raw_line",
  rawRecords: [
    '79a59df9 lakewatch-logs [11/Aug/2026:14:32:07 +0000] 52.94.133.11 arn:aws:iam::123:user/sarah.dev REST.GET.OBJECT logs/app.log "GET /logs/app.log HTTP/1.1" 200 - 4021',
    '79a59df9 lakewatch-logs [11/Aug/2026:14:32:10 +0000] 10.0.4.22 arn:aws:iam::123:role/ci-deploy REST.PUT.OBJECT builds/v42.tar "PUT /builds/v42.tar HTTP/1.1" 200 - 918273',
    '79a59df9 lakewatch-logs [11/Aug/2026:14:32:14 +0000] 203.0.113.42 - REST.GET.OBJECT private/keys.json "GET /private/keys.json HTTP/1.1" 403 AccessDenied 0',
    '79a59df9 lakewatch-logs [11/Aug/2026:14:32:17 +0000] 198.51.100.9 arn:aws:iam::123:user/analytics REST.GET.OBJECT exports/daily.csv "GET /exports/daily.csv HTTP/1.1" 200 - 20481',
    '79a59df9 lakewatch-logs [11/Aug/2026:14:32:21 +0000] 52.94.133.99 arn:aws:iam::123:user/sarah.dev REST.DELETE.OBJECT logs/old.log "DELETE /logs/old.log HTTP/1.1" 204 - 0',
  ],
  transformedColumns: ["request_time", "remote_ip", "requester", "operation", "key", "http_status"],
  transformedRows: [
    ["2026-08-11 14:32:07", "52.94.133.11", "sarah.dev", "REST.GET.OBJECT", "logs/app.log", "200"],
    ["2026-08-11 14:32:10", "10.0.4.22", "ci-deploy", "REST.PUT.OBJECT", "builds/v42.tar", "200"],
    ["2026-08-11 14:32:14", "203.0.113.42", "—", "REST.GET.OBJECT", "private/keys.json", "403"],
    ["2026-08-11 14:32:17", "198.51.100.9", "analytics", "REST.GET.OBJECT", "exports/daily.csv", "200"],
    ["2026-08-11 14:32:21", "52.94.133.99", "sarah.dev", "REST.DELETE.OBJECT", "logs/old.log", "204"],
  ],
}

const PREVIEW_DATASETS: Record<string, PreviewDataset> = {
  "AWS.CloudTrail": CLOUDTRAIL_DATASET,
  "AWS.VPCFlow": VPCFLOW_DATASET,
  "AWS.ALB": ALB_DATASET,
  "AWS.S3ServerAccess": S3_ACCESS_DATASET,
}

function datasetForSchema(schemaName?: string): PreviewDataset {
  if (schemaName && PREVIEW_DATASETS[schemaName]) return PREVIEW_DATASETS[schemaName]
  return CLOUDTRAIL_DATASET
}

const PREVIEW_SOURCES = [
  {
    icon: Database,
    title: "Select external location",
    action: "Configure path",
    opensLocationModal: true,
  },
  {
    icon: Table2,
    title: "Select existing table",
    action: "Select from catalog",
    opensTableModal: true,
  },
  {
    icon: Upload,
    title: "Upload file",
    action: "Upload file",
    opensUploadModal: true,
  },
  {
    icon: Clipboard,
    title: "Paste sample",
    action: "Paste sample payload",
    opensPasteModal: true,
  },
] as const

function VerificationCheck({ valid }: { valid: boolean }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center">
      {valid ? (
        <CheckCircleIcon
          className="h-4 w-4 text-[var(--success)]"
          ariaLabel="Verified"
        />
      ) : null}
    </span>
  )
}

function SamplePreviewSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-16">
      <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading sample preview…</p>
    </div>
  )
}

function SamplePreviewTables({ dataset }: { dataset: PreviewDataset }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden bg-border/50 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col bg-background">
        <div className="flex h-9 items-center gap-2 border-b border-border/50 bg-muted px-4">
          <Database className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Raw data</span>
          <span className="text-hint text-muted-foreground">
            {dataset.rawRecords.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-2 text-hint font-semibold text-foreground">
                  {dataset.rawColumn}
                </th>
              </tr>
            </thead>
            <tbody>
              {dataset.rawRecords.map((record, index) => (
                <tr
                  key={index}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <td className="max-w-0 truncate px-4 py-2 font-mono text-xs text-muted-foreground">
                    {record}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex min-w-0 flex-col bg-background">
        <div className="flex h-9 items-center gap-2 border-b border-border/50 bg-muted px-4">
          <Table2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Transformed
          </span>
          <span className="text-hint text-muted-foreground">
            {dataset.transformedRows.length} rows
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/50">
                {dataset.transformedColumns.map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap px-4 py-2 text-hint font-semibold text-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.transformedRows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-border/50 last:border-b-0"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="whitespace-nowrap px-4 py-2 text-xs text-foreground"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function SchemaPreviewPanel({
  preloaded = false,
  schemaName,
}: {
  /** When true, the side-by-side preview is shown immediately (read-only, no empty state). */
  preloaded?: boolean
  /** Selects the sample dataset to show; falls back to a generic CloudTrail sample. */
  schemaName?: string
} = {}) {
  const dataset = datasetForSchema(schemaName)
  const [runAs, setRunAs] = React.useState<string>(RUN_AS_OPTIONS[0].value)
  const [externalLocation, setExternalLocation] = React.useState("")
  const [tableLocation, setTableLocation] = React.useState("")
  const [catalogPickerOpen, setCatalogPickerOpen] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState("")
  const [pasteSample, setPasteSample] = React.useState("")
  const [appliedLabel, setAppliedLabel] = React.useState("")
  const [sampleLoading, setSampleLoading] = React.useState(false)
  const loadTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (loadTimer.current) clearTimeout(loadTimer.current)
    }
  }, [])

  const applySample = (label: string) => {
    setAppliedLabel(label)
    setSampleLoading(true)
    if (loadTimer.current) clearTimeout(loadTimer.current)
    loadTimer.current = setTimeout(() => setSampleLoading(false), 1200)
  }

  const clearSample = () => {
    if (loadTimer.current) clearTimeout(loadTimer.current)
    setSampleLoading(false)
    setAppliedLabel("")
  }

  const hasSample = preloaded || appliedLabel !== ""

  const cardClass =
    "flex flex-col gap-3 rounded-md border-[1.5px] border-border bg-background p-4 text-left transition-colors hover:border-primary/40"

  return (
    <div className="w-full shrink-0 overflow-hidden border-t border-border bg-background">
      <div className="flex h-10 items-center justify-between border-b border-border bg-muted px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Preview</p>
          {preloaded ? (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="truncate text-hint text-muted-foreground">
                {schemaName ? `Sample from ${schemaName}` : "Source sample"}
              </span>
            </>
          ) : appliedLabel !== "" ? (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="truncate text-hint text-muted-foreground">
                {appliedLabel}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="font-normal text-primary"
                onClick={clearSample}
              >
                Change source
              </Button>
            </>
          ) : null}
        </div>
        <RunAsControl value={runAs} onValueChange={setRunAs} align="end" />
      </div>

      {!hasSample ? (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-lg font-semibold leading-6 text-foreground">
            Add sample data to preview
          </h3>
          <p className="whitespace-nowrap text-[15px] leading-[22px] text-muted-foreground">
            Choose a data source for your sample. The preview will show how your
            parser transforms the data.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PREVIEW_SOURCES.map((source) => {
            const Icon = source.icon
            const cardInner = (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-md bg-muted p-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="min-w-0 flex-1 text-sm font-semibold text-foreground">
                    {source.title}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">
                    {source.action}
                  </span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                </div>
              </>
            )

            if ("opensLocationModal" in source) {
              return (
                <Dialog key={source.title}>
                  <DialogTrigger asChild>
                    <button type="button" className={cardClass}>
                      {cardInner}
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select external location</DialogTitle>
                      <DialogDescription>
                        Choose an external location for Lakewatch to load a data
                        sample from.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-2">
                      <Label htmlFor="external-location">S3 location</Label>
                      <p className="text-hint text-muted-foreground">
                        The S3 path to load a data sample from (e.g.
                        s3://my-bucket/logs/).
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          id="external-location"
                          value={externalLocation}
                          placeholder={EXTERNAL_LOCATION_PLACEHOLDER}
                          onChange={(event) =>
                            setExternalLocation(event.target.value)
                          }
                          onFocus={() =>
                            setExternalLocation(
                              (current) => current || EXTERNAL_LOCATION_SAMPLE
                            )
                          }
                          onClick={() =>
                            setExternalLocation(
                              (current) => current || EXTERNAL_LOCATION_SAMPLE
                            )
                          }
                        />
                        <VerificationCheck valid={!!externalLocation.trim()} />
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="default" size="sm">
                          Cancel
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!externalLocation.trim()}
                          onClick={() => applySample("External location")}
                        >
                          Apply
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
            }

            if ("opensTableModal" in source) {
              return (
                <Dialog key={source.title}>
                  <DialogTrigger asChild>
                    <button type="button" className={cardClass}>
                      {cardInner}
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select existing table</DialogTitle>
                      <DialogDescription>
                        Choose a Unity Catalog table for Lakewatch to load a data
                        sample from.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-2">
                      <Label htmlFor="existing-table">Table</Label>
                      <p className="text-hint text-muted-foreground">
                        Enter a fully qualified table name or browse the catalog.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-1">
                          <Input
                            id="existing-table"
                            value={tableLocation}
                            onChange={(event) =>
                              setTableLocation(event.target.value)
                            }
                            placeholder="Enter a table or browse"
                            className="rounded-r-none border-r-0"
                          />
                          <Button
                            type="button"
                            variant="default"
                            size="icon-sm"
                            className="rounded-l-none"
                            aria-label="Browse Unity Catalog tables"
                            onClick={() => setCatalogPickerOpen(true)}
                          >
                            <CatalogIcon size={16} className="text-muted-foreground" />
                          </Button>
                        </div>
                        <VerificationCheck valid={!!tableLocation.trim()} />
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="default" size="sm">
                          Cancel
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!tableLocation.trim()}
                          onClick={() => applySample("Existing table")}
                        >
                          Apply
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
            }

            if ("opensUploadModal" in source) {
              return (
                <Dialog key={source.title}>
                  <DialogTrigger asChild>
                    <button type="button" className={cardClass}>
                      {cardInner}
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload file</DialogTitle>
                      <DialogDescription>
                        Upload a local CSV, JSON, Parquet, or XML sample to
                        generate the preview.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                      <div className="flex flex-col items-center justify-center gap-4 rounded border border-dashed border-input bg-muted py-8">
                        <div className="flex items-center rounded border border-border bg-background p-2.5">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="flex items-center gap-2 text-sm text-foreground">
                          {uploadedFile || "Choose a file or drag & drop it here"}
                          {uploadedFile ? (
                            <CheckCircleIcon
                              className="h-4 w-4 text-[var(--success)]"
                              ariaLabel="File selected"
                            />
                          ) : null}
                        </p>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setUploadedFile("sample_events.json")}
                        >
                          Select file
                        </Button>
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="default" size="sm">
                          Cancel
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!uploadedFile}
                          onClick={() => applySample("Uploaded file")}
                        >
                          Apply
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
            }

            if ("opensPasteModal" in source) {
              return (
                <Dialog key={source.title}>
                  <DialogTrigger asChild>
                    <button type="button" className={cardClass}>
                      {cardInner}
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Paste sample</DialogTitle>
                      <DialogDescription>
                        Paste raw payloads, log lines, or delimited structures to
                        generate the preview.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-2">
                      <Textarea
                        id="paste-sample"
                        value={pasteSample}
                        onChange={(event) => setPasteSample(event.target.value)}
                        placeholder="Paste sample data here"
                        className="min-h-48 resize-none rounded-md border-border bg-muted p-4 font-mono text-xs leading-5 placeholder:text-muted-foreground"
                      />
                      {pasteSample.trim() ? (
                        <p className="flex items-center gap-1.5 text-hint text-[var(--success)]">
                          <CheckCircleIcon
                            className="h-4 w-4"
                            ariaLabel="Sample captured"
                          />
                          Sample captured
                        </p>
                      ) : null}
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="default" size="sm">
                          Cancel
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!pasteSample.trim()}
                          onClick={() => applySample("Pasted sample")}
                        >
                          Apply
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
            }

            return null
          })}
        </div>

        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-hint text-muted-foreground">
            Sample data is used only to generate the preview and is not saved as
            part of the parser.
          </p>
        </div>
      </div>
      ) : sampleLoading ? (
        <SamplePreviewSkeleton />
      ) : (
        <SamplePreviewTables dataset={dataset} />
      )}

      <UnityCatalogExplorerModal
        open={catalogPickerOpen}
        onOpenChange={setCatalogPickerOpen}
        onSelect={setTableLocation}
      />
    </div>
  )
}

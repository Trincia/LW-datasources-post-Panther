"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { DatabaseClockIcon, DataModelNavIcon, PipelineIcon, PlusIcon, TableIcon } from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Official OCSF event classes grouped by category.
const OCSF_CLASS_GROUPS: { category: string; classes: string[] }[] = [
  {
    category: "Identity & Access Management",
    classes: [
      "Account Change",
      "Authentication",
      "Authorize Session",
      "Entity Management",
      "Group Management",
      "User Access Management",
    ],
  },
  {
    category: "Findings",
    classes: [
      "Compliance Finding",
      "Data Security Finding",
      "Detection Finding",
      "Incident Finding",
      "Security Finding",
      "Vulnerability Finding",
    ],
  },
  {
    category: "Application Activity",
    classes: [
      "API Activity",
      "Application Lifecycle",
      "Datastore Activity",
      "File Hosting Activity",
      "Scan Activity",
      "Web Resources Activity",
    ],
  },
  {
    category: "Network Activity",
    classes: [
      "DHCP Activity",
      "DNS Activity",
      "Email Activity",
      "HTTP Activity",
      "Network Activity",
      "SSH / RDP / SMB / FTP Activity",
    ],
  },
  {
    category: "System Activity",
    classes: [
      "File Activity (File System)",
      "Kernel Activity",
      "Memory Activity",
      "Module Activity",
      "Process Activity",
      "Scheduled Job Activity",
    ],
  },
  {
    category: "Discovery & Remediation",
    classes: ["Device Config State / Inventory Info", "Remediation Activity"],
  },
]

type Delivery = "materialized_view" | "pipeline" | "view"

function DeliveryIcon({ delivery, className }: { delivery: Delivery | ""; className?: string }) {
  if (delivery === "pipeline") return <PipelineIcon size={16} className={className} />
  if (delivery === "materialized_view") return <DatabaseClockIcon size={16} className={className} />
  return <TableIcon size={16} className={className} />
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export function LakewatchNormalizedDataCreateView() {
  const [eventClass, setEventClass] = React.useState<string>("")
  const [delivery, setDelivery] = React.useState<Delivery | "">("")
  const ready = eventClass !== "" && delivery !== ""

  const destinationTable = eventClass
    ? `lakewatch.gold.ocsf_${slugify(eventClass)}`
    : ""

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/lakewatch/normalized-data">Data models</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New data model</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <DataModelNavIcon size={20} className="shrink-0 text-muted-foreground" />
              <h1 className={PAGE_TITLE_SEMIBOLD}>New data model</h1>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <LakewatchDataControls />
              <Button
                variant="primary"
                size="sm"
                disabled={!ready}
                onClick={() => toast.success("Data model created")}
              >
                Create data model
              </Button>
            </div>
          </div>
        </div>

        {/* Event class + type */}
        <section className="rounded-md border border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nd-event-class">Select an event class for this data model</Label>
              <Select value={eventClass} onValueChange={setEventClass}>
                <SelectTrigger id="nd-event-class" className="w-full">
                  <SelectValue placeholder="Select an event class" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {OCSF_CLASS_GROUPS.map((group) => (
                    <SelectGroup key={group.category}>
                      <SelectLabel>{group.category}</SelectLabel>
                      {group.classes.map((klass) => (
                        <SelectItem key={klass} value={klass}>
                          {klass}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-hint text-muted-foreground">
                OCSF 1.3.0 · normalized destination schema for this model.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nd-type">Type</Label>
              <Select value={delivery} onValueChange={(value) => setDelivery(value as Delivery)}>
                <SelectTrigger id="nd-type" className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materialized_view">Materialized view</SelectItem>
                  <SelectItem value="pipeline">Pipeline</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-hint text-muted-foreground">
                How the normalized table is delivered and refreshed.
              </p>
            </div>
          </div>

          {ready ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <Badge variant="secondary" className="font-normal">
                OCSF 1.3.0
              </Badge>
              <Badge variant="indigo" className="font-normal">
                {eventClass}
              </Badge>
              <Badge variant="teal" className="gap-1 font-normal">
                <DeliveryIcon delivery={delivery} className="h-3 w-3" />
                {delivery === "materialized_view"
                  ? "Materialized view"
                  : delivery === "pipeline"
                    ? "Pipeline"
                    : "View"}
              </Badge>
              <code className="text-hint text-muted-foreground">{destinationTable}</code>
            </div>
          ) : null}
        </section>

        {/* Sources / Enrichments */}
        <Tabs defaultValue="sources">
          <TabsList variant="line">
            <TabsTrigger value="sources">Sources (0)</TabsTrigger>
            <TabsTrigger value="enrichments">Enrichments (0)</TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="mt-4">
            <EmptyState
              title="No sources yet"
              body="Map a datasource parser destination table or an existing Unity Catalog table into this data model."
              action={
                <Button variant="primary" size="sm" asChild>
                  <Link href="/lakewatch/normalizers/new">
                    <PlusIcon size={16} />
                    Add source
                  </Link>
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="enrichments" className="mt-4">
            <EmptyState
              title="No enrichments yet"
              body="Add context from reference feeds — geolocation, threat intel, identity, asset, and ML scoring — to populate extra OCSF fields."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!ready}
                  onClick={() => toast("Enrichment builder is coming soon")}
                >
                  <PlusIcon size={16} />
                  Add enrichment
                </Button>
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-6 py-12 text-center">
      <DataModelNavIcon size={24} className="text-muted-foreground" />
      <p className="font-semibold text-foreground">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{body}</p>
      <div className="mt-2">{action}</div>
    </div>
  )
}

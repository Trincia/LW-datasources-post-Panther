"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"

import { ChevronDownIcon, TableIcon } from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { WizardStepMenu } from "@/components/lakewatch/datasources-new/WizardStepMenu"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const CONNECT_STEPS = ["Ingest", "Create datasource"] as const

export const CONNECT_SOURCES = {
  slack: "Slack",
  "1password": "1Password",
  m365: "Microsoft 365",
  crowdstrike: "CrowdStrike",
  appomni: "AppOmni",
  auditd: "Auditd",
  auth0: "Auth0",
  bedrock: "Bedrock Model Invocation",
  "carbon-black-audit": "Carbon Black Audit Logs",
  "carbon-black-streaming": "Carbon Black Data Streaming",
  envoy: "Envoy",
  "iru-kandji": "Iru (Kandji)",
  island: "Island",
  "defender-xdr": "Microsoft Defender XDR",
  notion: "Notion",
  okta: "Okta",
  "palo-alto-ngfw": "Palo Alto Next-Generation Firewall",
  proofpoint: "Proofpoint",
  "push-security": "Push Security",
  "sublime-security": "Sublime Security",
  "tenable-vm": "Tenable Vulnerability Management",
  "windows-event-logs": "Windows Event Logs",
  "google-workspace": "Google Workspace",
  heroku: "Heroku",
  duo: "Duo",
  socradar: "SOCRadar",
  "aws-vpc": "AWS VPC",
  "hex-webhook": "Hex Webhook",
  "wiz-webhook": "Wiz Webhook",
  "aws-cloudfront": "AWS CloudFront",
  "aws-cloudtrail": "AWS CloudTrail",
  "amazon-security-lake": "Amazon Security Lake",
  "aws-guardduty": "AWS GuardDuty",
  "aws-security-hub": "AWS Security Hub",
  "zscaler-zia": "Zscaler ZIA",
  "zscaler-zpa": "Zscaler ZPA",
} as const

export type LakewatchConnectSource = keyof typeof CONNECT_SOURCES

function WizardStepper({
  activeStep,
  steps = CONNECT_STEPS,
}: {
  activeStep: number
  steps?: readonly string[]
}) {
  return (
    <ol aria-label="Datasource setup progress" className="flex flex-col">
      {steps.map((label, index) => {
        const step = index + 1
        const active = step === activeStep
        const complete = step < activeStep

        return (
          <li key={label} className="flex flex-col">
            <div className="flex items-center gap-3.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                  active
                    ? "border-blue-400 bg-blue-400 text-white"
                    : complete
                      ? "border-blue-400 bg-blue-400/10 text-blue-400"
                      : "border-muted-foreground text-muted-foreground"
                )}
                aria-current={active ? "step" : undefined}
              >
                {complete ? <Check className="h-4 w-4" /> : step}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-sm",
                  active || complete
                    ? "font-semibold text-blue-400"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span className="ml-[13px] my-2 h-5 w-px bg-muted-foreground/60" aria-hidden />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function StepPanelHeader({
  step,
  title,
  description,
}: {
  step: number
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-24 shrink-0 flex-col justify-center gap-1 border-b border-input bg-muted px-6 py-4">
      <p className="text-sm font-semibold text-foreground">STEP {step}</p>
      <h2 className="text-lg font-semibold leading-6 text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

/** Figma 144:27282 / 155:31119 — Lakeflow Connect two-step ingest wizard. */
export function LakewatchLakeflowConnectWizardView({
  source,
}: {
  source: LakewatchConnectSource
}) {
  const router = useRouter()
  const label = CONNECT_SOURCES[source]
  const connections = [`${source}-connection`, `${source}-connection-2`]

  const [activeStep, setActiveStep] = React.useState(1)
  const [connection, setConnection] = React.useState("")
  const [datasourceName, setDatasourceName] = React.useState("")
  const [bronzeTable, setBronzeTable] = React.useState("")
  const [scheduleMode, setScheduleMode] = React.useState("at-least-every")
  const [scheduleInterval, setScheduleInterval] = React.useState("10")
  const [scheduleUnit, setScheduleUnit] = React.useState("minutes")
  const [sourceName, setSourceName] = React.useState<string>(label)
  const [sourceType, setSourceType] = React.useState("events")
  const [previewVisible, setPreviewVisible] = React.useState(true)
  const [previewExpanded, setPreviewExpanded] = React.useState(true)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [contentWidth, setContentWidth] = React.useState(0)

  React.useEffect(() => {
    const el = contentRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setContentWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Collapse the vertical stepper into a compact button when width is tight
  // (e.g. the Genie code panel is open).
  const compact = contentWidth > 0 && contentWidth < 900

  const cancelHref = "/lakewatch/datasources/new"

  const description = `Select an existing ${label} connection or create a new one to ingest data.`

  const handleFinish = () => {
    const name = datasourceName.trim() || `${source}-datasource`
    router.push(`/lakewatch/datasources/${encodeURIComponent(name)}`)
  }

  return (
    <div
      ref={contentRef}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 lg:overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/lakewatch/datasources">Datasources</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/lakewatch/datasources/new">Add new datasource</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className={PAGE_TITLE_SEMIBOLD}>Ingest from {label}</h1>
            <WizardStepMenu
              steps={CONNECT_STEPS}
              activeStep={activeStep}
              className={compact ? undefined : "hidden"}
            />
          </div>
        </div>
        <LakewatchDataControls />
      </div>

      <div
        className={cn(
          "mx-auto mt-6 grid w-full grid-cols-1 items-start lg:min-h-0 lg:flex-1",
          compact
            ? "max-w-[679px]"
            : "max-w-[1168px] gap-8 lg:grid-cols-[220px_minmax(0,679px)] lg:gap-20 xl:gap-40"
        )}
      >
        {!compact ? (
          <div>
            <WizardStepper activeStep={activeStep} />
          </div>
        ) : null}

        {activeStep === 1 ? (
          <form
            className="flex w-full flex-col overflow-hidden rounded-md border border-border"
            onSubmit={(event) => {
              event.preventDefault()
              setActiveStep(2)
            }}
          >
            <StepPanelHeader
              step={1}
              title={`Ingest datasource from ${label}`}
              description={description}
            />

            <div className="flex min-h-[240px] flex-col px-8 py-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="connect-connection">Connection</Label>
                <Select value={connection} onValueChange={setConnection}>
                  <SelectTrigger id="connect-connection" className="w-full">
                    <SelectValue placeholder="Select a connection" />
                  </SelectTrigger>
                  <SelectContent>
                    {connections.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                    <SelectItem value="__create__">+ Create new connection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-auto flex items-center justify-between pt-8">
                <Button
                  asChild
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-0 font-normal text-primary hover:bg-transparent hover:text-primary"
                >
                  <Link href={cancelHref}>Cancel</Link>
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Continue
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <form
            className="flex w-full flex-col overflow-hidden rounded-md border border-border"
            onSubmit={(event) => {
              event.preventDefault()
              handleFinish()
            }}
          >
            <StepPanelHeader
              step={2}
              title={`Create datasource from ${label}`}
              description={description}
            />

            <div className="flex min-h-[370px] flex-col gap-5 px-8 py-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="connect-datasource-name">Datasource name *</Label>
                <p className="text-hint text-muted-foreground">
                  Enter a name for the datasource
                </p>
                <Input
                  id="connect-datasource-name"
                  value={datasourceName}
                  onChange={(event) => setDatasourceName(event.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="connect-bronze-table">Bronze table *</Label>
                <p className="text-hint text-muted-foreground">
                  Enter a fully qualified table name in the format{" "}
                  <span className="font-mono">catalog.schema.table</span>.
                </p>
                <Input
                  id="connect-bronze-table"
                  value={bronzeTable}
                  onChange={(event) => setBronzeTable(event.target.value)}
                  placeholder="lakewatch.default.slack_audit_logs"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Processing schedule</Label>
                <div className="flex items-center gap-2">
                  <Select value={scheduleMode} onValueChange={setScheduleMode}>
                    <SelectTrigger className="w-[172px]" aria-label="Schedule frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="at-least-every">At least every</SelectItem>
                      <SelectItem value="at-most-every">At most every</SelectItem>
                      <SelectItem value="exactly-every">Exactly every</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    aria-label="Schedule interval"
                    inputMode="numeric"
                    value={scheduleInterval}
                    onChange={(event) => setScheduleInterval(event.target.value)}
                    className="w-24"
                  />
                  <Select value={scheduleUnit} onValueChange={setScheduleUnit}>
                    <SelectTrigger className="w-[150px]" aria-label="Schedule unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-hint text-muted-foreground">
                  The datasource will be scheduled to run on this interval. Under certain
                  circumstances it may run more frequently than this.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="connect-source">Source *</Label>
                <p className="text-hint text-muted-foreground">
                  The name of the datasource system (e.g., Slack, Workday, Crowdstrike)
                </p>
                <Input
                  id="connect-source"
                  value={sourceName}
                  onChange={(event) => setSourceName(event.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="connect-source-type">Source type *</Label>
                <p className="text-hint text-muted-foreground">
                  The type of data being ingested from the source (e.g., auditPlogs, events)
                </p>
                <Input
                  id="connect-source-type"
                  value={sourceType}
                  onChange={(event) => setSourceType(event.target.value)}
                  required
                />
              </div>

              <div className="mt-auto flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-0 font-normal text-primary hover:bg-transparent hover:text-primary"
                  onClick={() => setActiveStep(1)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Finish
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      {previewVisible ? (
        <section
          aria-label="Data preview"
          className="-mx-5 -mb-5 mt-4 shrink-0 bg-secondary"
        >
          <div className="flex h-8 items-center justify-between border-y border-input px-2">
            <h2 className="text-sm font-semibold leading-5 text-foreground">Data preview</h2>
            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={previewExpanded ? "Collapse data preview" : "Expand data preview"}
                onClick={() => setPreviewExpanded((current) => !current)}
              >
                <ChevronDownIcon
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    !previewExpanded && "-rotate-90"
                  )}
                />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close data preview"
                onClick={() => setPreviewVisible(false)}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          {previewExpanded ? (
            <div className="flex h-[94px] flex-col items-center justify-center gap-1">
              <TableIcon className="h-9 w-9 text-muted-foreground" />
              <p className="text-sm leading-5 text-foreground">
                Configure a table to see a preview
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

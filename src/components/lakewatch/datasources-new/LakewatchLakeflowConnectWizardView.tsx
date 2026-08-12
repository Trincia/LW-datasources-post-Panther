"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Check,
  Filter,
  LoaderCircle,
  MoreVertical,
  Pencil,
  Plus,
  SquareArrowOutUpRight,
  X,
} from "lucide-react"

import { ChevronDownIcon, TableIcon } from "@/components/icons"
import { LakewatchDataControls } from "@/components/lakewatch/LakewatchWarehouseSelector"
import {
  IntegrationTemplatePanel,
  IntegrationTemplatesField,
  useIntegrationTemplates,
} from "@/components/lakewatch/datasources-new/IntegrationTemplatesField"
import {
  WizardAnnotationsField,
  WizardComputeModeField,
  WizardProcessingScheduleField,
} from "@/components/lakewatch/datasources-new/LakewatchAwsS3WizardView"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

const CONNECT_STEPS = ["Connection", "Name & Ingestion templates", "Additional details"] as const

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

type ConnectionRow = {
  name: string
  owner: string
  createdAt: string
}

/** Formats the current time as "YYYY-MM-DD HH:MM:SS" for new connection rows. */
function formatNow(): string {
  const now = new Date()
  const pad = (value: number) => value.toString().padStart(2, "0")
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  )
}

/** Builds a deterministic set of source-specific connections for the prototype. */
function buildConnectionRows(source: string): ConnectionRow[] {
  const owners = [
    "michael.andersen@databricks.com",
    "sarah.dev@databricks.com",
    "security-platform@databricks.com",
    "james.lee@databricks.com",
    "priya.nair@databricks.com",
    "ci-deploy-bot@databricks.com",
  ]
  const dates = [
    "2026-03-11 11:46:44",
    "2026-02-28 09:12:03",
    "2026-01-22 16:03:57",
    "2025-12-15 08:41:20",
    "2025-11-30 14:22:10",
    "2025-10-05 10:18:36",
  ]
  const suffixes = ["prod", "security", "staging", "audit-logs", "sandbox", "backfill"]
  return suffixes.map((suffix, index) => ({
    name: `${source}-${suffix}`,
    owner: owners[index],
    createdAt: dates[index],
  }))
}

/** Figma 144:27282 / 155:31119 — Lakeflow Connect two-step ingest wizard. */
export function LakewatchLakeflowConnectWizardView({
  source,
}: {
  source: LakewatchConnectSource
}) {
  const router = useRouter()
  const label = CONNECT_SOURCES[source]
  const [connectionRows, setConnectionRows] = React.useState<ConnectionRow[]>(() =>
    buildConnectionRows(source)
  )

  const [activeStep, setActiveStep] = React.useState(1)
  const [connection, setConnection] = React.useState(connectionRows[0]?.name ?? "")
  const [connectionFilter, setConnectionFilter] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editingConnection, setEditingConnection] = React.useState<string | null>(null)
  const [newConnName, setNewConnName] = React.useState("")
  const [newClientId, setNewClientId] = React.useState("")
  const [newClientSecret, setNewClientSecret] = React.useState("")
  const [signingIn, setSigningIn] = React.useState(false)
  const [datasourceName, setDatasourceName] = React.useState("")
  const [catalog, setCatalog] = React.useState("lakewatch")
  const [schema, setSchema] = React.useState("default")
  const [datasourceDescription, setDatasourceDescription] = React.useState("")
  const [previewVisible, setPreviewVisible] = React.useState(true)
  const [previewExpanded, setPreviewExpanded] = React.useState(true)
  const templateController = useIntegrationTemplates(label)
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
  // (e.g. the Genie code panel is open) or the template detail panel is open.
  const compact = contentWidth > 0 && contentWidth < 900
  const templatePanelOpen = activeStep === 2 && templateController.panelOpen
  const stepperCollapsed = templatePanelOpen || compact

  const cancelHref = "/lakewatch/datasources/new"

  const description = `Select an existing ${label} connection or create a new one to ingest data.`

  const handleFinish = () => {
    const name = datasourceName.trim() || `${source}-datasource`
    router.push(`/lakewatch/datasources/${encodeURIComponent(name)}`)
  }

  const sampleConnName = `${source}-audit-logs`
  const sampleClientId = "48291057304.7382910485726"
  const sampleClientSecret = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
  const createReady = Boolean(
    newConnName.trim() && newClientId.trim() && newClientSecret.trim()
  )

  const openCreateConnection = () => {
    setEditingConnection(null)
    setNewConnName("")
    setNewClientId("")
    setNewClientSecret("")
    setSigningIn(false)
    setCreateOpen(true)
  }

  const openEditConnection = (row: ConnectionRow) => {
    setEditingConnection(row.name)
    setNewConnName(row.name)
    setNewClientId("")
    setNewClientSecret("")
    setSigningIn(false)
    setCreateOpen(true)
  }

  const handleCreateConnection = () => {
    if (!createReady || signingIn) return
    setSigningIn(true)
    window.setTimeout(() => {
      const name = newConnName.trim()
      if (editingConnection) {
        setConnectionRows((rows) =>
          rows.map((row) =>
            row.name === editingConnection ? { ...row, name } : row
          )
        )
        if (connection === editingConnection) setConnection(name)
      } else {
        setConnectionRows((rows) => {
          const next: ConnectionRow = {
            name,
            owner: "beau.trincia@databricks.com",
            createdAt: formatNow(),
          }
          return [next, ...rows.filter((row) => row.name !== name)]
        })
        setConnection(name)
      }
      setSigningIn(false)
      setCreateOpen(false)
      setEditingConnection(null)
    }, 1400)
  }

  const filteredConnectionRows = connectionRows.filter((row) => {
    const query = connectionFilter.trim().toLowerCase()
    if (!query) return true
    return (
      row.name.toLowerCase().includes(query) ||
      row.owner.toLowerCase().includes(query)
    )
  })

  const dataPreviewSection = previewVisible ? (
    <section
      aria-label="Data preview"
      className={cn(
        "shrink-0 bg-secondary",
        templatePanelOpen ? undefined : "-mx-5 -mb-5 mt-auto"
      )}
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
  ) : null

  return (
    <div ref={contentRef} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className={cn(
          "flex min-h-0 flex-1 overflow-hidden",
          templatePanelOpen ? "flex-col lg:flex-row" : "flex-col"
        )}
      >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
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
              className={stepperCollapsed ? undefined : "hidden"}
            />
          </div>
        </div>
        <LakewatchDataControls />
      </div>

      <div
        className={cn(
          "grid grid-cols-1 min-h-0 flex-1",
          templatePanelOpen
            ? "mt-4 w-full"
            : compact
              ? "mx-auto mt-6 w-full max-w-[679px]"
              : "mx-auto mt-6 w-full items-start gap-8 max-w-[1168px] lg:grid-cols-[220px_minmax(0,679px)] lg:gap-20 xl:gap-40"
        )}
      >
        {!stepperCollapsed ? (
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
              title={`Connection from ${label}`}
              description={description}
            />

            <div className="flex min-h-[240px] flex-col px-8 py-6">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-foreground">
                  Connection to the source
                </p>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      aria-label="Filter connections"
                      value={connectionFilter}
                      onChange={(event) => setConnectionFilter(event.target.value)}
                      placeholder="Type to filter"
                      className="pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="shrink-0"
                    onClick={openCreateConnection}
                  >
                    <Plus className="h-4 w-4" />
                    Create connection
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Connection</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Created at</TableHead>
                      <TableHead className="w-24 text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConnectionRows.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={4}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No connections match “{connectionFilter}”.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredConnectionRows.map((row) => {
                        const selected = connection === row.name
                        return (
                          <TableRow
                            key={row.name}
                            data-state={selected ? "selected" : undefined}
                            className="cursor-pointer"
                            onClick={() => setConnection(row.name)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    "flex size-4 shrink-0 items-center justify-center rounded-full border",
                                    selected
                                      ? "border-primary bg-primary"
                                      : "border-border bg-muted-foreground/20"
                                  )}
                                >
                                  {selected ? (
                                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                  ) : null}
                                </span>
                                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                                  {row.name}
                                  <SquareArrowOutUpRight className="h-3.5 w-3.5" />
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-foreground">
                              {row.owner}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {row.createdAt}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  aria-label={`Edit ${row.name}`}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    openEditConnection(row)
                                  }}
                                >
                                  <Pencil className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-xs"
                                      aria-label={`More actions for ${row.name}`}
                                      onClick={(event) => event.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        openEditConnection(row)
                                      }}
                                    >
                                      Edit connection
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(event) => event.stopPropagation()}
                                    >
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={(event) => event.stopPropagation()}
                                    >
                                      Delete connection
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
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
        ) : activeStep === 2 ? (
          <form
            className={cn(
              "flex min-h-0 flex-col overflow-hidden rounded-md border border-border",
              templatePanelOpen ? "lg:my-6 lg:ml-5 lg:mr-6" : "w-full h-full"
            )}
            onSubmit={(event) => {
              event.preventDefault()
              setActiveStep(3)
            }}
          >
            <StepPanelHeader
              step={2}
              title="Name & Ingestion templates"
              description={`Name your datasource and select the ingestion templates Lakewatch should use to classify data from ${label}.`}
            />

            <div className="flex min-h-[370px] flex-1 flex-col overflow-y-auto px-8 py-6 lg:min-h-0">
              <div className="mb-5 flex flex-col">
                <Label className="mb-2">Datasource name *</Label>
                <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-2">
                  <Select value={catalog} onValueChange={setCatalog} disabled>
                    <SelectTrigger className="w-full" aria-label="Catalog">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lakewatch">lakewatch</SelectItem>
                      <SelectItem value="main">main</SelectItem>
                      <SelectItem value="security">security</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={schema} onValueChange={setSchema}>
                    <SelectTrigger className="w-full" aria-label="Schema">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">default</SelectItem>
                      <SelectItem value="bronze">bronze</SelectItem>
                      <SelectItem value="production">production</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    aria-label="Datasource name"
                    value={datasourceName}
                    onChange={(event) => setDatasourceName(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <IntegrationTemplatesField controller={templateController} hideHeader />
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-input px-8 py-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveStep(1)}
              >
                Back
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Continue
              </Button>
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
              step={3}
              title="Additional details"
              description="Configure how often Lakewatch runs this datasource and add optional metadata"
            />

            <div className="flex min-h-[370px] flex-col gap-5 px-8 py-6">
              <WizardProcessingScheduleField />
              <WizardComputeModeField />
              <div className="flex flex-col gap-2">
                <Label htmlFor="connect-description">Description (optional)</Label>
                <Textarea
                  id="connect-description"
                  value={datasourceDescription}
                  onChange={(event) => setDatasourceDescription(event.target.value)}
                  placeholder="Add a description for this datasource"
                  className="min-h-[80px]"
                />
              </div>
              <WizardAnnotationsField />

              <div className="mt-auto flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveStep(2)}
                >
                  Back
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create datasource
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      {!templatePanelOpen ? dataPreviewSection : null}
      </div>

      {templatePanelOpen ? (
        <IntegrationTemplatePanel
          controller={templateController}
          className="min-h-0 w-full flex-1 border-t border-input lg:w-[520px] lg:flex-none lg:border-l lg:border-t-0"
        />
      ) : null}
      </div>

      {templatePanelOpen ? dataPreviewSection : null}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (signingIn) return
          setCreateOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {editingConnection ? "Edit" : "Create"} {label} connection
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-conn-name">Connection name *</Label>
              <p className="text-hint text-muted-foreground">
                A unique name for this new Unity Catalog connection.
              </p>
              <Input
                id="new-conn-name"
                value={newConnName}
                onChange={(event) => setNewConnName(event.target.value)}
                onFocus={() => setNewConnName((current) => current || sampleConnName)}
                onClick={() => setNewConnName((current) => current || sampleConnName)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-client-id">Client ID *</Label>
              <p className="text-hint text-muted-foreground">
                The OAuth 2.0 Client ID from your {label} app credentials.
              </p>
              <Input
                id="new-client-id"
                value={newClientId}
                onChange={(event) => setNewClientId(event.target.value)}
                onFocus={() => setNewClientId((current) => current || sampleClientId)}
                onClick={() => setNewClientId((current) => current || sampleClientId)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-client-secret">Client secret *</Label>
              <p className="text-hint text-muted-foreground">
                The OAuth 2.0 Client Secret from your {label} app credentials.
              </p>
              <Input
                id="new-client-secret"
                type="password"
                value={newClientSecret}
                onChange={(event) => setNewClientSecret(event.target.value)}
                onFocus={() =>
                  setNewClientSecret((current) => current || sampleClientSecret)
                }
                onClick={() =>
                  setNewClientSecret((current) => current || sampleClientSecret)
                }
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full"
              disabled={!createReady || signingIn}
              onClick={handleCreateConnection}
            >
              {signingIn ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : null}
              Sign in with {label} Audit Logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

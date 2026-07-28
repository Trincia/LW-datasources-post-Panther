"use client"

import * as React from "react"
import Link from "next/link"
import { Check, LoaderCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { SparkleIcon } from "@/components/icons"
import { LakewatchWarehouseSelector } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { DbIcon } from "@/components/ui/db-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const WIZARD_STEPS = [
  "Basic info",
  "Create IAM role",
  "S3 prefix & schemas",
  "Additional details",
] as const

type BasicInfoField = "name" | "awsAccountId" | "bucketName" | "kmsKeyArn"

const FIELD_EXAMPLES: Record<BasicInfoField, string> = {
  name: "production-cloudtrail-s3",
  awsAccountId: "123456789012",
  bucketName: "acme-prod-cloudtrail-logs",
  kmsKeyArn: "arn:aws:kms:us-west-2:123456789012:key/abcd1234-ef56-7890-ab12-cd34ef567890",
}

type BasicInfoValues = Record<BasicInfoField, string>

const EMPTY_VALUES: BasicInfoValues = {
  name: "",
  awsAccountId: "",
  bucketName: "",
  kmsKeyArn: "",
}

const SCHEMA_OPTIONS = [
  "AWS.ALB",
  "AWS.AuroraMySQLAudit",
  "AWS.BedrockModelInvocation",
  "AWS.CloudFrontAccess",
  "AWS.CloudTrail",
  "AWS.CloudTrailDigest",
  "AWS.Config",
  "AWS.EKS.Audit",
  "AWS.EKS.Authenticator",
  "AWS.ELB",
  "AWS.GuardDuty",
  "AWS.S3ServerAccess",
  "AWS.SecurityHub",
  "AWS.VPCDns",
  "AWS.VPCFlow",
  "AWS.WAF",
  "Atlassian.Audit",
  "Auth0.Events",
  "Azure.Activity",
  "Azure.Audit",
  "Azure.Monitor.Activity",
  "Bitwarden.Events",
  "Box.Event",
  "CARBONBLACK",
  "CarbonBlack.AlertV2",
  "CarbonBlack.Audit",
  "CarbonBlack.EndpointEvent",
  "CarbonBlack.WatchlistHit",
  "Cisco.ASA",
  "Cisco.Duo.Administrator",
  "Cisco.Duo.Auth",
  "Cisco.Duo.OfflineEnrollment",
  "Cisco.Duo.Telephony",
  "Cisco.Umbrella.DNS",
  "Cisco.Umbrella.Proxy",
  "Cloudflare.Audit",
  "Cloudflare.Firewall",
  "Cloudflare.HttpRequest",
  "Cloudflare.Spectrum",
  "Crowdstrike.ActivityAudit",
  "Crowdstrike.Aidmaster",
  "Crowdstrike.DetectionSummary",
  "Crowdstrike.DNSRequest",
  "Crowdstrike.FDREvent",
  "Crowdstrike.NetworkConnect",
  "Crowdstrike.ProcessRollup2",
  "Crowdstrike.UserInfo",
  "Databricks.Audit",
  "Dropbox.TeamEvent",
  "Duo.Administrator",
  "Duo.Authentication",
  "Fastly.Access",
  "GCP.Audit",
  "GCP.DNS",
  "GCP.Firewall",
  "GCP.HTTPLoadBalancer",
  "GitHub.Audit",
  "GitHub.Webhook",
  "GitLab.API",
  "GitLab.Audit",
  "GSuite.ActivityEvent",
  "GSuite.Reports",
  "Heroku.Runtime",
  "Jamf.ComputerInventory",
  "JumpCloud.DirectoryInsights",
  "Microsoft365.Audit.AzureActiveDirectory",
  "Microsoft365.Audit.Exchange",
  "Microsoft365.Audit.General",
  "Microsoft365.Audit.SharePoint",
  "Microsoft365.Dlp.All",
  "MicrosoftGraph.SecurityAlert",
  "Nginx.Access",
  "Notion.Audit",
  "Okta.SystemLog",
  "OneLogin.Events",
  "OnePassword.AuditEvent",
  "OnePassword.ItemUsage",
  "OnePassword.SignInAttempt",
  "Osquery.Batch",
  "Osquery.Differential",
  "Osquery.Snapshot",
  "Osquery.Status",
  "PaloAlto.Firewall",
  "Ping.Directory",
  "Salesforce.Login",
  "Salesforce.Logout",
  "SentinelOne.Activity",
  "SentinelOne.DeepVisibility",
  "SentinelOne.Threat",
  "Slack.AuditLogs",
  "Snyk.GroupAudit",
  "Snyk.OrgAudit",
  "Snowflake.LoginHistory",
  "Snowflake.QueryHistory",
  "Sophos.Central",
  "Suricata.Alert",
  "Suricata.DNS",
  "Suricata.HTTP",
  "Sysdig.Audit",
  "Tailscale.Audit",
  "Tailscale.Network",
  "Tenable.Vulnerability",
  "Torq.Activity",
  "Windows.EventLogs",
  "Zeek.Conn",
  "Zeek.DNS",
  "Zeek.HTTP",
  "Zscaler.ZIA.WebLog",
  "Zscaler.ZPA.UserActivity",
] as const

const DETECTED_SCHEMAS = [
  "CarbonBlack.AlertV2",
  "CarbonBlack.Audit",
  "CarbonBlack.EndpointEvent",
]

function WizardStepper({ activeStep }: { activeStep: number }) {
  return (
    <ol aria-label="Datasource setup progress" className="flex flex-col">
      {WIZARD_STEPS.map((label, index) => {
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
            {index < WIZARD_STEPS.length - 1 ? (
              <span className="ml-[13px] h-9 w-px bg-muted-foreground/60" aria-hidden />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function WizardField({
  id,
  label,
  required,
  value,
  onChange,
  onSelectField,
}: {
  id: string
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  onSelectField: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? " *" : null}
      </Label>
      <Input
        id={id}
        name={id}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onSelectField}
        onClick={onSelectField}
      />
    </div>
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
    <div className="flex min-h-24 flex-col justify-center gap-1 border-b border-border bg-muted px-6 py-4">
      <p className="text-sm font-semibold text-foreground">STEP {step}</p>
      <h2 className="text-lg font-semibold leading-6 text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function IamSetupOption({
  id,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next === true)}
        className="mt-0.5"
      />
      <div className="flex flex-col gap-1">
        <Label htmlFor={id}>{title}</Label>
        <p className="max-w-[460px] text-sm leading-5 text-foreground">{description}</p>
      </div>
    </div>
  )
}

function SchemaMultiSelect({
  selected,
  onSelectedChange,
  open,
  onOpenChange,
  query,
  onQueryChange,
}: {
  selected: string[]
  onSelectedChange: (schemas: string[]) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  onQueryChange: (query: string) => void
}) {
  const toggleSchema = (schema: string) => {
    onSelectedChange(
      selected.includes(schema)
        ? selected.filter((item) => item !== schema)
        : [...selected, schema]
    )
  }

  const addTypedSchema = () => {
    const schema = query.trim()
    if (!schema) return
    if (!selected.includes(schema)) onSelectedChange([...selected, schema])
    onQueryChange("")
  }

  const removeSchema = (schema: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onSelectedChange(selected.filter((item) => item !== schema))
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          tabIndex={0}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex h-auto min-h-8 w-full cursor-pointer items-center justify-start gap-1 rounded border border-input bg-transparent px-2 py-1 text-sm font-normal outline-none hover:border-primary hover:bg-[var(--action-default-bg-hover)] focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onOpenChange(!open)
            }
          }}
        >
          {selected.length > 0 ? (
            <span className="flex min-w-0 flex-wrap gap-1">
              {selected.map((schema) => (
                <Badge key={schema} variant="default_tag" className="pr-0.5">
                  {schema}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="size-4 shrink-0 rounded-sm text-current hover:bg-transparent hover:text-foreground"
                    aria-label={`Remove ${schema}`}
                    onClick={(event) => removeSchema(schema, event)}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <X className="size-3" aria-hidden />
                  </Button>
                </Badge>
              ))}
            </span>
          ) : (
            <span className="text-muted-foreground">Select schemas</span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0"
      >
        <Command>
          <CommandInput
            placeholder="Type or search schemas"
            value={query}
            onValueChange={onQueryChange}
            onKeyDown={(event) => {
              if (event.key === "Enter" && query.trim()) {
                event.preventDefault()
                addTypedSchema()
              }
            }}
          />
          <CommandList className="max-h-[264px]">
            <CommandEmpty>
              {query.trim() ? "Press Enter to add this schema" : "No schemas found"}
            </CommandEmpty>
            <CommandGroup>
              {SCHEMA_OPTIONS.map((schema) => {
                const checked = selected.includes(schema)
                return (
                  <CommandItem
                    key={schema}
                    value={schema}
                    onSelect={() => toggleSchema(schema)}
                  >
                    <Checkbox checked={checked} aria-label={`Select ${schema}`} />
                    <span>{schema}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/** Figma 2492:126609 form adapted to dark mode with stepper 2499:117853. */
export function LakewatchAwsS3WizardView() {
  const router = useRouter()
  const [activeStep, setActiveStep] = React.useState(1)
  const [values, setValues] = React.useState<BasicInfoValues>(EMPTY_VALUES)
  const [useAwsConsole, setUseAwsConsole] = React.useState(false)
  const [useTemplate, setUseTemplate] = React.useState(false)
  const [s3Prefix, setS3Prefix] = React.useState("")
  const [selectedSchemas, setSelectedSchemas] = React.useState<string[]>([])
  const [schemaQuery, setSchemaQuery] = React.useState("")
  const [schemaOpen, setSchemaOpen] = React.useState(false)
  const [detectingSchemas, setDetectingSchemas] = React.useState(false)
  const [alarmEnabled, setAlarmEnabled] = React.useState(true)
  const [alarmNumber, setAlarmNumber] = React.useState("1")
  const [alarmPeriod, setAlarmPeriod] = React.useState("days")
  const [catalog, setCatalog] = React.useState("lakewatch")
  const [schema, setSchema] = React.useState("default")
  const [datasourceName, setDatasourceName] = React.useState("lakewatch-account-us-west-2")
  const [runAs, setRunAs] = React.useState("beau.trincia@databricks.com")
  const detectionTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const canContinue = Object.values(values).every((value) => value.trim().length > 0)
  const canContinueFromIam = useAwsConsole || useTemplate
  const detectSchemasDisabled =
    detectingSchemas || selectedSchemas.length > 0 || schemaQuery.trim().length > 0

  React.useEffect(
    () => () => {
      if (detectionTimer.current) clearTimeout(detectionTimer.current)
    },
    []
  )

  const fillExample = (field: BasicInfoField) => {
    setValues((current) => {
      if (current[field].trim().length > 0) return current
      return { ...current, [field]: FIELD_EXAMPLES[field] }
    })
  }

  const detectSchemas = () => {
    if (detectSchemasDisabled) return
    setSchemaOpen(false)
    setDetectingSchemas(true)
    detectionTimer.current = setTimeout(() => {
      setSelectedSchemas(DETECTED_SCHEMAS)
      setSchemaQuery("")
      setDetectingSchemas(false)
      detectionTimer.current = null
    }, 1400)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
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
                <BreadcrumbPage>Add new datasource</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className={PAGE_TITLE_SEMIBOLD}>Create AWS S3 datasource</h1>
        </div>
        <LakewatchWarehouseSelector />
      </div>

      <div className="mx-auto mt-6 grid w-full max-w-[1168px] grid-cols-1 items-start gap-8 lg:grid-cols-[220px_minmax(0,679px)] lg:gap-20 xl:gap-40">
        <WizardStepper activeStep={activeStep} />

        {activeStep === 1 ? (
          <form
            className="w-full overflow-hidden rounded-md border border-border lg:mt-16"
            onSubmit={(event) => {
              event.preventDefault()
              if (canContinue) setActiveStep(2)
            }}
          >
            <StepPanelHeader
              step={1}
              title="Configure your source"
              description="We need to know where to get your logs from"
            />

            <div className="flex flex-col gap-4 px-8 py-6">
              <WizardField
                id="datasource-name"
                label="Name"
                required
                value={values.name}
                onChange={(name) => setValues((current) => ({ ...current, name }))}
                onSelectField={() => fillExample("name")}
              />
              <WizardField
                id="aws-account-id"
                label="AWS account ID"
                required
                value={values.awsAccountId}
                onChange={(awsAccountId) =>
                  setValues((current) => ({ ...current, awsAccountId }))
                }
                onSelectField={() => fillExample("awsAccountId")}
              />
              <WizardField
                id="bucket-name"
                label="Bucket name"
                required
                value={values.bucketName}
                onChange={(bucketName) =>
                  setValues((current) => ({ ...current, bucketName }))
                }
                onSelectField={() => fillExample("bucketName")}
              />
              <WizardField
                id="kms-key-arn"
                label="KMS key ARN (optional)"
                value={values.kmsKeyArn}
                onChange={(kmsKeyArn) =>
                  setValues((current) => ({ ...current, kmsKeyArn }))
                }
                onSelectField={() => fillExample("kmsKeyArn")}
              />

              <div className="mt-4 flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/lakewatch/datasources/new">Cancel</Link>
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={!canContinue}>
                  Continue
                </Button>
              </div>
            </div>
          </form>
        ) : activeStep === 2 ? (
          <form
            className="w-full overflow-hidden rounded-md border border-border lg:mt-16"
            onSubmit={(event) => {
              event.preventDefault()
              if (canContinueFromIam) setActiveStep(3)
            }}
          >
            <StepPanelHeader
              step={2}
              title="IAM role setup"
              description="Select how you want to set up your IAM role and grant Lakewatch read access to your logs"
            />

            <div className="flex min-h-[348px] flex-col px-8 py-6">
              <div className="flex flex-col gap-6">
                <IamSetupOption
                  id="use-aws-console"
                  title="Using the AWS console UI"
                  description="Launch a CloudFormation stack using the AWS console, reading the instructions from our docs"
                  checked={useAwsConsole}
                  onCheckedChange={setUseAwsConsole}
                />
                <IamSetupOption
                  id="use-infrastructure-template"
                  title="CloudFormation or Terraform file"
                  description="Download an infrastructure-as-code template file to deploy in your environment"
                  checked={useTemplate}
                  onCheckedChange={setUseTemplate}
                />
              </div>

              <Button variant="link" size="sm" className="mt-5 self-start px-0 font-normal">
                I want to set up everything on my own
              </Button>

              <div className="mt-auto flex items-center justify-between pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!canContinueFromIam}
                >
                  Continue
                </Button>
              </div>
            </div>
          </form>
        ) : activeStep === 3 ? (
          <form
            className="w-full overflow-hidden rounded-md border border-border lg:mt-16"
            onSubmit={(event) => {
              event.preventDefault()
              setActiveStep(4)
            }}
          >
            <StepPanelHeader
              step={3}
              title="S3 prefix & schemas"
              description="Specify the S3 prefix and schemas Lakewatch should use to classify your logs"
            />

            <div className="flex min-h-[370px] flex-col px-8 py-6">
              <p className="mb-5 text-sm leading-5 text-foreground">
                Enter the S3 prefix you would like Lakewatch to read data from followed by the
                schemas that classify data as it comes into Lakewatch. You can also add exclusion
                filters, which will exclude prefixes from being read.
              </p>

              <div className="flex flex-col gap-2">
                <Label htmlFor="s3-prefix">S3 Prefix</Label>
                <p className="text-hint text-muted-foreground">
                  Leave blank to create a wildcard (*) prefix and allow ingestion of all files in
                  the bucket.
                </p>
                <Input
                  id="s3-prefix"
                  value={s3Prefix}
                  onChange={(event) => setS3Prefix(event.target.value)}
                  onFocus={() =>
                    setS3Prefix((current) =>
                      current || "AWSLogs/123456789012/CloudTrail/us-west-2/"
                    )
                  }
                  onClick={() =>
                    setS3Prefix((current) =>
                      current || "AWSLogs/123456789012/CloudTrail/us-west-2/"
                    )
                  }
                />
              </div>

              <div className="mt-4 flex items-end gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Label>Schemas (optional)</Label>
                  <p className="text-hint text-muted-foreground">
                    Select schemas Lakewatch should use to parse S3 objects matching the S3 prefix.
                  </p>
                  {detectingSchemas ? (
                    <Skeleton className="h-8 w-full rounded" />
                  ) : (
                    <SchemaMultiSelect
                      selected={selectedSchemas}
                      onSelectedChange={setSelectedSchemas}
                      open={schemaOpen}
                      onOpenChange={setSchemaOpen}
                      query={schemaQuery}
                      onQueryChange={setSchemaQuery}
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={detectSchemasDisabled}
                  onClick={detectSchemas}
                >
                  {detectingSchemas ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <DbIcon icon={SparkleIcon} color="ai" size={16} />
                  )}
                  Detect schemas
                </Button>
              </div>

              <div className="mt-auto flex items-center justify-between pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveStep(2)}
                >
                  Back
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Continue
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <form
            className="w-full overflow-hidden rounded-md border border-border lg:mt-16"
            onSubmit={(event) => {
              event.preventDefault()
              router.push(
                `/lakewatch/datasources/${encodeURIComponent(
                  datasourceName.trim() || "lakewatch-account-us-west-2"
                )}`
              )
            }}
          >
            <StepPanelHeader
              step={4}
              title="Everything looks good!"
              description="Your configured stack was deployed successfully and Lakewatch now has permissions to pull data."
            />

            <div className="flex min-h-[512px] flex-col px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="source-alarm">
                  Set an alarm in case this source does not process any events?
                </Label>
                <Switch
                  id="source-alarm"
                  checked={alarmEnabled}
                  onCheckedChange={setAlarmEnabled}
                />
              </div>

              {alarmEnabled ? (
                <div className="mt-5 flex items-end justify-between gap-6">
                  <p className="max-w-[330px] text-sm leading-5 text-foreground">
                    How long should Lakewatch wait before it sends you an alert that no events have
                    been processed?
                  </p>
                  <div className="flex items-end gap-2">
                    <div className="flex w-[72px] flex-col gap-2">
                      <Label htmlFor="alarm-number">Number</Label>
                      <Input
                        id="alarm-number"
                        type="number"
                        min="1"
                        value={alarmNumber}
                        onChange={(event) => setAlarmNumber(event.target.value)}
                      />
                    </div>
                    <div className="flex w-[104px] flex-col gap-2">
                      <Label>Period</Label>
                      <Select value={alarmPeriod} onValueChange={setAlarmPeriod}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hour(s)</SelectItem>
                          <SelectItem value="days">Day(s)</SelectItem>
                          <SelectItem value="weeks">Week(s)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="my-5 h-px bg-border" />

              <Label className="mb-2">Datasource name *</Label>
              <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-2">
                <Select value={catalog} onValueChange={setCatalog}>
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
              <p className="mt-1 text-hint text-muted-foreground">
                {catalog}.{schema}.{datasourceName || "datasource_name"}
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <Label>Run as</Label>
                <Select value={runAs} onValueChange={setRunAs}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beau.trincia@databricks.com">
                      Run datasource as: beau.trincia@databricks.com
                    </SelectItem>
                    <SelectItem value="lakewatch-service-principal">
                      Run datasource as: Lakewatch service principal
                    </SelectItem>
                    <SelectItem value="security-platform@databricks.com">
                      Run datasource as: security-platform@databricks.com
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="mt-5 text-sm leading-5 text-foreground">
                You can now visit your datasource where you can monitor ingestion and make edits
                using the button below. Although setup is complete, please keep in mind that{" "}
                <span className="text-[var(--warning)]">it may take a few minutes</span> for data to
                be imported from your source.
              </p>

              <div className="mt-auto flex items-center justify-between pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveStep(3)}
                >
                  Back
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  View datasource
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

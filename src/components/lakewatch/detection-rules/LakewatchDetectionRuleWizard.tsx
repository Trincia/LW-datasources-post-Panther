"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Check, Code2, Database, UserRound } from "lucide-react"

import { InfoIcon } from "@/components/icons"
import { getDetectionRule } from "@/components/lakewatch/detection-rules/detectionRuleDetails"
import type { DetectionSeverity } from "@/components/lakewatch/detection-rules/detectionRulesList"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const STEPS = ["Rule & Input", "MITRE ATT&CK", "Signal output", "Processing"] as const
const SEVERITIES = ["Informational", "Low", "Medium", "High", "Critical"] as const
const FIDELITIES = ["Development", "Investigative", "Medium", "High"] as const

export function LakewatchDetectionRuleWizard() {
  const { ruleId } = useParams<{ ruleId: string }>()
  const router = useRouter()
  const rule = getDetectionRule(ruleId)
  const [activeStep, setActiveStep] = React.useState(1)
  const [active, setActive] = React.useState(rule?.active ?? true)
  const [suppress, setSuppress] = React.useState(false)
  const [suppressUntil, setSuppressUntil] = React.useState("")
  const [name, setName] = React.useState(rule?.name ?? "")
  const [description, setDescription] = React.useState(rule?.description ?? "")
  const [query, setQuery] = React.useState(rule?.query ?? "")
  const [tactic, setTactic] = React.useState(rule?.mitreTactic ?? "")
  const [technique, setTechnique] = React.useState(rule?.mitreTechnique ?? "")
  const [subtechnique, setSubtechnique] = React.useState(rule?.mitreSubtechnique ?? "")
  const [summary, setSummary] = React.useState(rule?.summary ?? "")
  const [includeAllData, setIncludeAllData] = React.useState(true)
  const [deduplication, setDeduplication] = React.useState(true)
  const [severity, setSeverity] = React.useState(rule?.severity ?? "Medium")
  const [fidelity, setFidelity] = React.useState(
    rule?.fidelity === "Low" ? "Investigative" : rule?.fidelity ?? "Medium"
  )
  const [category, setCategory] = React.useState(rule?.category ?? "")
  const [objective, setObjective] = React.useState(rule?.objective ?? "")

  if (!rule) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <h1 className={PAGE_TITLE_SEMIBOLD}>Detection rule not found</h1>
        <Button variant="default" size="sm" asChild>
          <Link href="/lakewatch/detection">Back to detection rules</Link>
        </Button>
      </div>
    )
  }

  const goNext = () => setActiveStep((step) => Math.min(STEPS.length, step + 1))
  const goBack = () => setActiveStep((step) => Math.max(1, step - 1))

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/lakewatch/detection">Detection rules</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/lakewatch/detection/${rule.id}`}>{rule.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className={PAGE_TITLE_SEMIBOLD}>Edit detection rule</h1>
        </div>
      </div>

      <div className="mt-5 grid min-h-0 flex-1 gap-8 lg:grid-cols-[220px_minmax(0,920px)] lg:justify-center">
        <WizardProgress
          activeStep={activeStep}
          name={name}
          location={`${rule.catalog}.${rule.schema}`}
          severity={severity}
          fidelity={fidelity}
          schedule={rule.scheduleMinutes}
        />

        <form
          className="flex min-h-0 flex-col overflow-hidden rounded-md border border-border"
          onSubmit={(event) => {
            event.preventDefault()
            if (activeStep < STEPS.length) goNext()
            else router.push(`/lakewatch/detection/${rule.id}`)
          }}
        >
          <div className="flex shrink-0 items-start justify-between gap-6 bg-muted p-6">
            <div>
              <p className="text-hint font-semibold text-foreground">Step {activeStep}</p>
              <h2 className="mt-4 text-lg font-semibold leading-6 text-foreground">
                {STEPS[activeStep - 1]}
              </h2>
              <p className="mt-1 text-hint text-muted-foreground">
                {getStepDescription(activeStep)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <ToggleRow label="Active" checked={active} onCheckedChange={setActive} />
              <SuppressControl
                checked={suppress}
                onCheckedChange={setSuppress}
                until={suppressUntil}
                onUntilChange={setSuppressUntil}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {activeStep === 1 ? (
              <RuleInputStep
                rule={rule}
                name={name}
                onNameChange={setName}
                description={description}
                onDescriptionChange={setDescription}
                query={query}
                onQueryChange={setQuery}
              />
            ) : null}
            {activeStep === 2 ? (
              <MitreStep
                tactic={tactic}
                onTacticChange={setTactic}
                technique={technique}
                onTechniqueChange={setTechnique}
                subtechnique={subtechnique}
                onSubtechniqueChange={setSubtechnique}
              />
            ) : null}
            {activeStep === 3 ? (
              <SignalOutputStep
                summary={summary}
                onSummaryChange={setSummary}
                includeAllData={includeAllData}
                onIncludeAllDataChange={setIncludeAllData}
                deduplication={deduplication}
                onDeduplicationChange={setDeduplication}
              />
            ) : null}
            {activeStep === 4 ? (
              <ProcessingStep
                rule={rule}
                severity={severity}
                onSeverityChange={setSeverity}
                fidelity={fidelity}
                onFidelityChange={setFidelity}
                category={category}
                onCategoryChange={setCategory}
                objective={objective}
                onObjectiveChange={setObjective}
              />
            ) : null}
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
            <Button variant="link" size="sm" asChild>
              <Link href={`/lakewatch/detection/${rule.id}`}>Cancel</Link>
            </Button>
            <div className="flex items-center gap-2">
              {activeStep > 1 ? (
                <Button type="button" variant="default" size="sm" onClick={goBack}>
                  Back
                </Button>
              ) : null}
              <Button type="submit" variant="primary" size="sm">
                {activeStep === STEPS.length ? "Save" : "Next"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function WizardProgress({
  activeStep,
  name,
  location,
  severity,
  fidelity,
  schedule,
}: {
  activeStep: number
  name: string
  location: string
  severity: string
  fidelity: string
  schedule: number
}) {
  return (
    <aside className="hidden min-w-0 lg:block">
      <ol className="m-0 list-none p-0">
        {STEPS.map((label, index) => {
          const step = index + 1
          const complete = step < activeStep
          const current = step === activeStep
          return (
            <li key={label} className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-hint font-semibold",
                    current && "border-primary bg-primary text-white",
                    complete && "border-primary bg-primary/10 text-primary",
                    !current && !complete && "border-border text-muted-foreground"
                  )}
                >
                  {complete ? <Check className="h-4 w-4" /> : step}
                </span>
                {step < STEPS.length ? (
                  <span className={cn("h-10 w-px", complete ? "bg-primary" : "bg-border")} />
                ) : null}
              </div>
              <div className="pt-2">
                <p className={cn("text-sm", current || complete ? "font-semibold text-primary" : "text-muted-foreground")}>
                  {label}
                </p>
                {step === 1 && activeStep > 1 ? (
                  <div className="mt-2 space-y-0.5 text-hint text-foreground">
                    <p><span className="font-semibold">Name:</span> {name}</p>
                    <p className="truncate"><span className="font-semibold">Location:</span> {location}</p>
                    <p><span className="font-semibold">Detection:</span> Inline</p>
                  </div>
                ) : null}
                {step === 4 && activeStep === 4 ? (
                  <div className="mt-2 text-hint text-foreground">
                    <p><span className="font-semibold">Severity:</span> {severity}</p>
                    <p><span className="font-semibold">Fidelity:</span> {fidelity}</p>
                    <p><span className="font-semibold">Schedule:</span> Every {schedule} m</p>
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}

function RuleInputStep({
  rule,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  query,
  onQueryChange,
}: {
  rule: NonNullable<ReturnType<typeof getDetectionRule>>
  name: string
  onNameChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  query: string
  onQueryChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Catalog *">
          <Input value={rule.catalog} disabled />
        </Field>
        <Field label="Schema *">
          <Input value={rule.schema} disabled />
        </Field>
        <Field label="Name *">
          <Input value={name} onChange={(event) => onNameChange(event.target.value)} />
        </Field>
        <Field label="Run as">
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={rule.runAs} readOnly />
          </div>
        </Field>
      </div>
      <p className="-mt-3 text-hint text-muted-foreground">
        The catalog, schema, name, and run-as identity define this detection rule. Location cannot be changed after creation.
      </p>
      <Field label="Description">
        <Textarea
          rows={3}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </Field>
      <Field label="Detection type">
        <div className="flex items-center justify-between rounded border border-border p-4">
          <div className="flex items-start gap-3">
            <Code2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">Scheduled</p>
              <p className="text-hint text-muted-foreground">
                Scheduled detection with a SQL query against tables.
              </p>
            </div>
          </div>
          <span className="size-3 rounded-full border-[3px] border-primary" aria-hidden />
        </div>
      </Field>
      <div className="rounded border border-border">
        <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2">
          <span className="text-hint font-semibold text-primary">Serverless</span>
          <span className="flex items-center gap-2 text-hint text-muted-foreground">
            <Database className="h-4 w-4" />
            {rule.catalog}.{rule.schema}
          </span>
        </div>
        <Textarea
          aria-label="Detection SQL query"
          className="min-h-[180px] resize-y rounded-none border-0 font-mono shadow-none focus-visible:ring-0"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
    </div>
  )
}

function MitreStep({
  tactic,
  onTacticChange,
  technique,
  onTechniqueChange,
  subtechnique,
  onSubtechniqueChange,
}: {
  tactic: string
  onTacticChange: (value: string) => void
  technique: string
  onTechniqueChange: (value: string) => void
  subtechnique: string
  onSubtechniqueChange: (value: string) => void
}) {
  return (
    <div className="grid gap-4 rounded-md border border-border p-4 md:grid-cols-2">
      <Field label="Taxonomy">
        <Select defaultValue="enterprise">
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="enterprise">Enterprise</SelectItem></SelectContent>
        </Select>
      </Field>
      <Field label="Tactic">
        <Input value={tactic} onChange={(event) => onTacticChange(event.target.value)} />
      </Field>
      <Field label="Technique">
        <Input value={technique} onChange={(event) => onTechniqueChange(event.target.value)} />
      </Field>
      <Field label="Sub-technique">
        <Input value={subtechnique} onChange={(event) => onSubtechniqueChange(event.target.value)} />
      </Field>
    </div>
  )
}

function SignalOutputStep({
  summary,
  onSummaryChange,
  includeAllData,
  onIncludeAllDataChange,
  deduplication,
  onDeduplicationChange,
}: {
  summary: string
  onSummaryChange: (value: string) => void
  includeAllData: boolean
  onIncludeAllDataChange: (value: boolean) => void
  deduplication: boolean
  onDeduplicationChange: (value: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field
        label="Summary string"
        hint="The signal summary is the title of the signal. SQL expressions in braces are substituted with values from the input row."
      >
        <Textarea
          rows={4}
          value={summary}
          onChange={(event) => onSummaryChange(event.target.value)}
        />
      </Field>
      <section className="rounded border border-border bg-muted p-4">
        <h3 className="text-sm font-semibold text-foreground">Context</h3>
        <p className="text-hint text-muted-foreground">
          Used to extract information from the source event and copy it into the signal.
        </p>
        <div className="mt-4">
          <ToggleRow
            label="Include all data"
            checked={includeAllData}
            onCheckedChange={onIncludeAllDataChange}
          />
        </div>
      </section>
      <section className="rounded border border-border bg-muted p-4">
        <h3 className="text-sm font-semibold text-foreground">Deduplication</h3>
        <p className="text-hint text-muted-foreground">
          Identical signals are deduplicated within the configured time window.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <ToggleRow
            label="Deduplicate signals"
            checked={deduplication}
            onCheckedChange={onDeduplicationChange}
          />
          <Field label="Deduplication time window" hint="Automatically derived from the rule schedule.">
            <Select defaultValue="automatic">
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">Automatic (recommended)</SelectItem>
                <SelectItem value="one-hour">1 hour</SelectItem>
                <SelectItem value="one-day">1 day</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>
    </div>
  )
}

function ProcessingStep({
  rule,
  severity,
  onSeverityChange,
  fidelity,
  onFidelityChange,
  category,
  onCategoryChange,
  objective,
  onObjectiveChange,
}: {
  rule: NonNullable<ReturnType<typeof getDetectionRule>>
  severity: DetectionSeverity
  onSeverityChange: (value: DetectionSeverity) => void
  fidelity: string
  onFidelityChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  objective: string
  onObjectiveChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="Severity *">
        <ToggleGroup
          type="single"
          variant="outline"
          value={severity}
          onValueChange={(value) => value && onSeverityChange(value as DetectionSeverity)}
          className="w-full"
        >
          {SEVERITIES.map((value) => (
            <ToggleGroupItem key={value} value={value} className="flex-1">
              {value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>
      <Field label="Fidelity *">
        <ToggleGroup
          type="single"
          variant="outline"
          value={fidelity}
          onValueChange={(value) => value && onFidelityChange(value)}
          className="w-full"
        >
          {FIDELITIES.map((value) => (
            <ToggleGroupItem key={value} value={value} className="flex-1">
              {value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>
      <Field label="Category *">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Credential Access", "Defense Evasion", "Exfiltration", "Identity", "Initial Access", "Persistence", "Privilege Escalation"].map((value) => (
              <SelectItem key={value} value={value}>{value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Objective">
        <Textarea
          rows={3}
          value={objective}
          onChange={(event) => onObjectiveChange(event.target.value)}
        />
      </Field>
      <Field label="Annotations" hint="Annotations add identifying tags to rules for searching and organization.">
        <div className="flex gap-2">
          <Input value="environment" readOnly aria-label="Annotation key" />
          <Input value={rule.annotations.join(", ")} readOnly aria-label="Annotation value" />
        </div>
      </Field>
      <Field label="Schedule">
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="at-least">
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="at-least">At least every</SelectItem></SelectContent>
          </Select>
          <Input className="w-20" type="number" defaultValue={rule.scheduleMinutes} />
          <Select defaultValue="minutes">
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="minutes">Minutes</SelectItem></SelectContent>
          </Select>
        </div>
      </Field>
      <div>
        <p className="text-sm font-semibold text-foreground">Job grouping</p>
        <p className="mt-1 text-sm text-foreground">{rule.jobGrouping}</p>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {hint ? <p className="text-hint text-muted-foreground">{hint}</p> : null}
      {children}
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-hint font-semibold text-foreground">{label}</span>
      <Switch size="sm" checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  )
}

function SuppressControl({
  checked,
  onCheckedChange,
  until,
  onUntilChange,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  until: string
  onUntilChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="About suppress"
            >
              <InfoIcon size={16} className="text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            Pause this detection until a specified time.
          </TooltipContent>
        </Tooltip>
        <span className="text-hint font-semibold text-foreground">Suppress</span>
        <Switch
          size="sm"
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label="Suppress"
        />
      </div>
      {checked ? (
        <div className="flex items-center gap-2">
          <label className="flex h-8 items-center gap-2 rounded border border-input bg-background px-3">
            <span className="text-hint font-semibold text-foreground">until:</span>
            <input
              type="datetime-local"
              value={until}
              onChange={(event) => onUntilChange(event.target.value)}
              aria-label="Suppress until"
              className="h-8 min-w-[196px] border-0 bg-transparent p-0 text-sm text-foreground outline-none [color-scheme:dark] placeholder:text-muted-foreground"
            />
          </label>
          <span className="text-hint text-muted-foreground">PDT</span>
        </div>
      ) : null}
    </div>
  )
}

function getStepDescription(step: number) {
  if (step === 1) return "Define the rule and input for the detection."
  if (step === 2) return "Add one or more MITRE ATT&CK mappings for this detection."
  if (step === 3) return "Define the output of the detection."
  return "Define the processing for the detection."
}

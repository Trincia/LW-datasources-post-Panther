"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon, TableIcon } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { LakewatchWarehouseSelector } from "@/components/lakewatch/LakewatchWarehouseSelector"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { cn } from "@/lib/utils"

type SourceCard = {
  id: string
  title: string
  description: string
  meta?: string
  badge?: string
  href?: string
  wide?: boolean
  icon: React.ReactNode
  categories: string[]
}

function SupportedSourceIcon({
  src,
  logoClassName,
}: {
  src: string
  logoClassName: string
}) {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-[6px] bg-white">
      <img src={src} alt="" className={logoClassName} aria-hidden />
    </div>
  )
}

const UNITY_CATALOG_SOURCES: SourceCard[] = [
  {
    id: "existing-table",
    title: "Existing table",
    description: "An existing table in your workspace Unity Catalog",
    href: "/lakewatch/datasources/new/existing-table",
    categories: ["Existing table", "Data platform", "Custom datasources"],
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-[rgba(2,179,2,0.13)]">
        <TableIcon size={16} className="text-[var(--success)]" />
      </div>
    ),
  },
  {
    id: "uc-volume",
    title: "Existing UC Volume",
    description: "Onboard UC Volume Storage as a datasource in Lakewatch.",
    href: "/lakewatch/datasources/new/uc-volume",
    categories: ["Cloud", "Custom datasources", "Data platform"],
    icon: <div className="size-8 shrink-0 rounded bg-pink-100" aria-hidden />,
  },
]

const OBJECT_STORAGE_SOURCES: SourceCard[] = [
  {
    id: "s3",
    title: "AWS S3 Bucket",
    description: "Onboard AWS S3 Bucket as a datasource in Lakewatch",
    href: "/lakewatch/datasources/new/aws-s3",
    categories: ["AWS", "Cloud", "Custom datasources"],
    icon: (
      <img
        src="/lakewatch/ingest-v2-logos/aws-s3.svg"
        alt=""
        className="size-8 shrink-0"
        aria-hidden
      />
    ),
  },
  {
    id: "sqs",
    title: "AWS SQS Queue",
    badge: "Recommended for large S3 volumes",
    description: "Onboard AWS SQS Queue as a datasource in Lakewatch",
    href: "/lakewatch/datasources/new/aws-sqs",
    categories: ["AWS", "Cloud", "Custom datasources"],
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-pink-100 text-hint font-semibold text-pink-700">
        SQS
      </div>
    ),
  },
  {
    id: "google-cloud-storage",
    title: "Google Cloud Storage",
    description: "Onboard Google Cloud Storage as a datasource in Lakewatch.",
    href: "/lakewatch/datasources/new/google-cloud-storage",
    categories: ["Cloud", "Custom datasources"],
    icon: (
      <img
        src="/lakewatch/ingest-v2-logos/google-cloud-storage.png"
        alt=""
        className="size-8 shrink-0 object-contain"
        aria-hidden
      />
    ),
  },
  {
    id: "azure-blob-storage",
    title: "Azure Blob Storage",
    description: "Onboard Azure Blob Storage as a datasource in Lakewatch.",
    href: "/lakewatch/datasources/new/azure-blob-storage",
    categories: ["Cloud", "Custom datasources"],
    icon: (
      <img
        src="/lakewatch/ingest-v2-logos/azure-blob-storage.svg"
        alt=""
        className="h-8 w-9 shrink-0 object-contain"
        aria-hidden
      />
    ),
  },
]

const SUPPORTED_FORMATS: SourceCard[] = [
  {
    id: "slack",
    title: "Slack",
    description: "Monitor your team’s communication platform",
    href: "/lakewatch/datasources/new/connect/slack",
    categories: ["SaaS", "Application"],
    icon: (
      <SupportedSourceIcon
        src="/lakewatch/ingest-v2-logos/slack.svg"
        logoClassName="h-[23px] w-6"
      />
    ),
  },
  {
    id: "1password",
    title: "1Password",
    description:
      "Gain visibility into abnormal user activity in your organization’s 1Password account.",
    href: "/lakewatch/datasources/new/connect/1password",
    categories: ["SaaS", "Security"],
    icon: (
      <SupportedSourceIcon
        src="/lakewatch/ingest-v2-logos/1password.svg"
        logoClassName="size-[23px]"
      />
    ),
  },
  {
    id: "m365",
    title: "Microsoft 365",
    description: "Monitor your team’s activity in Microsoft 365",
    href: "/lakewatch/datasources/new/connect/m365",
    categories: ["SaaS", "Application"],
    icon: (
      <SupportedSourceIcon
        src="/lakewatch/ingest-v2-logos/microsoft-365.svg"
        logoClassName="h-[26px] w-[27px]"
      />
    ),
  },
  {
    id: "crowdstrike",
    title: "CrowdStrike Event Streams",
    description: "Monitor available detection, event, incident and audit data from CrowdStrike",
    href: "/lakewatch/datasources/new/connect/crowdstrike",
    categories: ["Security", "Endpoint"],
    icon: (
      <SupportedSourceIcon
        src="/lakewatch/ingest-v2-logos/crowdstrike.svg"
        logoClassName="size-[25px]"
      />
    ),
  },
]

const MONO_COLORS = [
  "bg-coral-100 text-coral-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-lemon-100 text-lemon-700",
  "bg-lime-100 text-lime-700",
  "bg-pink-100 text-pink-700",
  "bg-purple-100 text-purple-700",
  "bg-turquoise-100 text-turquoise-700",
  "bg-brown-100 text-brown-700",
]

function MonogramIcon({ label, colorClass }: { label: string; colorClass: string }) {
  const initials = label
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md text-hint font-semibold",
        colorClass
      )}
      aria-hidden
    >
      {initials}
    </div>
  )
}

const BRAND_DOMAINS: Record<string, string> = {
  appomni: "appomni.com",
  auth0: "auth0.com",
  bedrock: "aws.amazon.com",
  "carbon-black-audit": "carbonblack.com",
  "carbon-black-streaming": "carbonblack.com",
  envoy: "envoyproxy.io",
  "iru-kandji": "kandji.io",
  island: "island.io",
  "defender-xdr": "microsoft.com",
  notion: "notion.so",
  okta: "okta.com",
  "palo-alto-ngfw": "paloaltonetworks.com",
  proofpoint: "proofpoint.com",
  "push-security": "pushsecurity.com",
  "sublime-security": "sublime.security",
  "tenable-vm": "tenable.com",
  "windows-event-logs": "microsoft.com",
  "google-workspace": "google.com",
  heroku: "heroku.com",
  duo: "duo.com",
  socradar: "socradar.io",
  "aws-vpc": "aws.amazon.com",
  "hex-webhook": "hex.tech",
  "wiz-webhook": "wiz.io",
  "aws-cloudfront": "aws.amazon.com",
  "aws-cloudtrail": "aws.amazon.com",
  "amazon-security-lake": "aws.amazon.com",
  "aws-guardduty": "aws.amazon.com",
  "aws-security-hub": "aws.amazon.com",
  "zscaler-zia": "zscaler.com",
  "zscaler-zpa": "zscaler.com",
}

function BrandIcon({
  domain,
  label,
  colorClass,
}: {
  domain?: string
  label: string
  colorClass: string
}) {
  const [failed, setFailed] = React.useState(false)

  if (!domain || failed) {
    return <MonogramIcon label={label} colorClass={colorClass} />
  }

  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white">
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        aria-hidden
        className="size-5 object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

const EXTRA_SUPPORTED_FORMATS: Omit<SourceCard, "icon" | "href">[] = [
  {
    id: "appomni",
    title: "AppOmni",
    description:
      "With AppOmni data ingested by Panther, your Security Operations teams can provide detections across all your SaaS platforms.",
    categories: ["SaaS", "Security"],
  },
  {
    id: "auditd",
    title: "Auditd",
    description: "Monitor system-level activities in your Linux environment.",
    categories: ["Endpoint"],
  },
  {
    id: "auth0",
    title: "Auth0",
    description: "Inspect your Auth0 event logs to detect suspicious activity.",
    categories: ["Identity", "SaaS"],
  },
  {
    id: "bedrock",
    title: "Bedrock Model Invocation",
    description: "Monitor and correlate suspicious Bedrock Model Invocations",
    categories: ["AWS", "AI"],
  },
  {
    id: "carbon-black-audit",
    title: "Carbon Black Audit Logs",
    description: "Inspect Carbon Black audit logs for suspicious activity.",
    categories: ["Endpoint", "Security"],
  },
  {
    id: "carbon-black-streaming",
    title: "Carbon Black Data Streaming",
    description: "Analyze Carbon Black data for threat detection.",
    categories: ["Endpoint", "Security"],
  },
  {
    id: "envoy",
    title: "Envoy",
    description: "L7 proxy and communication bus for large modern service oriented architectures.",
    categories: ["Network"],
  },
  {
    id: "iru-kandji",
    title: "Iru (Kandji)",
    description: "Monitor your team’s Iru logs",
    categories: ["Endpoint"],
  },
  {
    id: "island",
    title: "Island",
    description: "Monitor Island browser security and endpoint activity events",
    categories: ["Endpoint", "Security"],
  },
  {
    id: "defender-xdr",
    title: "Microsoft Defender XDR",
    description: "Unified threat detection and response across your Microsoft environment",
    categories: ["Microsoft", "Security"],
  },
  {
    id: "notion",
    title: "Notion",
    description: "Monitor your team’s Notion workspaces",
    categories: ["SaaS", "Application"],
  },
  {
    id: "okta",
    title: "Okta",
    description: "Inspect your Okta audit logs to detect suspicious activity.",
    categories: ["Identity", "SaaS"],
  },
  {
    id: "palo-alto-ngfw",
    title: "Palo Alto Next-Generation Firewall",
    description:
      "Ingest Palo Alto Firewall logs into Panther for network security monitoring and threat detection.",
    categories: ["Network", "Security"],
  },
  {
    id: "proofpoint",
    title: "Proofpoint",
    description: "Inspect Proofpoint logs to detect suspicious activity.",
    categories: ["Email", "Security"],
  },
  {
    id: "push-security",
    title: "Push Security",
    description:
      "Detect and stop identity attacks with Panther’s integration with Push Security. Use Push’s browser telemetry to monitor your identity attack surface in real-time.",
    categories: ["Identity", "Security"],
  },
  {
    id: "sublime-security",
    title: "Sublime Security",
    description: "Monitor and correlate suspicious email behavior, and Sublime audit logs",
    categories: ["Email", "Security"],
  },
  {
    id: "tenable-vm",
    title: "Tenable Vulnerability Management",
    description: "Dive deep into vulnerability data with Tenable Vulnerability Scanning.",
    categories: ["Security"],
  },
  {
    id: "windows-event-logs",
    title: "Windows Event Logs",
    description: "Monitor Windows application, system, and security notifications.",
    categories: ["Endpoint", "Microsoft"],
  },
  {
    id: "google-workspace",
    title: "Google Workspace",
    description: "Monitor activity across Google Workspace.",
    categories: ["SaaS", "Application"],
  },
  {
    id: "heroku",
    title: "Heroku",
    description: "Monitor your team’s Heroku applications",
    categories: ["Cloud", "Application"],
  },
  {
    id: "duo",
    title: "Duo",
    description: "Monitor your IdP for suspicious activity",
    categories: ["Identity"],
  },
  {
    id: "socradar",
    title: "SOCRadar",
    description: "Monitor SOCRadar threat intelligence alerts and dark web findings",
    categories: ["Security", "Threat Intel"],
  },
  {
    id: "aws-vpc",
    title: "AWS VPC",
    description:
      "Capture information about the IP traffic going to and from network interfaces in your VPC",
    categories: ["AWS", "Network"],
  },
  {
    id: "hex-webhook",
    title: "Hex Webhook",
    description: "Stream your Hex analytics platform audit events to Panther",
    categories: ["SaaS"],
  },
  {
    id: "wiz-webhook",
    title: "Wiz Webhook",
    description: "Monitor your Wiz security findings via webhook notifications",
    categories: ["Cloud", "Security"],
  },
  {
    id: "aws-cloudfront",
    title: "AWS CloudFront",
    description: "Inspect the access logs that CloudFront generates",
    categories: ["AWS"],
  },
  {
    id: "aws-cloudtrail",
    title: "AWS CloudTrail",
    description: "Inspect the logs that CloudTrail generates",
    categories: ["AWS"],
  },
  {
    id: "amazon-security-lake",
    title: "Amazon Security Lake",
    description: "Inspect the logs that Amazon Security Lake generates",
    categories: ["AWS", "Security"],
  },
  {
    id: "aws-guardduty",
    title: "AWS GuardDuty",
    description: "Detect unauthorized and unexpected activity in your AWS environment",
    categories: ["AWS", "Security"],
  },
  {
    id: "aws-security-hub",
    title: "AWS Security Hub",
    description: "Automate AWS security checks and centralize security alerts",
    categories: ["AWS", "Security"],
  },
  {
    id: "zscaler-zia",
    title: "Zscaler ZIA",
    description: "Monitor your Zscaler ZIA logs for suspicious activity",
    categories: ["Network", "Security"],
  },
  {
    id: "zscaler-zpa",
    title: "Zscaler ZPA",
    description: "Monitor your Zscaler ZPA logs for suspicious activity",
    categories: ["Network", "Security"],
  },
]

const ALL_SUPPORTED_FORMATS: SourceCard[] = [
  ...SUPPORTED_FORMATS,
  ...EXTRA_SUPPORTED_FORMATS.map((card, index) => ({
    ...card,
    href: `/lakewatch/datasources/new/connect/${card.id}`,
    icon: (
      <BrandIcon
        domain={BRAND_DOMAINS[card.id]}
        label={card.title}
        colorClass={MONO_COLORS[index % MONO_COLORS.length]}
      />
    ),
  })),
]

function SectionHeader({ title, description }: { title: string; description: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h2 className="text-lg font-semibold leading-6 text-foreground">{title}</h2>
      <div className="max-w-4xl text-sm leading-5 text-muted-foreground">{description}</div>
    </div>
  )
}

function SourceCardTile({ card }: { card: SourceCard }) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        {card.icon}
        <h3 className="truncate text-lg font-semibold leading-6 text-foreground">{card.title}</h3>
        {card.badge ? (
          <Badge variant="indigo" className="shrink-0">
            {card.badge}
          </Badge>
        ) : null}
      </div>
      <p className="text-sm leading-5 text-muted-foreground">{card.description}</p>
      {card.meta ? (
        <p className="text-sm leading-5 text-foreground">
          {card.meta.split("|").map((part, index) => (
            <React.Fragment key={index}>
              {index > 0 ? <span className="text-muted-foreground"> | </span> : null}
              {part.trim()}
            </React.Fragment>
          ))}
        </p>
      ) : null}
    </>
  )

  if (card.href) {
    return (
      <Link
        href={card.href}
        className={cn(
          "flex flex-1 flex-col gap-3 rounded-md bg-muted-foreground/20 p-5 outline-none transition-colors hover:bg-muted-foreground/25 focus-visible:ring-2 focus-visible:ring-ring",
          card.wide && "lg:col-span-2",
        )}
      >
        {content}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-3 rounded-md bg-muted-foreground/20 p-5",
        card.wide && "lg:col-span-2",
      )}
    >
      {content}
    </div>
  )
}

function filterCards(cards: SourceCard[], query: string, category: string | null) {
  const q = query.trim().toLowerCase()
  return cards.filter((card) => {
    const matchesCategory = !category || card.categories.includes(category)
    const haystack = [card.title, card.description, card.meta ?? "", ...card.categories]
      .join(" ")
      .toLowerCase()
    const matchesQuery = !q || haystack.includes(q)
    return matchesCategory && matchesQuery
  })
}

/** Figma 2499:116825 — Add new datasource (dark) */
export function LakewatchAddDatasourceView() {
  const [search, setSearch] = React.useState("")
  const [activeCategory] = React.useState<string | null>(null)

  const unityCatalogVisible = filterCards(UNITY_CATALOG_SOURCES, search, activeCategory)
  const objectStorageVisible = filterCards(OBJECT_STORAGE_SOURCES, search, activeCategory)
  const supportedVisible = filterCards(ALL_SUPPORTED_FORMATS, search, activeCategory)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-10 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/lakewatch/datasources">Datasources</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className={PAGE_TITLE_SEMIBOLD}>Add new datasource</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LakewatchWarehouseSelector />
        </div>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[1120px] flex-col items-center gap-2 text-center">
        <h2 className="text-[22px] font-semibold leading-7 text-foreground">
          Where is the data you want to onboard?
        </h2>
        <p className="text-sm text-foreground">
          You can search by service, category or log types
        </p>
        <div className="relative mt-4 w-full max-w-[369px]">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-9"
            aria-label="Search datasources"
          />
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>

      {unityCatalogVisible.length > 0 ? (
        <section className="mx-auto mt-8 flex w-full max-w-[1120px] flex-col gap-4">
          <SectionHeader
            title="Unity Catalog"
            description="Onboard data that already lives in your Databricks workspace, such as Unity Catalog tables and volumes."
          />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {unityCatalogVisible.map((card) => (
              <SourceCardTile key={card.id} card={card} />
            ))}
          </div>
        </section>
      ) : null}

      {objectStorageVisible.length > 0 ? (
        <section className="mx-auto mt-10 flex w-full max-w-[1120px] flex-col gap-4">
          <SectionHeader
            title="Object Storage & Message Queues"
            description={
              <>
                Define your own custom schemas or onboard logs from cloud object storage and message
                queues. You can also ingest custom logs into Lakewatch via a{" "}
                <Link href="#" className="text-primary hover:underline">
                  Data Transport
                </Link>
                .
              </>
            }
          />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {objectStorageVisible.map((card) => (
              <SourceCardTile key={card.id} card={card} />
            ))}
          </div>
        </section>
      ) : null}

      {supportedVisible.length > 0 ? (
        <section className="mx-auto mt-10 flex w-full max-w-[1120px] flex-col gap-4">
          <SectionHeader
            title="API Connectors"
            description="Lakewatch supports log ingestion either through native puller integrations or via custom integrations built with one of the supported Data Transports."
          />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {supportedVisible.map((card) => (
              <SourceCardTile key={card.id} card={card} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

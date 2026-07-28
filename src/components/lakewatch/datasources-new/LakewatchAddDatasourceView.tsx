"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon, TableIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
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

const CATEGORIES = [
  "AWS",
  "Application",
  "Cloud",
  "Custom datasources",
  "Data platform",
  "Endpoint",
  "Existing table",
  "Network",
  "SaaS",
  "Security",
  "Vulnerability assessment",
] as const

type SourceCard = {
  id: string
  title: string
  description: string
  meta?: string
  href?: string
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

const CUSTOM_FORMATS: SourceCard[] = [
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
    description: "Onboard AWS SQS Queue as a datasource in Lakewatch",
    categories: ["AWS", "Cloud", "Custom datasources"],
    icon: (
      <div className="flex size-8 items-center justify-center rounded-md bg-[rgba(240,1,150,0.13)] text-[13px] font-semibold text-[#f00196]">
        SQS
      </div>
    ),
  },
]

const SUPPORTED_FORMATS: SourceCard[] = [
  {
    id: "slack",
    title: "Slack",
    description: "Monitor your team’s communication platform",
    meta: "Native puller | 22 detections | 3 log types",
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
    meta: "Native puller | 3 detections | 3 log types",
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
    meta: "Native puller | 4 detections | 5 log types",
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
    meta: "Native puller | 15 detections | 1 log type",
    categories: ["Security", "Endpoint"],
    icon: (
      <SupportedSourceIcon
        src="/lakewatch/ingest-v2-logos/crowdstrike.svg"
        logoClassName="size-[25px]"
      />
    ),
  },
]

const EXISTING_TABLE: SourceCard = {
  id: "existing-table",
  title: "Existing table",
  description: "An existing table in your workspace",
  categories: ["Existing table", "Data platform"],
  icon: (
    <div className="flex size-8 items-center justify-center rounded-md bg-[rgba(2,179,2,0.13)]">
      <TableIcon size={16} className="text-[var(--success)]" />
    </div>
  ),
}

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
        className="flex flex-1 flex-col gap-3 rounded-md bg-muted-foreground/20 p-5 outline-none transition-colors hover:bg-muted-foreground/25 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-md bg-muted-foreground/20 p-5">
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
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)

  const customVisible = filterCards(CUSTOM_FORMATS, search, activeCategory)
  const supportedVisible = filterCards(SUPPORTED_FORMATS, search, activeCategory)
  const existingVisible = filterCards([EXISTING_TABLE], search, activeCategory)

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
        <LakewatchWarehouseSelector />
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[1120px] flex-col items-center gap-2 text-center">
        <h2 className="text-[22px] font-semibold leading-7 text-foreground">
          What type of logs do you want to monitor with this datasource?
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

      <div className="mx-auto mt-6 flex w-full max-w-[1120px] flex-wrap items-center gap-2">
        <span className="text-sm text-foreground">Filter by category</span>
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            type="button"
            variant="default"
            size="sm"
            className={cn(
              "font-normal",
              activeCategory === category && "border-primary bg-primary/5 text-primary"
            )}
            onClick={() =>
              setActiveCategory((current) => (current === category ? null : category))
            }
          >
            {category}
          </Button>
        ))}
      </div>

      {customVisible.length > 0 ? (
        <section className="mx-auto mt-8 flex w-full max-w-[1120px] flex-col gap-4">
          <SectionHeader
            title="Custom formats"
            description={
              <>
                Define your own custom schemas. You can ingest custom logs into Lakewatch via a{" "}
                <Link href="#" className="text-primary hover:underline">
                  Data Transport
                </Link>
                . Your custom schema will then normalize and classify the data.
              </>
            }
          />
          <div className="flex flex-col gap-2.5 sm:flex-row">
            {customVisible.map((card) => (
              <SourceCardTile key={card.id} card={card} />
            ))}
          </div>
        </section>
      ) : null}

      {supportedVisible.length > 0 ? (
        <section className="mx-auto mt-10 flex w-full max-w-[1120px] flex-col gap-4">
          <SectionHeader
            title="Supported formats"
            description="Lakewatch supports log ingestion either through native puller integrations or via custom integrations built with one of the supported Data Transports."
          />
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              {supportedVisible.slice(0, 2).map((card) => (
                <SourceCardTile key={card.id} card={card} />
              ))}
            </div>
            {supportedVisible.length > 2 ? (
              <div className="flex flex-col gap-2.5 sm:flex-row">
                {supportedVisible.slice(2).map((card) => (
                  <SourceCardTile key={card.id} card={card} />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {existingVisible.length > 0 ? (
        <section className="mx-auto mt-10 flex w-full max-w-[1120px] flex-col gap-4">
          <SectionHeader
            title="Existing table"
            description="Lakewatch supports log ingestion of an existing table in your workspace."
          />
          <SourceCardTile card={EXISTING_TABLE} />
        </section>
      ) : null}
    </div>
  )
}

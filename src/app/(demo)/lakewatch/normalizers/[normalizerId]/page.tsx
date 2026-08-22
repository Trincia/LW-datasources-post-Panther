"use client"

import Link from "next/link"
import { use } from "react"
import { LakewatchAppShell } from "@/components/lakewatch"
import { PAGE_TITLE_SEMIBOLD } from "@/components/lakewatch/pageTitleStyles"
import { Button } from "@/components/ui/button"

export default function LakewatchNormalizerDetailPage({
  params,
}: {
  params: Promise<{ normalizerId: string }>
}) {
  const { normalizerId } = use(params)
  const name = decodeURIComponent(normalizerId)

  return (
    <LakewatchAppShell
      activeItem="normalizers"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <h1 className={PAGE_TITLE_SEMIBOLD}>{name}</h1>
        <Button variant="link" size="sm" asChild className="w-fit px-0">
          <Link href="/lakewatch/normalizers">Back to Normalizers</Link>
        </Button>
      </div>
    </LakewatchAppShell>
  )
}

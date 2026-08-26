"use client"

import { use } from "react"
import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchNormalizedDataDetailView } from "@/components/lakewatch/normalized-data/LakewatchNormalizedDataDetailView"

export default function LakewatchNormalizedDataDetailPage({
  params,
}: {
  params: Promise<{ modelId: string }>
}) {
  const { modelId } = use(params)

  return (
    <LakewatchAppShell
      activeItem="normalized-data"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchNormalizedDataDetailView modelId={decodeURIComponent(modelId)} />
    </LakewatchAppShell>
  )
}

"use client"

import { use } from "react"
import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchDataModelDetailView } from "@/components/lakewatch/data-models/LakewatchDataModelDetailView"

export default function LakewatchDataModelDetailPage({
  params,
}: {
  params: Promise<{ modelId: string }>
}) {
  const { modelId } = use(params)

  return (
    <LakewatchAppShell
      activeItem="data-models"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchDataModelDetailView modelId={decodeURIComponent(modelId)} />
    </LakewatchAppShell>
  )
}

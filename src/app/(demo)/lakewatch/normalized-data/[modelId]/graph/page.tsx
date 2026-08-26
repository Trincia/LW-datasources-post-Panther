"use client"

import { use } from "react"
import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchNormalizedDataGraphView } from "@/components/lakewatch/normalized-data/LakewatchNormalizedDataGraphView"

export default function LakewatchNormalizedDataGraphPage({
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
      <LakewatchNormalizedDataGraphView modelId={decodeURIComponent(modelId)} />
    </LakewatchAppShell>
  )
}

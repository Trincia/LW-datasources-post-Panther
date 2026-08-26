"use client"

import { use } from "react"
import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchNormalizedDataGraphView } from "@/components/lakewatch/normalized-data/LakewatchNormalizedDataGraphView"

export default function LakewatchNormalizedDataGraphPage({
  params,
  searchParams,
}: {
  params: Promise<{ modelId: string }>
  searchParams: Promise<{ highlight?: string }>
}) {
  const { modelId } = use(params)
  const { highlight } = use(searchParams)

  return (
    <LakewatchAppShell
      activeItem="normalized-data"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchNormalizedDataGraphView
        modelId={decodeURIComponent(modelId)}
        highlight={highlight}
      />
    </LakewatchAppShell>
  )
}

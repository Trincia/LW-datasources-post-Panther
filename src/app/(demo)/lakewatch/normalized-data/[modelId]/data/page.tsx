"use client"

import { use } from "react"
import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchNormalizedDataPreviewView } from "@/components/lakewatch/normalized-data/LakewatchNormalizedDataPreviewView"

export default function LakewatchNormalizedDataPreviewPage({
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
      <LakewatchNormalizedDataPreviewView modelId={decodeURIComponent(modelId)} />
    </LakewatchAppShell>
  )
}

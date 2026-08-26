"use client"

import { use } from "react"
import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchSourceDataPreviewView } from "@/components/lakewatch/normalized-data/LakewatchSourceDataPreviewView"

export default function LakewatchSourceDataPreviewPage({
  params,
}: {
  params: Promise<{ modelId: string; sourceId: string }>
}) {
  const { modelId, sourceId } = use(params)

  return (
    <LakewatchAppShell
      activeItem="normalized-data"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchSourceDataPreviewView
        modelId={decodeURIComponent(modelId)}
        sourceId={decodeURIComponent(sourceId)}
      />
    </LakewatchAppShell>
  )
}

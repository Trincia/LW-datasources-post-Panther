"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchDataModelsView } from "@/components/lakewatch/data-models/LakewatchDataModelsView"

export default function LakewatchDataModelsPage() {
  return (
    <LakewatchAppShell
      activeItem="data-models"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchDataModelsView />
    </LakewatchAppShell>
  )
}

"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchNormalizationSchemaView } from "@/components/lakewatch/datasources-new/LakewatchNormalizationSchemaView"

export default function LakewatchNormalizationSchemaPage() {
  return (
    <LakewatchAppShell
      activeItem="datasources"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchNormalizationSchemaView />
    </LakewatchAppShell>
  )
}

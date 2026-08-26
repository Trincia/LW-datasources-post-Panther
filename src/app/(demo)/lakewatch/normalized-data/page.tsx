"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchNormalizedDataView } from "@/components/lakewatch/normalized-data/LakewatchNormalizedDataView"

export default function LakewatchNormalizedDataPage() {
  return (
    <LakewatchAppShell
      activeItem="normalized-data"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchNormalizedDataView />
    </LakewatchAppShell>
  )
}

"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchNormalizedDataCreateView } from "@/components/lakewatch/normalized-data/LakewatchNormalizedDataCreateView"

export default function LakewatchNormalizedDataCreatePage() {
  return (
    <LakewatchAppShell
      activeItem="normalized-data"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchNormalizedDataCreateView />
    </LakewatchAppShell>
  )
}

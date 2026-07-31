"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchSchemasView } from "@/components/lakewatch/schemas/LakewatchSchemasView"

export default function LakewatchSchemasPage() {
  return (
    <LakewatchAppShell
      activeItem="schemas"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchSchemasView />
    </LakewatchAppShell>
  )
}

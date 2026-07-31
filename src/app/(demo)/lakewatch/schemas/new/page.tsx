"use client"

import { LakewatchAppShell } from "@/components/lakewatch"
import { LakewatchCreateSchemaView } from "@/components/lakewatch/schemas/LakewatchCreateSchemaView"

export default function LakewatchCreateSchemaPage() {
  return (
    <LakewatchAppShell
      activeItem="schemas"
      workspace="Production"
      userInitial="J"
      mainClassName="relative flex flex-col overflow-hidden"
    >
      <LakewatchCreateSchemaView />
    </LakewatchAppShell>
  )
}
